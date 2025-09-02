const request = require('supertest');

// Import the app but don't start the server
const app = require('../../index');

describe('User API', () => {
  test('POST /register should create a new user', async () => {
    const userData = {
      username: 'newuser' + Date.now(), // Make username unique
      fullName: 'Test User',
      email: 'test' + Date.now() + '@example.com', // Make email unique too
      phoneNumber: '+60123456789',
      country: 'Malaysia',
      clinic: 'Test Clinic',
      address: '123 Test Street',
      postcode: '50000',
      city: 'Test City',
      state: 'Selangor',
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!',
      role: 'doctor'
    };

    const response = await request(app)
      .post('/register')
      .send(userData);
    

    
    expect(response.status).toBe(201);
    expect(response.body.message).toBeDefined();
  });

  test('POST /register should validate required fields', async () => {
    const userData = {
      username: '',
      fullName: '',
      email: '',
      phoneNumber: '',
      country: '',
      clinic: '',
      password: '',
      confirmPassword: '',
      role: ''
    };

    const response = await request(app)
      .post('/register')
      .send(userData);
    
    expect(response.status).toBe(400);
  });

  test('POST /register should validate email format', async () => {
    const userData = {
      username: 'emailtest' + Date.now(),
      fullName: 'Test User',
      email: 'invalid-email',
      phoneNumber: '+60123456789',
      country: 'Malaysia',
      clinic: 'Test Clinic',
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!',
      role: 'doctor'
    };

    const response = await request(app)
      .post('/register')
      .send(userData);
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Invalid email format');
  });

  test('POST /register should validate password strength', async () => {
    const userData = {
      username: 'passwordtest' + Date.now(),
      fullName: 'Test User',
      email: 'password' + Date.now() + '@example.com',
      phoneNumber: '+60123456789',
      country: 'Malaysia',
      clinic: 'Test Clinic',
      password: 'weakpassword',
      confirmPassword: 'weakpassword',
      role: 'doctor'
    };

    const response = await request(app)
      .post('/register')
      .send(userData);
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character');
  });

  test('POST /register should validate password confirmation match', async () => {
    const userData = {
      username: 'confirmtest' + Date.now(),
      fullName: 'Test User',
      email: 'confirm' + Date.now() + '@example.com',
      phoneNumber: '+60123456789',
      country: 'Malaysia',
      clinic: 'Test Clinic',
      password: 'TestPass123!',
      confirmPassword: 'DifferentPass123!',
      role: 'doctor'
    };

    const response = await request(app)
      .post('/register')
      .send(userData);
    
    expect(response.status).toBe(400);
  });

  test('POST /register should validate role selection', async () => {
    const userData = {
      username: 'roletest' + Date.now(),
      fullName: 'Test User',
      email: 'role' + Date.now() + '@example.com',
      phoneNumber: '+60123456789',
      country: 'Malaysia',
      clinic: 'Test Clinic',
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!'
      // role is missing
    };

    const response = await request(app)
      .post('/register')
      .send(userData);
    
    expect(response.status).toBe(400);
  });

  test('POST /register should validate unique username', async () => {
    // First user
    const userData1 = {
      username: 'duplicateuser',
      fullName: 'First User',
      email: 'first@example.com',
      phoneNumber: '+60123456789',
      country: 'Malaysia',
      clinic: 'Test Clinic',
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!',
      role: 'doctor'
    };

    await request(app)
      .post('/register')
      .send(userData1);

    // Second user with same username
    const userData2 = {
      username: 'duplicateuser',
      fullName: 'Second User',
      email: 'second@example.com',
      phoneNumber: '+60123456788',
      country: 'Malaysia',
      clinic: 'Test Clinic 2',
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!',
      role: 'staff'
    };

    const response = await request(app)
      .post('/register')
      .send(userData2);
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Username already exists');
  });

  test('POST /register should validate unique email', async () => {
    // First user
    const userData1 = {
      username: 'user1',
      fullName: 'First User',
      email: 'duplicate@example.com',
      phoneNumber: '+60123456789',
      country: 'Malaysia',
      clinic: 'Test Clinic',
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!',
      role: 'doctor'
    };

    await request(app)
      .post('/register')
      .send(userData1);

    // Second user with same email
    const userData2 = {
      username: 'user2',
      fullName: 'Second User',
      email: 'duplicate@example.com',
      phoneNumber: '+60123456788',
      country: 'Malaysia',
      clinic: 'Test Clinic 2',
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!',
      role: 'staff'
    };

    const response = await request(app)
      .post('/register')
      .send(userData2);
    
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Email already exists');
  });
});
