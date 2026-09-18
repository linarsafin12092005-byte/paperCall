package com.callflow.api.client;

import jakarta.validation.constraints.NotBlank;

public record ClientRequest(
        @NotBlank String fullName,
        @NotBlank String phoneNumber,
        String email,
        String organization,
        String note
) {}
