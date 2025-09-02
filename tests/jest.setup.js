// Set test environment
process.env.NODE_ENV = 'test';

// Load test environment variables if .env.test exists
try {
  require('dotenv').config({ path: '.env.test' });
} catch (error) {
  console.log('No .env.test file found, using default test values');
}

// Set default test values if not provided
process.env.TEST_DB_HOST = process.env.TEST_DB_HOST || 'localhost';
process.env.TEST_DB_USER = process.env.TEST_DB_USER || 'root';
process.env.TEST_DB_PASS = process.env.TEST_DB_PASS || '';
process.env.TEST_DB_NAME = process.env.TEST_DB_NAME || 'express_portal_test';

console.log('Jest setup complete with environment:', {
  NODE_ENV: process.env.NODE_ENV,
  TEST_DB_HOST: process.env.TEST_DB_HOST,
  TEST_DB_USER: process.env.TEST_DB_USER,
  TEST_DB_NAME: process.env.TEST_DB_NAME,
  TEST_DB_PASS: process.env.TEST_DB_PASS ? '[SET]' : '[NOT SET]'
});
