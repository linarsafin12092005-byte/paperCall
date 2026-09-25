package com.callflow.api.organization;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {
    private final OrganizationContextService contextService;

    public OrganizationController(OrganizationContextService contextService) {
        this.contextService = contextService;
    }

    @GetMapping("/me")
    public OrganizationResponse current(Authentication authentication) {
        Organization organization = contextService.requiredForUser(authentication.getName());
        return new OrganizationResponse(organization.getId(), organization.getName(), organization.getSlug(),
                organization.isActive(), organization.getCreatedAt(), organization.getUpdatedAt());
    }

    public record OrganizationResponse(Long id, String name, String slug, boolean active,
                                       LocalDateTime createdAt, LocalDateTime updatedAt) {
    }
}
