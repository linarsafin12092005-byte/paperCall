package com.callflow.api.ami;

import com.callflow.api.call.Call;
import com.callflow.api.call.CallRepository;
import com.callflow.api.call.CallStatus;
import com.callflow.api.event.CallEvent;
import com.callflow.api.event.CallEventProducer;
import com.callflow.api.event.CallEventType;
import com.callflow.api.user.User;
import com.callflow.api.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AmiCallProcessor {
    private final CallRepository callRepository;
    private final UserRepository userRepository;
    private final AmiEventRecordRepository eventRepository;
    private final CallEventProducer eventProducer;

    public AmiCallProcessor(CallRepository callRepository, UserRepository userRepository,
                            AmiEventRecordRepository eventRepository, CallEventProducer eventProducer) {
        this.callRepository = callRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.eventProducer = eventProducer;
    }

    @Transactional
    public synchronized void process(AmiCallEventData data) {
        if (blank(data.linkedId()) || blank(data.eventType())) {
            return;
        }
        String key = deduplicationKey(data);
        if (eventRepository.existsByDeduplicationKey(key)) {
            return;
        }
        LocalDateTime timestamp = data.timestamp() == null ? LocalDateTime.now() : data.timestamp();
        eventRepository.save(new AmiEventRecord(key, data.linkedId(), data.uniqueId(),
                data.eventType(), timestamp, data.sequenceNumber()));

        Optional<Call> existing = callRepository.findByAsteriskLinkedId(data.linkedId());
        User initiator = findUser(data.callerExtension());
        User recipient = findUser(data.calleeExtension());
        Call call = existing.orElse(null);

        if (call == null) {
            if (initiator == null || recipient == null) {
                System.out.println("[Asterisk AMI] ignored unknown extension event type="
                        + data.eventType() + " linkedid=" + data.linkedId());
                return;
            }
            call = Call.createAsteriskCall(initiator, recipient);
            call.setAsteriskLinkedId(data.linkedId());
            call.setStartedAt(timestamp);
            call.setStatus(CallStatus.INITIATED);
        } else {
            if (call.getInitiator() == null && initiator != null) call.setInitiator(initiator);
            if (call.getRecipient() == null && recipient != null) call.setRecipient(recipient);
        }

        CallStatus previousStatus = call.getStatus();
        CallStatus next = nextStatus(data, call);
        boolean statusChanged = false;
        if (next != null && canAdvance(call.getStatus(), next)) {
            statusChanged = next != call.getStatus();
            call.setStatus(next);
            if (next == CallStatus.ANSWERED && call.getAnsweredAt() == null) {
                call.setAnsweredAt(timestamp);
            }
            if (next == CallStatus.COMPLETED || next == CallStatus.CANCELLED || next == CallStatus.FAILED) {
                call.setCompletedAt(timestamp);
                call.setFinishedAt(timestamp);
            }
        }
        Call saved = callRepository.save(call);
        if (statusChanged || (previousStatus == CallStatus.PLANNED && saved.getStatus() == CallStatus.INITIATED)) {
            CallEvent normalized = CallEvent.ami(data.linkedId(), data.uniqueId(), eventType(data, saved.getStatus()),
                    saved.getStatus().name(),
                    saved.getInitiator() == null ? null : saved.getInitiator().getId(),
                    saved.getRecipient() == null ? null : saved.getRecipient().getId(),
                    saved.getInitiator() == null ? data.callerExtension() : saved.getInitiator().getSipExtension(),
                    saved.getRecipient() == null ? data.calleeExtension() : saved.getRecipient().getSipExtension());
            normalized.setCallId(saved.getId());
            eventProducer.send(normalized);
        }
        System.out.println("[Asterisk AMI] processed type=" + data.eventType()
                + " linkedid=" + data.linkedId() + " status=" + saved.getStatus());
    }

    private CallEventType eventType(AmiCallEventData data, CallStatus status) {
        return switch (data.eventType()) {
            case "NewChannel" -> CallEventType.CALL_STARTED;
            case "DialBegin" -> CallEventType.CALL_RINGING;
            case "BridgeEnter" -> CallEventType.CALL_ANSWERED;
            case "Hangup" -> status == CallStatus.COMPLETED
                    ? CallEventType.CALL_COMPLETED : CallEventType.CALL_CANCELLED;
            default -> CallEventType.CALL_STARTED;
        };
    }

    private CallStatus nextStatus(AmiCallEventData data, Call call) {
        return switch (data.eventType()) {
            case "NewChannel" -> CallStatus.INITIATED;
            case "DialBegin" -> CallStatus.RINGING;
            case "BridgeEnter" -> CallStatus.ANSWERED;
            case "Hangup" -> call.getStatus() == CallStatus.ANSWERED
                    ? CallStatus.COMPLETED : CallStatus.CANCELLED;
            default -> null;
        };
    }

    private boolean canAdvance(CallStatus current, CallStatus next) {
        if (current == null || current == CallStatus.PLANNED) return true;
        if (current == CallStatus.COMPLETED || current == CallStatus.CANCELLED || current == CallStatus.FAILED) {
            return false;
        }
        return rank(next) >= rank(current);
    }

    private int rank(CallStatus status) {
        return switch (status) {
            case PLANNED -> 0;
            case INITIATED -> 1;
            case RINGING -> 2;
            case ANSWERED -> 3;
            case COMPLETED, FINISHED, CANCELLED, FAILED -> 4;
        };
    }

    private User findUser(String extension) {
        return blank(extension) ? null : userRepository.findBySipExtension(extension).orElse(null);
    }

    private String deduplicationKey(AmiCallEventData data) {
        return String.join("|", data.linkedId(),
                data.uniqueId() == null ? "" : data.uniqueId(),
                data.eventType(),
                data.sequenceNumber() == null ? "" : data.sequenceNumber().toString());
    }

    private boolean blank(String value) { return value == null || value.isBlank(); }
}
