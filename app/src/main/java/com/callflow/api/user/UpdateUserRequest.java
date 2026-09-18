package com.callflow.api.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UpdateUserRequest(
        @NotBlank(message = "Имя обязательно")
        String fullName,

        @NotBlank(message = "Email обязателен")
        @Email(message = "Неверный формат email")
        String email,

        String phoneNumber,

        String oldPassword,

        String newPassword,

        String avatar
) {}
