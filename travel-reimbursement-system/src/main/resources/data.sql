-- Sample Users Data
-- Default password: andritz (BCrypt hashed)
INSERT INTO users (username, email, first_name, last_name, password, role, department, manager_id, active, created_at, updated_at) VALUES
('alice', 'alice@example.com', 'Alice', 'Johnson', '$2a$10$SlVZQbwJ8hglnI30p5u5Be7DH5kJ.G5stays4v4F/XdFcb3Ss3Vee.', 'HR', 'Human Resources', NULL, true, NOW(), NOW()),
('bob', 'bob@example.com', 'Bob', 'Smith', '$2a$10$SlVZQbwJ8hglnI30p5u5Be7DH5kJ.G5stays4v4F/XdFcb3Ss3Vee.', 'MANAGER', 'Engineering', NULL, true, NOW(), NOW()),
('charlie', 'charlie@example.com', 'Charlie', 'Brown', '$2a$10$SlVZQbwJ8hglnI30p5u5Be7DH5kJ.G5stays4v4F/XdFcb3Ss3Vee.', 'EMPLOYEE', 'Engineering', 2, true, NOW(), NOW()),
('david', 'david@example.com', 'David', 'Wilson', '$2a$10$SlVZQbwJ8hglnI30p5u5Be7DH5kJ.G5stays4v4F/XdFcb3Ss3Vee.', 'EMPLOYEE', 'Engineering', 2, true, NOW(), NOW()),
('emma', 'emma@example.com', 'Emma', 'Davis', '$2a$10$SlVZQbwJ8hglnI30p5u5Be7DH5kJ.G5stays4v4F/XdFcb3Ss3Vee.', 'MANAGER', 'Sales', NULL, true, NOW(), NOW()),
('frank', 'frank@example.com', 'Frank', 'Miller', '$2a$10$SlVZQbwJ8hglnI30p5u5Be7DH5kJ.G5stays4v4F/XdFcb3Ss3Vee.', 'EMPLOYEE', 'Sales', 5, true, NOW(), NOW());

-- Sample Claims Data
INSERT INTO claims (user_id, manager_id, description, amount, status, created_at, submitted_at, updated_at) VALUES
(3, 2, 'Business trip to New York for client meeting', 1500.00, 'DRAFT', NOW(), NULL, NOW()),
(3, 2, 'Flight and hotel for conference', 2500.00, 'PENDING_MANAGER_APPROVAL', NOW(), NOW(), NOW()),
(4, 2, 'Travel to Boston office', 800.00, 'MANAGER_APPROVED', NOW(), NOW(), NOW()),
(6, 5, 'Client dinner and travel expenses', 1200.00, 'MANAGER_APPROVED', NOW(), NOW(), NOW());
