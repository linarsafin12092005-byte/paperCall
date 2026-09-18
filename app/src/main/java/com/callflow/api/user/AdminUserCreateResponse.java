package com.callflow.api.user;

public record AdminUserCreateResponse(
        UserResponse user,
        String temporaryPassword
) {}
