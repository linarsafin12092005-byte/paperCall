package com.callflow.api.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findBySipExtension(String sipExtension);
    boolean existsByEmail(String email);
    long countByRole(UserRole role);
    java.util.List<User> findAllByOrderByIdAsc();

    @Query(value = "SELECT MAX(CAST(u.sip_extension AS UNSIGNED)) FROM users u WHERE u.sip_extension IS NOT NULL AND u.sip_extension REGEXP '^[0-9]+$'", nativeQuery = true)
    Integer findMaxNumericExtension();
}
