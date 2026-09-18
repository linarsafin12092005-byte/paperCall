package com.callflow.api.asterisk;

import com.callflow.api.event.CallEvent;
import com.callflow.api.event.CallEventProducer;
import com.callflow.api.event.CallEventType;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.asteriskjava.manager.ManagerConnection;
import org.asteriskjava.manager.ManagerConnectionFactory;
import org.asteriskjava.manager.ManagerEventListener;
import org.asteriskjava.manager.event.DialEvent;
import org.asteriskjava.manager.event.HangupEvent;
import org.asteriskjava.manager.event.ManagerEvent;
import org.asteriskjava.manager.event.NewChannelEvent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

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

    private final CallEventProducer callEventProducer;

    private ManagerConnection connection;

    public AsteriskAmiListener(CallEventProducer callEventProducer) {
        this.callEventProducer = callEventProducer;
    }

    @PostConstruct
    public void connect() {
        try {
            ManagerConnectionFactory factory = new ManagerConnectionFactory(host, port, username, password);
            connection = factory.createManagerConnection();
            connection.addEventListener(this);
            connection.login();
            System.out.println("[Asterisk AMI] Connected to " + host + ":" + port);
        } catch (Exception e) {
            System.err.println("[Asterisk AMI] Connection failed: " + e.getMessage());
        }
    }

    @PreDestroy
    public void disconnect() {
        if (connection != null) {
            connection.logoff();
        }
    }

    @Override
    public void onManagerEvent(ManagerEvent event) {
        if (event instanceof NewChannelEvent nce) {
            System.out.println("[Asterisk Event] New channel: " + nce.getChannel() + " caller=" + nce.getCallerIdNum());
            publish(CallEventType.CALL_STARTED, nce.getChannel(), nce.getCallerIdNum());

        } else if (event instanceof DialEvent de) {
            System.out.println("[Asterisk Event] Dial: " + de.getChannel() + " -> " + de.getDestination());
            publish(CallEventType.CALL_ANSWERED, de.getChannel(), de.getDestination());

        } else if (event instanceof HangupEvent he) {
            System.out.println("[Asterisk Event] Hangup: " + he.getChannel() + " cause=" + he.getCause());
            publish(CallEventType.CALL_FINISHED, he.getChannel(), String.valueOf(he.getCause()));
        }
    }

    private void publish(CallEventType type, String channel, String detail) {
        try {
            CallEvent event = new CallEvent(type, null, null, null, channel + "|" + detail);
            callEventProducer.send(event);
        } catch (Exception e) {
            System.err.println("[Asterisk AMI] Failed to publish event to Kafka: " + e.getMessage());
        }
    }
}
