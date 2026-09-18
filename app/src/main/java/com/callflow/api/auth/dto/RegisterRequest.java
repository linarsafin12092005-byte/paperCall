package com.callflow.api.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Имя обязательно")
        @Size(min = 2, max = 100, message = "Имя должно быть от 2 до 100 символов")
        String fullName,

        @NotBlank(message = "Email обязателен")
        @Email(message = "Некорректный формат email")
        String email,

        @NotBlank(message = "Пароль обязателен")
        @Size(min = 6, max = 100, message = "Пароль должен быть от 6 до 100 символов")
        String password,

        @Size(max = 20, message = "Телефон должен быть до 20 символов")
        String phoneNumber
) {
}
