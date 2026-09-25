ALTER TABLE calls
    ADD COLUMN asterisk_linked_id VARCHAR(128) NULL,
    ADD COLUMN started_at DATETIME NULL,
    ADD COLUMN completed_at DATETIME NULL;

CREATE UNIQUE INDEX ux_calls_asterisk_linked_id
    ON calls (asterisk_linked_id);

CREATE TABLE IF NOT EXISTS call_ami_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    deduplication_key VARCHAR(255) NOT NULL,
    linked_id VARCHAR(128) NOT NULL,
    unique_id VARCHAR(128) NULL,
    event_type VARCHAR(64) NOT NULL,
    event_timestamp DATETIME NOT NULL,
    sequence_number INT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT ux_call_ami_events_dedup UNIQUE (deduplication_key),
    INDEX idx_call_ami_events_linked_id (linked_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
