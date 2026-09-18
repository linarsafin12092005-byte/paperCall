package com.callflow.api.user;

import com.callflow.api.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UserServiceRoleTest {

    private UserRepository userRepository;
    private UserService userService;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        userService = new UserService(
                userRepository,
                passwordEncoder,
                mock(JwtTokenProvider.class),
                mock(AvatarStorageService.class)
        );
    }

    @Test
    void regularUserCannotCreateManagedUser() {
        User actor = user("user@example.com", UserRole.USER);
        when(userRepository.findByEmail(actor.getEmail())).thenReturn(Optional.of(actor));

        assertThrows(IllegalArgumentException.class, () ->
                userService.createManagedUser(actor.getEmail(),
                        new AdminCreateUserRequest(
                                "New Employee",
                                "new@example.com",
                                null,
                                UserRole.USER
                        )));
        verify(userRepository, never()).save(any());
    }

    @Test
    void adminCannotChangeSuperAdmin() {
        User admin = user("admin@example.com", UserRole.ADMIN);
        User superAdmin = user("root@example.com", UserRole.SUPER_ADMIN);
        when(userRepository.findByEmail(admin.getEmail())).thenReturn(Optional.of(admin));
        when(userRepository.findById(2L)).thenReturn(Optional.of(superAdmin));

        assertThrows(IllegalArgumentException.class, () ->
                userService.updateManagedStatus(
                        admin.getEmail(), 2L, false));
        verify(userRepository, never()).save(any());
    }

    @Test
    void adminCannotChangeOtherAdmin() {
        User admin = user("admin@example.com", UserRole.ADMIN);
        User anotherAdmin = user("other-admin@example.com", UserRole.ADMIN);
        when(userRepository.findByEmail(admin.getEmail())).thenReturn(Optional.of(admin));
        when(userRepository.findById(2L)).thenReturn(Optional.of(anotherAdmin));

        assertThrows(IllegalArgumentException.class, () ->
                userService.updateManagedStatus(admin.getEmail(), 2L, false));
        verify(userRepository, never()).save(any());
    }

    @Test
    void adminCannotAssignAdminRole() {
        User admin = user("admin@example.com", UserRole.ADMIN);
        when(userRepository.findByEmail(admin.getEmail())).thenReturn(Optional.of(admin));

        assertThrows(IllegalArgumentException.class, () ->
                userService.createManagedUser(admin.getEmail(),
                        new AdminCreateUserRequest(
                                "Another Admin",
                                "another@example.com",
                                null,
                                UserRole.ADMIN
                        )));
        verify(userRepository, never()).save(any());
    }

    private User user(String email, UserRole role) {
        User user = new User("Test", email, "hash");
        user.setRole(role);
        return user;
    }
}
