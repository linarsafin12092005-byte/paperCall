package com.callflow.api.auth;

import com.callflow.api.user.User;
import com.callflow.api.user.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = userService.createUser(
                    request.getFullName(),
                    request.getEmail(),
                    request.getPassword(),
                    request.getPhoneNumber()
            );

            String token = userService.generateToken(user);

            return ResponseEntity.ok(new AuthResponse(token, user));
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            User user = userService.authenticate(request.getEmail(), request.getPassword());
            String token = userService.generateToken(user);

            return ResponseEntity.ok(new AuthResponse(token, user));
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String email = userService.findByEmail(token).getEmail();
            User user = userService.findByEmail(email);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Неавторизован"));
            }

            return ResponseEntity.ok(new AuthResponse.UserInfo(user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Неавторизован"));
        }
    }
}
