-- Add remember_token and token_expires_at columns to users_table
ALTER TABLE users_table 
ADD COLUMN remember_token VARCHAR(255) NULL AFTER password,
ADD COLUMN token_expires_at DATETIME NULL AFTER remember_token,
ADD INDEX idx_remember_token (remember_token);
