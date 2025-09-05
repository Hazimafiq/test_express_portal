const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

module.exports = async () => {
  // Clean up test database if needed
  const config = {
    host: process.env.TEST_DB_HOST || 'localhost',
    user: process.env.TEST_DB_USER || 'root',
    password: process.env.TEST_DB_PASS || '',
    database: process.env.TEST_DB_NAME || '33labs_portal_test'
  };

  try {
    const connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password
    });

    // Drop test database
    await connection.query(`DROP DATABASE IF EXISTS ${config.database}`);
    console.log('Test database cleaned up');
    
    await connection.end();
  } catch (error) {
    console.log('Error cleaning up test database:', error.message);
  }

  // Clean up authentication state file
  try {
    const authStatePath = path.join(__dirname, 'auth-state.json');
    await fs.unlink(authStatePath);
    console.log('Authentication state file cleaned up');
  } catch (error) {
    // File might not exist, which is fine
    if (error.code !== 'ENOENT') {
      console.log('Error cleaning up auth state file:', error.message);
    }
  }
};
