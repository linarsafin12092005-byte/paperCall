package com.callflow.api.user;

import com.callflow.api.security.JwtTokenProvider;
import org.apache.commons.lang3.RandomStringUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AvatarStorageService avatarStorageService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       AvatarStorageService avatarStorageService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.avatarStorageService = avatarStorageService;
    }

    @Transactional
    public User createUser(String fullName, String email, String password, String phoneNumber) {
        return createUser(fullName, email, password, phoneNumber, UserRole.USER);
    }

    @Transactional
    public User createUser(String fullName, String email, String password, String phoneNumber, UserRole role) {
        return createUser(fullName, email, password, phoneNumber, role, false);
    }

    @Transactional
    public User createUser(String fullName, String email, String password, String phoneNumber,
                           UserRole role, boolean mustChangePassword) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email уже зарегистрирован");
        }

        String passwordHash = passwordEncoder.encode(password);
        User user = new User(fullName, email, passwordHash);
        user.setPhoneNumber(phoneNumber);
        user.setRole(role);
        user.setMustChangePassword(mustChangePassword);

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

        if (!user.isActive()) {
            throw new IllegalArgumentException("Пользователь заблокирован");
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Неверный email или пароль");
        }

        user.setLastLoginAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public String generateToken(User user) {
        return jwtTokenProvider.createToken(user.getEmail(), user.getId(), user.getRole().name());
    }

    @Transactional
    public void recoverLocalAdmin(String email, String password) {
        if (!"linar@gmail.com".equalsIgnoreCase(email)) {
            throw new IllegalArgumentException("Recovery target is not approved");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Target user does not exist"));
        user.setRole(UserRole.SUPER_ADMIN);
        user.setActive(true);
        user.setMustChangePassword(false);
        user.setPasswordHash(passwordEncoder.encode(password));
        userRepository.save(user);
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

    @Transactional
    public User updateUser(String currentEmail, UpdateUserRequest request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));

        updateFields(user, currentEmail, request.fullName(), request.email(), request.phoneNumber(),
                request.oldPassword(), request.newPassword());
        if (request.newPassword() != null && !request.newPassword().isBlank()) {
            user.setMustChangePassword(false);
        }
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAllByOrderByIdAsc();
    }

    @Transactional
    public ManagedUserCreation createManagedUser(String actorEmail, AdminCreateUserRequest request) {
        User actor = getRequiredUser(actorEmail);
        ensureCanManageRole(actor, request.role());
        String temporaryPassword = RandomStringUtils.randomAlphanumeric(16);
        User user = createUser(request.fullName(), request.email(), temporaryPassword,
                request.phoneNumber(), request.role(), true);
        return new ManagedUserCreation(user, temporaryPassword);
    }

    @Transactional
    public User updateManagedUser(String actorEmail, Long userId, AdminUpdateUserRequest request) {
        User actor = getRequiredUser(actorEmail);
        User target = getRequiredUser(userId);
        ensureCanManageTarget(actor, target);

        if (!target.getEmail().equals(request.email()) && userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email уже используется");
        }

        target.setFullName(request.fullName());
        target.setEmail(request.email());
        target.setPhoneNumber(request.phoneNumber());
        return userRepository.save(target);
    }

    @Transactional
    public User updateManagedStatus(String actorEmail, Long userId, boolean active) {
        User actor = getRequiredUser(actorEmail);
        User target = getRequiredUser(userId);
        ensureCanManageTarget(actor, target);
        target.setActive(active);
        return userRepository.save(target);
    }

    @Transactional
    public User updateManagedRole(String actorEmail, Long userId, UserRole role) {
        User actor = getRequiredUser(actorEmail);
        User target = getRequiredUser(userId);
        ensureCanManageTarget(actor, target);
        ensureCanManageRole(actor, role);
        if (actor.getId().equals(target.getId()) && actor.getRole() != role) {
            throw new IllegalArgumentException("Нельзя менять собственную роль");
        }
        target.setRole(role);
        return userRepository.save(target);
    }

    @Transactional
    public String resetPassword(String actorEmail, Long userId) {
        User actor = getRequiredUser(actorEmail);
        User target = getRequiredUser(userId);
        ensureCanManageTarget(actor, target);
        String temporaryPassword = RandomStringUtils.randomAlphanumeric(16);
        target.setPasswordHash(passwordEncoder.encode(temporaryPassword));
        target.setMustChangePassword(true);
        return temporaryPassword;
    }

    public User getRequiredUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
    }

    public User getRequiredUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
    }

    private void ensureCanManageTarget(User actor, User target) {
        if (actor.getRole() == UserRole.ADMIN && target.getRole() != UserRole.USER) {
            throw new IllegalArgumentException("ADMIN может управлять только USER");
        }
        if (actor.getRole() == UserRole.USER || actor.getRole() == UserRole.OPERATOR) {
            throw new IllegalArgumentException("Недостаточно прав");
        }
    }

    private void ensureCanManageRole(User actor, UserRole role) {
        if (actor.getRole() == UserRole.ADMIN && role != UserRole.USER) {
            throw new IllegalArgumentException("ADMIN может назначать только USER");
        }
        if (actor.getRole() != UserRole.ADMIN && actor.getRole() != UserRole.SUPER_ADMIN) {
            throw new IllegalArgumentException("Недостаточно прав");
        }
    }

    @Transactional
    public User updateUser(String currentEmail, UpdateUserMultipartRequest request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));

        updateFields(user, currentEmail, request.getFullName(), request.getEmail(), request.getPhoneNumber(),
                request.getOldPassword(), request.getNewPassword());
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            user.setMustChangePassword(false);
        }

        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            String previousFilename = user.getAvatarFilename();
            String filename = avatarStorageService.replaceAvatar(
                    request.getAvatar(), previousFilename);
            user.setAvatarFilename(filename);
            User saved = userRepository.save(user);
            avatarStorageService.deletePrevious(previousFilename);
            return saved;
        }

        return userRepository.save(user);
    }

    public String getAvatarUrl(User user) {
        return user.getAvatarFilename() == null
                ? null
                : "/api/users/avatars/" + user.getAvatarFilename();
    }

    public byte[] readAvatar(String filename) {
        return avatarStorageService.read(filename);
    }

    public String getAvatarContentType(String filename) {
        return avatarStorageService.getContentType(filename);
    }

    private void updateFields(User user,
                              String currentEmail,
                              String fullName,
                              String email,
                              String phoneNumber,
                              String oldPassword,
                              String newPassword) {
        if (!currentEmail.equals(email)) {
            if (userRepository.existsByEmail(email)) {
                throw new IllegalArgumentException("Email уже используется");
            }
            user.setEmail(email);
        }

        user.setFullName(fullName);
        if (phoneNumber != null && !phoneNumber.isBlank()) {
            user.setPhoneNumber(phoneNumber);
        }

        if (newPassword != null && !newPassword.isBlank()) {
            if (oldPassword == null || oldPassword.isBlank()) {
                throw new IllegalArgumentException("Введите текущий пароль");
            }
            if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
                throw new IllegalArgumentException("Неверный текущий пароль");
            }
            user.setPasswordHash(passwordEncoder.encode(newPassword));
        }
    }
}
