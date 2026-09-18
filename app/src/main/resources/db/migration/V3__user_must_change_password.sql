SET @add_must_change_password = IF(
    EXISTS(
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'users'
          AND column_name = 'must_change_password'
    ),
    'SELECT 1',
    'ALTER TABLE users ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT FALSE'
);
PREPARE stmt FROM @add_must_change_password;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
