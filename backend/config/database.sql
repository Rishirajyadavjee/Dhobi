-- Create Database
CREATE DATABASE IF NOT EXISTS dhobi_service;
USE dhobi_service;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  role ENUM('admin', 'user', 'dhobi') DEFAULT 'user',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  profile_image VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Dhobi Profile (Service Provider Details)
CREATE TABLE IF NOT EXISTS dhobi_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT UNIQUE NOT NULL,
  service_area VARCHAR(100),
  experience_years INT,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_orders INT DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  availability_status ENUM('available', 'busy', 'offline') DEFAULT 'available',
  services_offered TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  dhobi_id INT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  service_type ENUM('wash', 'dry-clean', 'iron', 'wash-iron') NOT NULL,
  pickup_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  pickup_date DATETIME NOT NULL,
  delivery_date DATETIME,
  status ENUM('pending', 'confirmed', 'picked-up', 'processing', 'ready', 'delivered', 'cancelled') DEFAULT 'pending',
  total_items INT DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0.00,
  payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
  payment_method ENUM('cash', 'online', 'card'),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (dhobi_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_order_number (order_number),
  INDEX idx_status (status)
);

-- Insert Default Admin User (password: admin123)
INSERT INTO users (name, email, password, role, status) VALUES 
('Admin User', 'admin@dhobi.com', '$2a$10$S9eslw7Z8dB7ZA3qQSS9k.7/6O1MO5fprRmtUAE7/VFly2agqPSP2', 'admin', 'active')
ON DUPLICATE KEY UPDATE email=email;

-- Sample Dhobi User (password: dhobi123)
INSERT INTO users (name, email, password, phone, role, status) VALUES 
('Ramesh Kumar', 'ramesh@dhobi.com', '$2a$10$DBqgcX/WIonbL4iOzw5TqOywtH1HedBenCSoDhT3aM5PZiNrOzA0e', '9876543210', 'dhobi', 'active')
ON DUPLICATE KEY UPDATE email=email;

-- Sample Regular User (password: user123)
INSERT INTO users (name, email, password, phone, role, status) VALUES 
('John Doe', 'user@dhobi.com', '$2a$10$xo5Zz1qOW9B53nTwBsLYiOKXZMitsMtAWHJLb88oqE8a4BFAOuAr6', '9123456789', 'user', 'active')
ON DUPLICATE KEY UPDATE email=email;
