package com.callflow.api.auth;

import com.callflow.api.auth.dto.AuthResponse;
import com.callflow.api.auth.dto.LoginRequest;
import com.callflow.api.auth.dto.RegisterRequest;
import com.callflow.api.user.User;
import com.callflow.api.user.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final boolean registrationEnabled;

    public AuthController(UserService userService,
                          @Value("${app.registration.enabled:false}") boolean registrationEnabled) {
        this.userService = userService;
        this.registrationEnabled = registrationEnabled;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        if (!registrationEnabled) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(createErrorResponse("Открытая регистрация отключена"));
        }
        try {
            User user = userService.createUser(
                    request.fullName(),
                    request.email(),
                    request.password(),
                    request.phoneNumber()
            );

            String token = userService.generateToken(user);

            AuthResponse response = new AuthResponse(
                    token,
                    user.getId(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole().name(),
                    user.getSipExtension(),
                    userService.getAvatarUrl(user),
                    user.isMustChangePassword()
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(createErrorResponse("Ошибка при регистрации пользователя"));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            User user = userService.authenticate(request.email(), request.password());
            String token = userService.generateToken(user);

            AuthResponse response = new AuthResponse(
                    token,
                    user.getId(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole().name(),
                    user.getSipExtension(),
                    userService.getAvatarUrl(user),
                    user.isMustChangePassword()
            );

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(createErrorResponse("Ошибка при входе"));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(createErrorResponse("Не авторизован"));
            }

            String email = auth.getName();
            User user = userService.findByEmail(email);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(createErrorResponse("Пользователь не найден"));
            }

            AuthResponse response = new AuthResponse(
                    null,
                    user.getId(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getRole().name(),
                    user.getSipExtension(),
                    userService.getAvatarUrl(user),
                    user.isMustChangePassword()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(createErrorResponse("Ошибка при получении профиля"));
        }
    }

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }
}
