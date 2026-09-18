package com.callflow.api.auth.dto;

public record AuthResponse(
        String token,
        Long userId,
        String email,
        String fullName,
        String role,
        String sipExtension,
        String avatarUrl,
        boolean mustChangePassword
) {
}
