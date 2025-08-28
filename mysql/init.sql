DROP DATABASE IF EXISTS 33labs_portal;
CREATE DATABASE 33labs_portal;
USE 33labs_portal;

CREATE TABLE users_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fullName VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    country VARCHAR(50) NOT NULL,
    clinic VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    address VARCHAR(255) NULL,
    postcode VARCHAR(50) NULL,
    state VARCHAR(50) NULL,
    city VARCHAR(50) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    last_login TIMESTAMP NULL
);

-- Composite index for search functionality (fullName, username, email)
CREATE INDEX idx_users_search ON users_table (fullName, username, email);

-- Individual indexes for frequently filtered fields
CREATE INDEX idx_users_country ON users_table (country);
CREATE INDEX idx_users_role ON users_table (role);
CREATE INDEX idx_users_status ON users_table (status);
CREATE INDEX idx_users_created_at ON users_table (created_at);
CREATE INDEX idx_users_last_login ON users_table (last_login);

CREATE TABLE sessions (
    session_id VARCHAR(128) NOT NULL PRIMARY KEY,
    expires INT UNSIGNED NOT NULL,
    data MEDIUMTEXT
);

CREATE TABLE patient_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id VARCHAR(255) NOT NULL,
    doctor_id INT DEFAULT 0,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(255) NOT NULL,
    dob DATE DEFAULT NULL,
    email VARCHAR(255) NOT NULL,
    treatment_brand VARCHAR(255) NOT NULL,
    custom_sn VARCHAR(255) NOT NULL,
    category VARCHAR(255) DEFAULT 'New Case',
    status VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE treatment_model_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id VARCHAR(255) NOT NULL,
    crowding BOOLEAN DEFAULT 0,
    deep_bite BOOLEAN DEFAULT 0,
    spacing BOOLEAN DEFAULT 0,
    narrow_arch BOOLEAN DEFAULT 0,
    class_ii_div_1 BOOLEAN DEFAULT 0,
    class_ii_div_2 BOOLEAN DEFAULT 0,
    class_iii BOOLEAN DEFAULT 0,
    open_bite BOOLEAN DEFAULT 0,
    overjet BOOLEAN DEFAULT 0,
    anterior_crossbite BOOLEAN DEFAULT 0,
    posterior_crossbite BOOLEAN DEFAULT 0,
    others BOOLEAN DEFAULT 0,
    ipr VARCHAR(255) DEFAULT 'As Recommended',
    attachments VARCHAR(255) DEFAULT 'As Recommended',
    treatment_notes TEXT,
    model_type VARCHAR(255) NOT NULL,
    product VARCHAR(255) NULL,
    product_arrival_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE file_upload_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    planner_id VARCHAR(255) NULL,
    case_id VARCHAR(255) NULL,
    file_type VARCHAR(255) NULL,
    file_name VARCHAR(255) NULL,
    file_originalname TEXT DEFAULT NULL,
    file_url VARCHAR(255) NULL,
    simulation_number INT DEFAULT 1,
    limit_time_url longtext default null,
    signedurl longtext DEFAULT NULL,
    file_id int default 1,
    getcount int default 0,
    expired_time datetime null,  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `simulation_data_table` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `case_id` VARCHAR(55) NULL,
  `simulation_number` INT DEFAULT '1',
  `decision` VARCHAR(55) DEFAULT 'TBD',
  `simulation_url` TEXT DEFAULT NULL,
  `created_time` DATETIME NULL,
  `updated_time` DATETIME NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `comments_table` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `created_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_time` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `name` VARCHAR(255) DEFAULT NULL,
  `case_id` VARCHAR(255) DEFAULT NULL,
  `comments` TEXT DEFAULT NULL,
  `comment_user_id` INT DEFAULT NULL,
  `edit` INT DEFAULT 0,
  PRIMARY KEY (`id`)
);  