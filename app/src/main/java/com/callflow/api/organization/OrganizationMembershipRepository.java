package com.callflow.api.organization;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OrganizationMembershipRepository extends JpaRepository<OrganizationMembership, Long> {
    Optional<OrganizationMembership> findByUserEmailAndActiveTrueAndOrganizationActiveTrue(String email);
    boolean existsByUserIdAndOrganizationId(Long userId, Long organizationId);
}
