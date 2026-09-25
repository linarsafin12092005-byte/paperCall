package com.callflow.api.ami;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "call_ami_events")
public class AmiEventRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "deduplication_key", nullable = false, unique = true, length = 255)
    private String deduplicationKey;
    @Column(name = "linked_id", nullable = false, length = 128)
    private String linkedId;
    @Column(name = "unique_id", length = 128)
    private String uniqueId;
    @Column(name = "event_type", nullable = false, length = 64)
    private String eventType;
    @Column(name = "event_timestamp", nullable = false)
    private LocalDateTime eventTimestamp;
    @Column(name = "sequence_number")
    private Integer sequenceNumber;

    protected AmiEventRecord() {}

    public AmiEventRecord(String deduplicationKey, String linkedId, String uniqueId,
                          String eventType, LocalDateTime eventTimestamp, Integer sequenceNumber) {
        this.deduplicationKey = deduplicationKey;
        this.linkedId = linkedId;
        this.uniqueId = uniqueId;
        this.eventType = eventType;
        this.eventTimestamp = eventTimestamp;
        this.sequenceNumber = sequenceNumber;
    }

    public String getDeduplicationKey() { return deduplicationKey; }
}
