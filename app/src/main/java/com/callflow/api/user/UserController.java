package com.callflow.api.user;

import jakarta.validation.Valid;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(@Valid @RequestBody UpdateUserRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401)
                        .body(createErrorResponse("Не авторизован"));
            }

            String email = auth.getName();
            User user = userService.updateUser(email, request);

            if (user == null) {
                return ResponseEntity.status(404)
                        .body(createErrorResponse("Пользователь не найден"));
            }

            UserResponse response = new UserResponse(
                    user.getId(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getPhoneNumber(),
                    user.getRole().name(),
                    user.getSipExtension(),
                    userService.getAvatarUrl(user),
                    user.isActive(),
                    user.getCreatedAt(),
                    user.getLastLoginAt(),
                    user.isMustChangePassword()
            );

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(createErrorResponse("Ошибка при обновлении профиля"));
        }
    }

    @PutMapping(value = "/me", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateCurrentUserWithAvatar(@Valid @ModelAttribute UpdateUserMultipartRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                return ResponseEntity.status(401)
                        .body(createErrorResponse("Не авторизован"));
            }

            User user = userService.updateUser(auth.getName(), request);
            UserResponse response = new UserResponse(
                    user.getId(),
                    user.getEmail(),
                    user.getFullName(),
                    user.getPhoneNumber(),
                    user.getRole().name(),
                    user.getSipExtension(),
                    userService.getAvatarUrl(user),
                    user.isActive(),
                    user.getCreatedAt(),
                    user.getLastLoginAt(),
                    user.isMustChangePassword()
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(createErrorResponse("Ошибка при обновлении профиля"));
        }
    }

    @GetMapping("/avatars/{filename:.+}")
    public ResponseEntity<ByteArrayResource> getAvatar(@PathVariable String filename) {
        try {
            byte[] content = userService.readAvatar(filename);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(userService.getAvatarContentType(filename)))
                    .header(HttpHeaders.CACHE_CONTROL, "private, max-age=3600")
                    .body(new ByteArrayResource(content));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/directory")
    public List<UserDirectoryResponse> getDirectory() {
        return userService.getAllUsers().stream()
                .filter(User::isActive)
                .map(user -> new UserDirectoryResponse(user.getId(), user.getFullName(), user.getEmail(), user.getSipExtension()))
                .toList();
    }

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }
}
