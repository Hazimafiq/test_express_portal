const setupTestDatabase = require('./setup');

module.exports = async () => {
  await setupTestDatabase();
};
