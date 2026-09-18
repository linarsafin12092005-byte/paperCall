package com.callflow.api.user;

import jakarta.validation.constraints.NotNull;

public record UserRoleRequest(@NotNull UserRole role) {}
