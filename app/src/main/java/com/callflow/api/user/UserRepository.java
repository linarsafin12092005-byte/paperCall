package com.callflow.api.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findBySipExtension(String sipExtension);
    boolean existsByEmail(String email);

    @Query("SELECT MAX(CAST(u.sipExtension AS int)) FROM User u WHERE u.sipExtension IS NOT NULL AND u.sipExtension REGEXP '^[0-9]+$'")
    Integer findMaxNumericExtension();
}
