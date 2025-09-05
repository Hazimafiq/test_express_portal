const mysql = require('mysql2/promise');

module.exports = async () => {
  const config = {
    host: process.env.TEST_DB_HOST || 'localhost',
    user: process.env.TEST_DB_USER || 'root',
    password: process.env.TEST_DB_PASS || '',
    database: process.env.TEST_DB_NAME || '33labs_portal_test'
  };

  try {
    const connection = await mysql.createConnection(config);
    
    // Clean up test database
    await connection.query(`DROP DATABASE IF EXISTS ${config.database}`);
    await connection.end();
    
    console.log('Test database cleaned up');
  } catch (error) {
    console.warn('Could not clean up test database:', error.message);
  }
};