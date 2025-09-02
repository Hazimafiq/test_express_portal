const mysql = require('mysql2/promise');

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
};
