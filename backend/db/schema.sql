-- ============================================================
-- RechargeX - Mobile Recharge System Database Schema
-- Run this script once to initialize the database
-- ============================================================

CREATE DATABASE IF NOT EXISTS recharge_db;
USE recharge_db;

-- Drop tables in reverse dependency order (for clean re-runs)
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS plans;

-- ============================================================
-- Table: plans
-- ============================================================
CREATE TABLE plans (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    price         DECIMAL(8,2)  NOT NULL,
    data          VARCHAR(50)   NOT NULL,
    data_gb       DECIMAL(6,2)  DEFAULT 0.00,   -- numeric GB value for charts
    network_type  VARCHAR(20)   NOT NULL DEFAULT '4G',
    calls         VARCHAR(100)  DEFAULT 'Unlimited',
    sms           VARCHAR(50)   DEFAULT '100/day',
    validity_days INT           NOT NULL,
    category      ENUM('Popular', 'Data', 'Unlimited', 'Topup', 'Network') NOT NULL,
    is_popular    BOOLEAN       DEFAULT FALSE,
    description   TEXT,
    badge         VARCHAR(50)   DEFAULT NULL,
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Table: users
-- ============================================================
CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    phone         VARCHAR(15)   NOT NULL UNIQUE,
    email         VARCHAR(100)  UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    data_balance  DECIMAL(6,2)  DEFAULT 0.00,   -- remaining data in GB
    data_total    DECIMAL(6,2)  DEFAULT 0.00,   -- total data of active plan
    validity_days INT           DEFAULT 0,
    plan_name     VARCHAR(100)  DEFAULT 'No Active Plan',
    network_type  VARCHAR(20)   DEFAULT '4G',
    payment_pin_hash VARCHAR(255) DEFAULT NULL,
    role           VARCHAR(20)   NOT NULL DEFAULT 'customer',
    created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Table: transactions
-- ============================================================
CREATE TABLE transactions (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    user_id        INT          NOT NULL,
    plan_id        INT          NOT NULL,
    amount         DECIMAL(8,2) NOT NULL,
    transaction_id VARCHAR(50)  NOT NULL UNIQUE,
    status         ENUM('Success', 'Failed', 'Pending') DEFAULT 'Success',
    recharged_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

-- ============================================================
-- Seed Data: Recharge Plans
-- ============================================================
INSERT INTO plans (name, price, data, data_gb, calls, sms, validity_days, category, is_popular, description, badge)
VALUES
-- ---------- Popular Plans ----------
('Smart Starter',   179.00, '1.5 GB/day', 42.00,  'Unlimited', '100/day',   28, 'Popular',   TRUE,  'Perfect for everyday users. Enjoy fast 4G speeds with daily data reset.',             'Best Seller'),
('Value Plus',      239.00, '2 GB/day',   56.00,  'Unlimited', '100/day',   28, 'Popular',   TRUE,  'Extra data for those who need more. Great balance of value and connectivity.',        'Trending'),
('Premium 56',      349.00, '2.5 GB/day', 140.00, 'Unlimited', '100/day',   56, 'Popular',   TRUE,  'Double the validity with premium speeds. Ideal for regular travelers.',               'Double Validity'),
('Elite 84',        479.00, '3 GB/day',   252.00, 'Unlimited', 'Unlimited', 84, 'Popular',   TRUE,  'Ultimate plan with maximum data, unlimited SMS and 3 months validity.',               'Max Value'),

-- ---------- Data Add-on Plans ----------
('Data 10 GB',      19.00,  '10 GB',      10.00,  'N/A',       'N/A',       30, 'Data',      FALSE, 'Top up your existing plan with 10 GB of high-speed data.',                          NULL),
('Data 25 GB',      46.00,  '25 GB',      25.00,  'N/A',       'N/A',       30, 'Data',      FALSE, 'Bulk data pack at an affordable price. Stream, browse, and download freely.',        NULL),
('Data 50 GB',      89.00,  '50 GB',      50.00,  'N/A',       'N/A',       30, 'Data',      FALSE, 'Work from home? This pack keeps you connected for the entire month.',                'Popular'),
('Data 100 GB',     151.00, '100 GB',     100.00, 'N/A',       'N/A',       30, 'Data',      FALSE, 'The power user pack. 100 GB of data at blazing fast speeds.',                       'Power Pack'),

-- ---------- Unlimited Plans ----------
('Truly Unlimited', 299.00, 'Unlimited',         100.00, 'Unlimited', 'Unlimited', 30, 'Unlimited', FALSE, 'No daily caps. No throttling. Pure unlimited experience for power users.',          NULL),
('Unlimited Plus',  449.00, 'Unlimited + OTT',   100.00, 'Unlimited', 'Unlimited', 56, 'Unlimited', FALSE, 'Unlimited data bundled with free OTT subscription. Netflix, Prime & more.',         'OTT Free'),
('Unlimited Pro',   599.00, 'Unlimited 5G',      100.00, 'Unlimited', 'Unlimited', 84, 'Unlimited', FALSE, '5G ready unlimited plan. Future-proof your connectivity for 3 months.',             '5G Ready'),

-- ---------- Top-up / Talktime Plans ----------
('Talktime ₹10',   10.00,  'N/A',  0.00, '₹9.47 talktime',  'N/A', 0, 'Topup', FALSE, 'Small talktime recharge for emergency calls. Instant credit to balance.',             NULL),
('Talktime ₹50',   50.00,  'N/A',  0.00, '₹47.80 talktime', 'N/A', 0, 'Topup', FALSE, 'Convenient mid-range talktime recharge.',                                             NULL),
('Talktime ₹100',  100.00, 'N/A',  0.00, '₹96.00 talktime', 'N/A', 0, 'Topup', FALSE, 'Bulk talktime at the best rates. Maximum credit to your account.',                    'Best Rate'),

-- ---------- Network Plans ----------
('2G Essential',   49.00,  '1 GB',        1.00,  '500 mins',  '100 SMS',   28, 'Network', FALSE, 'Affordable basic connectivity for calls and light messaging.',                 '2G'),
('3G Connect',     99.00,  '3 GB',        3.00,  'Unlimited', '100/day',   28, 'Network', FALSE, 'Reliable everyday browsing on a classic 3G connection.',                     '3G'),
('4G Max',         249.00, '1.5 GB/day', 42.00,  'Unlimited', '100/day',   28, 'Network', TRUE,  'Fast 4G data for streaming, browsing, and everyday work.',                    '4G'),
('AirFiber Home',  699.00, 'Unlimited', 100.00,  'Unlimited', 'Unlimited', 30, 'Network', TRUE,  'Wireless home broadband with dependable high-speed connectivity.',             'AirFiber'),
('Fiber Ultra',    999.00, 'Unlimited', 200.00,  'Unlimited', 'Unlimited', 30, 'Network', TRUE,  'High-speed wired fiber for homes, study, work, and entertainment.',         'Fiber');

UPDATE plans SET network_type = '2G' WHERE name = '2G Essential';
UPDATE plans SET network_type = '3G' WHERE name = '3G Connect';
UPDATE plans SET network_type = '4G' WHERE name = '4G Max';
UPDATE plans SET network_type = 'AirFiber' WHERE name = 'AirFiber Home';
UPDATE plans SET network_type = 'Fiber' WHERE name = 'Fiber Ultra';

-- ============================================================
-- Demo User (optional - for quick testing)
-- Password: "demo1234" (bcrypt hashed)
-- ============================================================
-- INSERT INTO users (name, phone, email, password_hash, data_balance, data_total, validity_days, plan_name)
-- VALUES ('Demo User', '9999999999', 'demo@rechargex.in',
--   '$2b$12$exampleHashHere', 1.20, 2.00, 24, 'Smart Starter');
