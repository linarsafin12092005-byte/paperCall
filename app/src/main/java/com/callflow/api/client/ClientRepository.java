package com.callflow.api.client;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByIdAndOrganizationEntity_Id(Long id, Long organizationId);
    java.util.List<Client> findByOrganizationEntity_IdAndArchivedFalseOrderByFullNameAsc(Long organizationId);
}
