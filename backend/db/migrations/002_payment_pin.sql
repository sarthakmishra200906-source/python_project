USE recharge_db;

ALTER TABLE users
    ADD COLUMN payment_pin_hash VARCHAR(255) DEFAULT NULL AFTER network_type;