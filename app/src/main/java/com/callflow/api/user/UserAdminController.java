package com.callflow.api.user;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
public class UserAdminController {

    private final UserService userService;

    public UserAdminController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> getUsers() {
        return userService.getAllUsers().stream().map(this::toResponse).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdminUserCreateResponse create(@Valid @RequestBody AdminCreateUserRequest request,
                               Authentication authentication) {
        ManagedUserCreation creation = userService.createManagedUser(authentication.getName(), request);
        return new AdminUserCreateResponse(toResponse(creation.user()), creation.temporaryPassword());
    }

    @PutMapping("/{id}")
    public UserResponse update(@PathVariable Long id,
                               @Valid @RequestBody AdminUpdateUserRequest request,
                               Authentication authentication) {
        return toResponse(userService.updateManagedUser(authentication.getName(), id, request));
    }

    @PatchMapping("/{id}/status")
    public UserResponse updateStatus(@PathVariable Long id,
                                     @Valid @RequestBody UserStatusRequest request,
                                     Authentication authentication) {
        return toResponse(userService.updateManagedStatus(authentication.getName(), id, request.active()));
    }

    @PatchMapping("/{id}/role")
    public UserResponse updateRole(@PathVariable Long id,
                                   @Valid @RequestBody UserRoleRequest request,
                                   Authentication authentication) {
        return toResponse(userService.updateManagedRole(authentication.getName(), id, request.role()));
    }

    @PostMapping("/{id}/reset-password")
    public ResetPasswordResponse resetPassword(@PathVariable Long id, Authentication authentication) {
        return new ResetPasswordResponse(userService.resetPassword(authentication.getName(), id));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
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
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
    }
}
