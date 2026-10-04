USE recharge_db;

ALTER TABLE users
    ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'customer' AFTER payment_pin_hash;