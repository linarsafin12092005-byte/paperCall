package com.callflow.api.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class BootstrapAdminInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final UserService userService;
    private final String email;
    private final String password;
    private final String fullName;

    public BootstrapAdminInitializer(
            UserRepository userRepository,
            UserService userService,
            @Value("${bootstrap.admin.email:}") String email,
            @Value("${bootstrap.admin.password:}") String password,
            @Value("${bootstrap.admin.full-name:}") String fullName) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (email.isBlank() || password.isBlank() || fullName.isBlank()) {
            return;
        }
        if (userRepository.countByRole(UserRole.SUPER_ADMIN) > 0) {
            return;
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalStateException("Bootstrap email already belongs to a non-SUPER_ADMIN user");
        }
        userService.createUser(fullName, email, password, null, UserRole.SUPER_ADMIN);
    }
}
