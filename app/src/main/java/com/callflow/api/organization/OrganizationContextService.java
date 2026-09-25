package com.callflow.api.organization;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrganizationContextService {
    private final OrganizationMembershipRepository membershipRepository;

    public OrganizationContextService(OrganizationMembershipRepository membershipRepository) {
        this.membershipRepository = membershipRepository;
    }

    @Transactional(readOnly = true)
    public Organization requiredForUser(String email) {
        return membershipRepository.findByUserEmailAndActiveTrueAndOrganizationActiveTrue(email)
                .map(OrganizationMembership::getOrganization)
                .orElseThrow(() -> new AccessDeniedException("Нет активной организации"));
    }
}
