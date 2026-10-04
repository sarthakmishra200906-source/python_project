-- Run once against an existing RechargeX database.
USE recharge_db;

ALTER TABLE plans
    MODIFY category ENUM('Popular', 'Data', 'Unlimited', 'Topup', 'Network') NOT NULL,
    ADD COLUMN network_type VARCHAR(20) NOT NULL DEFAULT '4G' AFTER data_gb;

ALTER TABLE users
    ADD COLUMN network_type VARCHAR(20) DEFAULT '4G' AFTER plan_name;

INSERT INTO plans (name, price, data, data_gb, network_type, calls, sms, validity_days, category, is_popular, description, badge)
VALUES
('2G Essential', 49.00, '1 GB', 1.00, '2G', '500 mins', '100 SMS', 28, 'Network', FALSE, 'Affordable basic connectivity for calls and light messaging.', '2G'),
('3G Connect', 99.00, '3 GB', 3.00, '3G', 'Unlimited', '100/day', 28, 'Network', FALSE, 'Reliable everyday browsing on a classic 3G connection.', '3G'),
('4G Max', 249.00, '1.5 GB/day', 42.00, '4G', 'Unlimited', '100/day', 28, 'Network', TRUE, 'Fast 4G data for streaming, browsing, and everyday work.', '4G'),
('AirFiber Home', 699.00, 'Unlimited', 100.00, 'AirFiber', 'Unlimited', 'Unlimited', 30, 'Network', TRUE, 'Wireless home broadband with dependable high-speed connectivity.', 'AirFiber'),
('Fiber Ultra', 999.00, 'Unlimited', 200.00, 'Fiber', 'Unlimited', 'Unlimited', 30, 'Network', TRUE, 'High-speed wired fiber for homes, study, work, and entertainment.', 'Fiber');