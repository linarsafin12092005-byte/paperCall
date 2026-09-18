package com.callflow.api.client;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByPhoneNumber(String phoneNumber);
    java.util.List<Client> findByArchivedFalseOrderByFullNameAsc();
}
