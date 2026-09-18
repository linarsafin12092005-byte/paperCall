package com.callflow.api.user;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Component
public class LocalAdminRecoveryRunner implements ApplicationRunner {

    private static final String TARGET_EMAIL = "linar@gmail.com";
    private static final String REQUIRED_CONFIRMATION = "RECOVER-LOCAL-ADMIN";

    private final UserRepository userRepository;
    private final UserService userService;
    private final ConfigurableApplicationContext applicationContext;
    private final String mode;
    private final String email;
    private final String confirmation;

    public LocalAdminRecoveryRunner(
            UserRepository userRepository,
            UserService userService,
            ConfigurableApplicationContext applicationContext,
            @Value("${local.recovery.mode:}") String mode,
            @Value("${local.recovery.email:}") String email,
            @Value("${local.recovery.confirm:}") String confirmation) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.applicationContext = applicationContext;
        this.mode = mode;
        this.email = email;
        this.confirmation = confirmation;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!"inspect".equals(mode) && !"apply".equals(mode)) {
            return;
        }

        int exitCode = 0;
        try {
            User user = findTarget();
            printSafeState(user);
            if ("apply".equals(mode)) {
                apply(user);
            }
        } catch (Exception exception) {
            System.out.println("RECOVERY_ERROR: " + exception.getMessage());
            exitCode = 1;
        }

        int finalExitCode = exitCode;
        int contextExitCode = org.springframework.boot.SpringApplication.exit(
                applicationContext, () -> finalExitCode);
        System.exit(contextExitCode);
    }

    private User findTarget() {
        if (!TARGET_EMAIL.equalsIgnoreCase(email)) {
            throw new IllegalArgumentException("Recovery target must be the explicitly approved owner email");
        }
        return userRepository.findByEmail(TARGET_EMAIL)
                .orElseThrow(() -> new IllegalArgumentException("Target user does not exist"));
    }

    private void printSafeState(User user) {
        System.out.println("RECOVERY_USER: id=" + user.getId()
                + " email=" + user.getEmail()
                + " role=" + user.getRole()
                + " active=" + user.isActive());
    }

    protected void apply(User user) throws Exception {
        if (!REQUIRED_CONFIRMATION.equals(confirmation)) {
            throw new IllegalArgumentException("Explicit recovery confirmation is required");
        }

        BufferedReader reader = new BufferedReader(
                new InputStreamReader(System.in, StandardCharsets.UTF_8));
        String password = reader.readLine();
        String passwordConfirmation = reader.readLine();

        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Password must contain at least 8 characters");
        }
        if (!password.equals(passwordConfirmation)) {
            throw new IllegalArgumentException("Password confirmation does not match");
        }

        userService.recoverLocalAdmin(user.getEmail(), password);
        System.out.println("RECOVERY_SUCCESS: target role=SUPER_ADMIN active=true");
    }
}
