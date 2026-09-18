package com.callflow.api.call;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record CallRequest(
        @NotBlank String callType,
        Long recipientUserId,
        Long clientId,
        @NotNull LocalDateTime plannedAt,
        String topic,
        String note
) {}
