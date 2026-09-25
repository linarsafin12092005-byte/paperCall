ALTER TABLE clients ADD COLUMN organization_id BIGINT NULL;
ALTER TABLE calls ADD COLUMN organization_id BIGINT NULL;
ALTER TABLE operators ADD COLUMN organization_id BIGINT NULL;

CREATE INDEX idx_clients_organization ON clients (organization_id);
CREATE INDEX idx_calls_organization_created ON calls (organization_id, created_at);
CREATE INDEX idx_operators_organization ON operators (organization_id);

UPDATE clients c
JOIN organizations o ON o.slug = 'papercall'
SET c.organization_id = o.id
WHERE c.organization_id IS NULL;

UPDATE calls c
JOIN organizations o ON o.slug = 'papercall'
SET c.organization_id = o.id
WHERE c.organization_id IS NULL;

UPDATE operators op
JOIN organizations o ON o.slug = 'papercall'
SET op.organization_id = o.id
WHERE op.organization_id IS NULL;
