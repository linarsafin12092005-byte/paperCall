CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    sip_extension VARCHAR(50) UNIQUE,
    sip_password VARCHAR(255),
    phone_number VARCHAR(50),
    avatar_filename VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    blocked_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_sip_extension (sip_extension)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @add_avatar_filename = IF(
    EXISTS(
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'users'
          AND column_name = 'avatar_filename'
    ),
    'SELECT 1',
    'ALTER TABLE users ADD COLUMN avatar_filename VARCHAR(255)'
);
PREPARE stmt FROM @add_avatar_filename;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_active = IF(
    EXISTS(
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'users'
          AND column_name = 'active'
    ),
    'SELECT 1',
    'ALTER TABLE users ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE'
);
PREPARE stmt FROM @add_active;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @add_blocked_at = IF(
    EXISTS(
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'users'
          AND column_name = 'blocked_at'
    ),
    'SELECT 1',
    'ALTER TABLE users ADD COLUMN blocked_at TIMESTAMP NULL'
);
PREPARE stmt FROM @add_blocked_at;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS clients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS operators (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'OFFLINE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS calls (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    client_id BIGINT NOT NULL,
    operator_id BIGINT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'RINGING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    answered_at TIMESTAMP NULL,
    finished_at TIMESTAMP NULL,
    CONSTRAINT fk_calls_client FOREIGN KEY (client_id) REFERENCES clients(id),
    CONSTRAINT fk_calls_operator FOREIGN KEY (operator_id) REFERENCES operators(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
