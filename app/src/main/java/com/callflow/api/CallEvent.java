package com.callflow.api.event;

import java.time.LocalDateTime;

public class CallEvent {

    private CallEventType type;
    private Long callId;
    private Long clientId;
    private Long operatorId;
    private String status;
    private LocalDateTime timestamp;

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
}
