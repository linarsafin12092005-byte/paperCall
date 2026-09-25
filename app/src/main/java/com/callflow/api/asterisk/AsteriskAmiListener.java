package com.callflow.api.asterisk;

import com.callflow.api.ami.AmiCallEventData;
import com.callflow.api.ami.AmiCallProcessor;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.asteriskjava.manager.ManagerConnection;
import org.asteriskjava.manager.ManagerConnectionFactory;
import org.asteriskjava.manager.ManagerEventListener;
import org.asteriskjava.manager.event.BridgeEnterEvent;
import org.asteriskjava.manager.event.DialEvent;
import org.asteriskjava.manager.event.HangupEvent;
import org.asteriskjava.manager.event.ManagerEvent;
import org.asteriskjava.manager.event.NewChannelEvent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
@ConditionalOnProperty(name = "asterisk.enabled", havingValue = "true", matchIfMissing = false)
public class AsteriskAmiListener implements ManagerEventListener {
    @Value("${asterisk.ami.host}")
    private String host;
    @Value("${asterisk.ami.port}")
    private int port;
    @Value("${asterisk.ami.username}")
    private String username;
    @Value("${asterisk.ami.password}")
    private String password;

    private final AmiCallProcessor processor;
    private final TelephonyStatusService statusService;
    private final Map<String, String> linkedIdsByUniqueId = new ConcurrentHashMap<>();
    private final ScheduledExecutorService reconnectExecutor = Executors.newSingleThreadScheduledExecutor(r -> {
        Thread thread = new Thread(r, "asterisk-ami-reconnect");
        thread.setDaemon(true);
        return thread;
    });
    private volatile ManagerConnection connection;
    private volatile long retrySeconds = 1;

    public AsteriskAmiListener(AmiCallProcessor processor, TelephonyStatusService statusService) {
        this.processor = processor;
        this.statusService = statusService;
    }

    @PostConstruct
    public void start() {
        reconnectExecutor.execute(this::connectSafely);
    }

    private synchronized void connectSafely() {
        if (connection != null) return;
        try {
            ManagerConnectionFactory factory = new ManagerConnectionFactory(host, port, username, password);
            ManagerConnection candidate = factory.createManagerConnection();
            candidate.addEventListener(this);
            candidate.login();
            connection = candidate;
            statusService.markConnected();
            retrySeconds = 1;
            System.out.println("[Asterisk AMI] connected host=" + host + " port=" + port);
        } catch (Exception exception) {
            statusService.markDisconnected();
            System.err.println("[Asterisk AMI] connection failed; retrying with backoff");
            long delay = retrySeconds;
            retrySeconds = Math.min(retrySeconds * 2, 60);
            reconnectExecutor.schedule(this::connectSafely, delay, TimeUnit.SECONDS);
        }
    }

    @PreDestroy
    public void stop() {
        statusService.markDisconnected();
        reconnectExecutor.shutdownNow();
        ManagerConnection current = connection;
        if (current != null) {
            try {
                current.logoff();
            } catch (Exception ignored) {
                // shutdown path
            }
        }
    }

    @Override
    public void onManagerEvent(ManagerEvent event) {
        try {
            if (event instanceof NewChannelEvent newChannel) {
                String linkedId = newChannel.getLinkedid();
                remember(newChannel.getUniqueId(), linkedId);
                process("NewChannel", linkedId, newChannel.getUniqueId(),
                        extension(newChannel.getCallerIdNum()), extension(newChannel.getExten()),
                        null, null, newChannel);
            } else if (event instanceof DialEvent dial) {
                String linkedId = linkedId(dial.getSrcUniqueId(), dial.getUniqueId());
                remember(dial.getDestUniqueId(), linkedId);
                String type = DialEvent.SUBEVENT_END.equalsIgnoreCase(dial.getSubEvent())
                        ? "DialEnd" : "DialBegin";
                process(type, linkedId, first(dial.getUniqueId(), dial.getSrcUniqueId()),
                        extension(first(dial.getSrc(), dial.getCallerId())),
                        extension(first(dial.getDestination(), dial.getDestChannel())),
                        dial.getDialStatus(), null, dial);
            } else if (event instanceof BridgeEnterEvent bridge) {
                process("BridgeEnter", bridge.getLinkedId(), bridge.getUniqueId(),
                        null, null, null, null, bridge);
            } else if (event instanceof HangupEvent hangup) {
                process("Hangup", hangup.getLinkedId(), hangup.getUniqueId(),
                        extension(hangup.getCallerIdNum()), extension(hangup.getExten()),
                        null, hangup.getCause(), hangup);
            }
        } catch (RuntimeException exception) {
            System.err.println("[Asterisk AMI] event processing failed safely");
        }
    }

    private void process(String type, String linkedId, String uniqueId, String caller, String callee,
                         String dialStatus, Integer cause, ManagerEvent event) {
        if (linkedId == null || linkedId.isBlank()) return;
        LocalDateTime timestamp = event.getDateReceived() == null
                ? LocalDateTime.now()
                : event.getDateReceived().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
        processor.process(new AmiCallEventData(type, linkedId, uniqueId, caller, callee,
                dialStatus, cause, timestamp, event.getSequenceNumber()));
    }

    private void remember(String uniqueId, String linkedId) {
        if (uniqueId != null && linkedId != null) linkedIdsByUniqueId.put(uniqueId, linkedId);
    }

    private String linkedId(String sourceUniqueId, String uniqueId) {
        return first(linkedIdsByUniqueId.get(sourceUniqueId), linkedIdsByUniqueId.get(uniqueId));
    }

    private String extension(String value) {
        if (value == null) return null;
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("(\\d{3,8})").matcher(value);
        return matcher.find() ? matcher.group(1) : null;
    }

    private String first(String first, String second) {
        return first != null && !first.isBlank() ? first : second;
    }
}
