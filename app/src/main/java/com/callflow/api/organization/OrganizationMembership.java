package com.callflow.api.organization;

import com.callflow.api.user.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "organization_memberships",
        uniqueConstraints = @UniqueConstraint(name = "ux_memberships_user_organization",
                columnNames = {"user_id", "organization_id"}))
public class OrganizationMembership {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "organization_id", nullable = false)
    private Organization organization;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected OrganizationMembership() {
    }

    public OrganizationMembership(User user, Organization organization, String role, boolean active) {
        this.user = user;
        this.organization = organization;
        this.role = role;
        this.active = active;
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public Organization getOrganization() { return organization; }
    public String getRole() { return role; }
    public boolean isActive() { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
