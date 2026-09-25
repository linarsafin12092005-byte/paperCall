package com.callflow.api.ami;

import java.time.LocalDateTime;

public record AmiCallEventData(
        String eventType,
        String linkedId,
        String uniqueId,
        String callerExtension,
        String calleeExtension,
        String dialStatus,
        Integer cause,
        LocalDateTime timestamp,
        Integer sequenceNumber
) {}
