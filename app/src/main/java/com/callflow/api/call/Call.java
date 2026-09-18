package com.callflow.api.call;

import com.callflow.api.client.Client;
import com.callflow.api.operator.Operator;
import com.callflow.api.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "calls")
public class Call {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne
    @JoinColumn(name = "operator_id")
    private Operator operator;

    @ManyToOne
    @JoinColumn(name = "initiator_user_id")
    private User initiator;

    @ManyToOne
    @JoinColumn(name = "recipient_user_id")
    private User recipient;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CallStatus status = CallStatus.PLANNED;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime answeredAt;

    private LocalDateTime finishedAt;

    private String callType;
    private String topic;
    @Column(columnDefinition = "TEXT")
    private String note;
    private LocalDateTime plannedAt;
    private boolean legacyDemo;

    protected Call() {
    }

    public Call(Client client) {
        this.client = client;
    }

    public Long getId() {
        return id;
    }

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }

    public Operator getOperator() {
        return operator;
    }

    public void setOperator(Operator operator) {
        this.operator = operator;
    }

    public User getInitiator() { return initiator; }
    public void setInitiator(User initiator) { this.initiator = initiator; }
    public User getRecipient() { return recipient; }
    public void setRecipient(User recipient) { this.recipient = recipient; }
    public String getCallType() { return callType; }
    public void setCallType(String callType) { this.callType = callType; }
    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public LocalDateTime getPlannedAt() { return plannedAt; }
    public void setPlannedAt(LocalDateTime plannedAt) { this.plannedAt = plannedAt; }
    public boolean isLegacyDemo() { return legacyDemo; }
    public void setLegacyDemo(boolean legacyDemo) { this.legacyDemo = legacyDemo; }

    public CallStatus getStatus() {
        return status;
    }

    public void setStatus(CallStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getAnsweredAt() {
        return answeredAt;
    }

    public void setAnsweredAt(LocalDateTime answeredAt) {
        this.answeredAt = answeredAt;
    }

    public LocalDateTime getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(LocalDateTime finishedAt) {
        this.finishedAt = finishedAt;
    }
}
