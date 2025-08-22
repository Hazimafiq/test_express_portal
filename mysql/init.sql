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
    address VARCHAR(255) NOT NULL,
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
CREATE INDEX idx_users_search ON users (fullName, username, email);

-- Individual indexes for frequently filtered fields
CREATE INDEX idx_users_country ON users (country);
CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_status ON users (status);
CREATE INDEX idx_users_created_at ON users (created_at);
CREATE INDEX idx_users_last_login ON users (last_login);

ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active' AFTER role;
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN last_login TIMESTAMP NULL;

ALTER TABLE 33labs_portal.users ADD COLUMN address VARCHAR(255) NULL AFTER status;
ALTER TABLE 33labs_portal.users ADD COLUMN postcode VARCHAR(50) NULL AFTER address;
ALTER TABLE 33labs_portal.users ADD COLUMN state VARCHAR(50) NULL AFTER postcode;
ALTER TABLE 33labs_portal.users ADD COLUMN city VARCHAR(50) NULL AFTER state;

CREATE TABLE sessions (
    session_id VARCHAR(128) NOT NULL PRIMARY KEY,
    expires INT UNSIGNED NOT NULL,
    data MEDIUMTEXT
);

CREATE TABLE patient_table (
    id INT AUTO_INCREMENT PRIMARY KEY,
    case_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(255) NOT NULL,
    dob DATE DEFAULT NULL,
    email VARCHAR(255) NOT NULL,
    treatment_brand VARCHAR(255) NOT NULL,
    custom_sn VARCHAR(255) NOT NULL,
    status INT DEFAULT 0, -- code 0 = draft , -1 = deleted, 1 = submitted
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
    treatment_notes TEXT DEFAULT '-',
    model_type VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE file_upload_table (
    id INT NOT NULL AUTO_INCREMENT,
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