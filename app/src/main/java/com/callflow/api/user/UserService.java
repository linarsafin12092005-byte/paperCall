package com.callflow.api.user;

import com.callflow.api.security.JwtService;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public User createUser(String fullName, String email, String password, String phoneNumber) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email уже зарегистрирован");
        }

        String passwordHash = passwordEncoder.encode(password);
        User user = new User(fullName, email, passwordHash);
        user.setPhoneNumber(phoneNumber);

        // Генерируем SIP credentials
        String sipExtension = generateNextExtension();
        String sipPassword = generateSipPassword();

        user.setSipExtension(sipExtension);
        user.setSipPassword(sipPassword);

        return userRepository.save(user);
    }

    public User authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Неверный email или пароль"));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Неверный email или пароль");
        }

        user.setLastLoginAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public String generateToken(User user) {
        return jwtService.generateToken(user.getEmail(), user.getId());
    }

    private String generateNextExtension() {
        Integer maxExtension = userRepository.findMaxNumericExtension();
        int nextExtension = (maxExtension != null ? maxExtension : 1000) + 1;
        return String.valueOf(nextExtension);
    }

    private String generateSipPassword() {
        return RandomStringUtils.randomAlphanumeric(12);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public User findByExtension(String extension) {
        return userRepository.findBySipExtension(extension).orElse(null);
    }
}
