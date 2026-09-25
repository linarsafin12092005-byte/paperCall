package com.callflow.api.call;

import java.time.LocalDateTime;

public record CallResponse(
        Long id,
        String status,
        String callType,
        String topic,
        String note,
        LocalDateTime createdAt,
        LocalDateTime plannedAt,
        boolean legacyDemo,
        Long initiatorId,
        String initiatorName,
        Long recipientId,
        String recipientName,
        String recipientNumber,
        Long clientId,
        String clientName,
        String clientPhone,
        Long operatorId,
        String operatorName,
        String asteriskLinkedId,
        LocalDateTime startedAt,
        LocalDateTime answeredAt,
        LocalDateTime completedAt
) {}
