const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const argon2 = require('argon2');

async function setupTestDatabase() {
  const config = {
    host: process.env.TEST_DB_HOST || 'localhost',
    user: process.env.TEST_DB_USER || 'root',
    password: process.env.TEST_DB_PASS || '',
    database: process.env.TEST_DB_NAME || '33labs_portal_test'
  };
  // const config = {
  //   host: process.env.TEST_DB_HOST,
  //   user: process.env.TEST_DB_USER,
  //   password: process.env.TEST_DB_PASS,
  //   database: process.env.TEST_DB_NAME
  // };
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
    // First, check if database exists and try to use it
    try {
      await connection.query(`USE ${config.database}`);
      
      // Get list of all tables and drop them individually
      const [tables] = await connection.query(`SHOW TABLES`);
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        await connection.query(`DROP TABLE IF EXISTS ${tableName}`);
      }
    } catch (useError) {
      console.log('Database does not exist');
    }
    
    await connection.query(`DROP DATABASE IF EXISTS ${config.database}`);
    await connection.query(`CREATE DATABASE ${config.database}`);
    await connection.query(`USE ${config.database}`);
    
    const initSql = await fs.readFile(
      path.join(__dirname, '../mysql/init.sql'),
      'utf8'
    );
    
    const statements = initSql.split(';').filter(stmt => stmt.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.query(statement);
      }
    }

    // Create multiple test users with different states for comprehensive testing
    const testUsers = [
      {
        id: 1,
        username: 'admin_test',
        password: 'AdminPass123!',
        email: 'admin@test.com',
        fullName: 'Admin Test User',
        phoneNumber: '+60123456789',
        country: 'malaysia',
        clinic: 'Test Clinic',
        role: 'superadmin',
        status: 'active'
      },
      {
        id: 2,
        username: 'active_user_test',
        password: 'ActivePass123!',
        email: 'active@test.com',
        fullName: 'Active Test User',
        phoneNumber: '+60123456790',
        country: 'malaysia',
        clinic: 'Active Test Clinic',
        role: 'doctor',
        status: 'active'
      },
      {
        id: 3,
        username: 'inactive_user_test',
        password: 'InactivePass123!',
        email: 'inactive@test.com',
        fullName: 'Inactive Test User',
        phoneNumber: '+60123456791',
        country: 'malaysia',
        clinic: 'Inactive Test Clinic',
        role: 'doctor',
        status: 'inactive'
      },
      {
        id: 4,
        username: 'delete_user_test',
        password: 'DeletePass123!',
        email: 'delete@test.com',
        fullName: 'Delete Test User',
        phoneNumber: '+60123456792',
        country: 'malaysia',
        clinic: 'Delete Test Clinic',
        role: 'doctor',
        status: 'inactive'
      },
      {
        id: 5,
        username: 'deactivate_user_test',
        password: 'DeactivatePass123!',
        email: 'deactivate@test.com',
        fullName: 'Deactivate Test User',
        phoneNumber: '+60123456793',
        country: 'malaysia',
        clinic: 'Deactivate Test Clinic',
        role: 'doctor',
        status: 'active'
      },
      {
        id: 6,
        username: 'reactivate_user_test',
        password: 'ReactivatePass123!',
        email: 'reactivate@test.com',
        fullName: 'Reactivate Test User',
        phoneNumber: '+60123456794',
        country: 'malaysia',
        clinic: 'Reactivate Test Clinic',
        role: 'doctor',
        status: 'inactive'
      }
    ];

    for (const user of testUsers) {
      const hashedPassword = await argon2.hash(user.password);
      const now = new Date();
      
      await connection.query(`
        INSERT INTO users_table (id, username, password, email, fullName, phoneNumber, country, clinic, role, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        user.id,
        user.username,
        hashedPassword,
        user.email,
        user.fullName,
        user.phoneNumber,
        user.country,
        user.clinic,
        user.role,
        user.status,
        now,
        now
      ]);
      
      console.log(`${user.status} test user created: ${user.username} (ID: ${user.id})`);
    }

    console.log('All test users created successfully');
    console.log('Test user credentials:');
    console.log('- Admin (ID 1): admin_test / AdminPass123!');
    console.log('- Active (ID 2): active_user_test / ActivePass123!');
    console.log('- Inactive (ID 3): inactive_user_test / InactivePass123!');
    console.log('- Delete (ID 4): delete_user_test / DeletePass123!');
    console.log('- Deactivate (ID 5): deactivate_user_test / DeactivatePass123!');
    console.log('- Reactivate (ID 6): reactivate_user_test / ReactivatePass123!');
    console.log('Test database setup complete');
  } catch (error) {
    console.error('Error setting up test database:', error);
    console.error('\nSet this as Environment variables:');
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
