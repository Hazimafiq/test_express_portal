const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const argon2 = require('argon2');

async function setupTestDatabase() {
  // Check if test environment variables are set
  const config = {
    host: process.env.TEST_DB_HOST || 'localhost',
    user: process.env.TEST_DB_USER || 'root',
    password: process.env.TEST_DB_PASS || '',
    database: process.env.TEST_DB_NAME || '33labs_portal_test'
  };

  console.log('Test database configuration:', {
    host: config.host,
    user: config.user,
    database: config.database,
    password: config.password ? '[SET]' : '[NOT SET]'
  });

  // Create a connection without database selected
  const connection = await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password
  });

  try {
    // Drop and recreate test database
    await connection.query(`DROP DATABASE IF EXISTS ${config.database}`);
    await connection.query(`CREATE DATABASE ${config.database}`);
    await connection.query(`USE ${config.database}`);
    
    // Read and execute SQL schema
    const initSql = await fs.readFile(
      path.join(__dirname, '../mysql/init.sql'),
      'utf8'
    );
    
    // Split and execute each SQL statement
    const statements = initSql.split(';').filter(stmt => stmt.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }

    // Create admin test user
    const adminPassword = 'AdminPass123!';
    const hashedPassword = await argon2.hash(adminPassword);
    
    const adminUser = {
      username: 'admin_test',
      password: hashedPassword,
      email: 'admin@test.com',
      fullName: 'Admin Test User',
      phoneNumber: '+60123456789',
      country: 'malaysia',
      clinic: 'Test Clinic',
      role: 'superadmin',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    };

    // Insert admin user
    await connection.query(`
      INSERT INTO users_table (username, password, email, fullName, phoneNumber, country, clinic, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      adminUser.username,
      adminUser.password,
      adminUser.email,
      adminUser.fullName,
      adminUser.phoneNumber,
      adminUser.country,
      adminUser.clinic,
      adminUser.role,
      adminUser.status,
      adminUser.created_at,
      adminUser.updated_at
    ]);

    console.log('Admin test user created successfully');
    console.log('Username: admin_test, Password: AdminPass123!');
    console.log('Test database setup complete');
  } catch (error) {
    console.error('Error setting up test database:', error);
    console.error('\nMake sure you have set the following environment variables:');
    console.error('TEST_DB_HOST=localhost');
    console.error('TEST_DB_USER=your_test_user');
    console.error('TEST_DB_PASS=your_test_password');
    console.error('TEST_DB_NAME=express_portal_test');
    console.error('\nOr create a .env.test file with these variables.');
    throw error;
  } finally {
    await connection.end();
  }
}

module.exports = setupTestDatabase;
