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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

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