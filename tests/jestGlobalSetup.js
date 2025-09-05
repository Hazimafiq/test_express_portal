const setupTestDatabase = require('./setup');

module.exports = async () => {
  // Only set up the test database for Jest tests
  // No Playwright browser setup needed
  await setupTestDatabase();
};