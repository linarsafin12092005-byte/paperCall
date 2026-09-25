CREATE TABLE IF NOT EXISTS organization_memberships (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    organization_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ux_memberships_user_organization UNIQUE (user_id, organization_id),
    CONSTRAINT fk_memberships_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_memberships_organization FOREIGN KEY (organization_id) REFERENCES organizations(id),
    INDEX idx_memberships_organization_active (organization_id, active),
    INDEX idx_memberships_user_active (user_id, active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO organization_memberships (user_id, organization_id, role, active)
SELECT u.id, o.id, u.role, u.active
FROM users u
JOIN organizations o ON o.slug = 'papercall'
WHERE NOT EXISTS (
    SELECT 1
    FROM organization_memberships m
    WHERE m.user_id = u.id
      AND m.organization_id = o.id
);
