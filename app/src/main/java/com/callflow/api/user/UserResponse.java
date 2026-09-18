package com.callflow.api.user;

public record UserResponse(
        Long id,
        String email,
        String fullName,
        String phoneNumber,
        String role,
        String sipExtension,
        String avatarUrl,
        boolean active,
        java.time.LocalDateTime createdAt,
        java.time.LocalDateTime lastLoginAt,
        boolean mustChangePassword
) {}
