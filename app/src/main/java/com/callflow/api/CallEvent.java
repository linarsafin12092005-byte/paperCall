package com.callflow.api.event;

import java.time.LocalDateTime;

public class CallEvent {

    private CallEventType type;
    private Long callId;
    private Long clientId;
    private Long operatorId;
    private String status;
    private LocalDateTime timestamp;
    private String linkedId;
    private String uniqueId;
    private String callerExtension;
    private String calleeExtension;
    private Long initiatorUserId;
    private Long recipientUserId;

    public CallEvent() {
    }

    public CallEvent(CallEventType type, Long callId, Long clientId, Long operatorId, String status) {
        this.type = type;
        this.callId = callId;
        this.clientId = clientId;
        this.operatorId = operatorId;
        this.status = status;
        this.timestamp = LocalDateTime.now();
    }

    public CallEventType getType() {
        return type;
    }

    public void setType(CallEventType type) {
        this.type = type;
    }

    public Long getCallId() {
        return callId;
    }

    public void setCallId(Long callId) {
        this.callId = callId;
    }

    public Long getClientId() {
        return clientId;
    }

    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }

    public Long getOperatorId() {
        return operatorId;
    }

    public void setOperatorId(Long operatorId) {
        this.operatorId = operatorId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getLinkedId() { return linkedId; }
    public void setLinkedId(String linkedId) { this.linkedId = linkedId; }
    public String getUniqueId() { return uniqueId; }
    public void setUniqueId(String uniqueId) { this.uniqueId = uniqueId; }
    public String getCallerExtension() { return callerExtension; }
    public void setCallerExtension(String callerExtension) { this.callerExtension = callerExtension; }
    public String getCalleeExtension() { return calleeExtension; }
    public void setCalleeExtension(String calleeExtension) { this.calleeExtension = calleeExtension; }

    public static CallEvent ami(String linkedId, String uniqueId, CallEventType type,
                                String status, Long initiatorId, Long recipientId,
                                String callerExtension, String calleeExtension) {
        CallEvent event = new CallEvent(type, null, null, null, status);
        event.linkedId = linkedId;
        event.uniqueId = uniqueId;
        event.initiatorUserId = initiatorId;
        event.recipientUserId = recipientId;
        event.callerExtension = callerExtension;
        event.calleeExtension = calleeExtension;
        return event;
    }

    public Long getInitiatorUserId() { return initiatorUserId; }
    public void setInitiatorUserId(Long initiatorUserId) { this.initiatorUserId = initiatorUserId; }
    public Long getRecipientUserId() { return recipientUserId; }
    public void setRecipientUserId(Long recipientUserId) { this.recipientUserId = recipientUserId; }
}
