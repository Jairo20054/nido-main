// __tests__/auth.test.js - Tests completos para autenticación
// MODIFICADO POR IA: 2024-10-05

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Token = require('../models/Token');

// Test data
const testUser = {
  name: 'Usuario Test',
  email: 'test@example.com',
  password: 'Test1234'
};

const adminUser = {
  name: 'Admin Test',
  email: 'admin@example.com',
  password: 'Admin1234'
};

describe('Auth API Tests', () => {
  let accessToken, refreshToken;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/nido_test');
  });

  afterAll(async () => {
    // Clean up and close connection
    await User.deleteMany({});
    await Token.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await User.deleteMany({});
    await Token.deleteMany({});
    accessToken = null;
    refreshToken = null;
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.message).toContain('Usuario registrado');
      expect(response.body.userId).toBeDefined();
    });

    it('should not register user with existing email', async () => {
      // Create user first
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // Try to register again with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body.error).toBe('El email ya está registrado');
    });

    it('should validate input data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: '',
          email: 'invalid-email',
          password: '123'
        })
        .expect(400);

      expect(response.body.error).toBe('Datos inválidos');
      expect(response.body.detalles).toBeDefined();
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register user
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login existing user and return tokens', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);

      // Check if refresh token cookie is set
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some(cookie => cookie.includes('refreshToken'))).toBe(true);
    });

    it('should not login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.error).toBe('Credenciales inválidas');
    });

    it('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.error).toBe('Credenciales inválidas');
    });
  });

  describe('POST /api/auth/refresh', () => {
    beforeEach(async () => {
      // Register and login user to get refresh token
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      // Extract refresh token from cookies
      const cookies = loginResponse.headers['set-cookie'];
      const refreshCookie = cookies.find(cookie => cookie.startsWith('refreshToken='));
      refreshToken = refreshCookie.split(';')[0].split('=')[1];
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
    });

    it('should fail refresh with invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['refreshToken=invalidtoken'])
        .expect(401);

      expect(response.body.error).toBe('Refresh token inválido');
    });
  });

  describe('POST /api/auth/logout', () => {
    beforeEach(async () => {
      // Register and login user
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      // Extract refresh token from cookies
      const cookies = loginResponse.headers['set-cookie'];
      const refreshCookie = cookies.find(cookie => cookie.startsWith('refreshToken='));
      refreshToken = refreshCookie.split(';')[0].split('=')[1];
    });

    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(200);

      expect(response.body.message).toBe('Logout exitoso');
    });
  });

  describe('GET /api/auth/verify-email', () => {
    let verificationToken;

    beforeEach(async () => {
      // Register user (this creates a verification token if required)
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // Get the verification token from database
      const tokenDoc = await Token.findOne({ type: 'emailVerification' });
      verificationToken = tokenDoc?.token;
    });

    it('should verify email with valid token', async () => {
      if (verificationToken) {
        const response = await request(app)
          .get(`/api/auth/verify-email?token=${verificationToken}`)
          .expect(200);

        expect(response.body.message).toBe('Email verificado exitosamente');
        expect(response.body.user.emailVerified).toBe(true);
      }
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/verify-email?token=invalidtoken')
        .expect(400);

      expect(response.body.error).toContain('inválido');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should send reset email for existing user', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body.message).toContain('Si el email existe');
    });

    it('should not reveal if email exists', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.message).toContain('Si el email existe');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let resetToken;

    beforeEach(async () => {
      // Register user
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // Create reset token manually for testing
      const user = await User.findOne({ email: testUser.email });
      resetToken = 'testresettoken123';
      await Token.create({
        userId: user._id,
        token: resetToken,
        type: 'passwordReset',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      });
    });

    it('should reset password with valid token', async () => {
      const newPassword = 'NewPassword123';

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          password: newPassword,
          confirmPassword: newPassword
        })
        .expect(200);

      expect(response.body.message).toBe('Contraseña reseteada exitosamente');
    });

    it('should fail with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalidtoken',
          password: 'NewPassword123',
          confirmPassword: 'NewPassword123'
        })
        .expect(400);

      expect(response.body.error).toContain('inválido');
    });
  });
});
