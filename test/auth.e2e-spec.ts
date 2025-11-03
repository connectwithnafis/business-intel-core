import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123',
    fullName: 'Test User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.role).toBe('user');
      expect(response.body.user).not.toHaveProperty('passwordHash');
      expect(response.body.user).not.toHaveProperty('refreshTokenHash');
    });

    it('should fail with duplicate email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(400);
    });

    it('should fail with invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'TestPassword123',
        })
        .expect(400);
    });

    it('should fail with short password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'new@example.com',
          password: '12345', // Less than 6 characters
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login and return tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
      expect(typeof response.body.access_token).toBe('string');
      expect(typeof response.body.refresh_token).toBe('string');

      // Store tokens for later tests
      accessToken = response.body.access_token;
      refreshToken = response.body.refresh_token;
    });

    it('should fail with wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123',
        })
        .expect(401);
    });

    it('should fail with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPassword123',
        })
        .expect(401);
    });
  });

  describe('GET /auth/profile', () => {
    it('should get user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.role).toBe('user');
    });

    it('should fail without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should fail with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('POST /auth/refresh', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: refreshToken,
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
      expect(typeof response.body.access_token).toBe('string');
      expect(typeof response.body.refresh_token).toBe('string');

      // Tokens should be different from the original
      expect(response.body.access_token).not.toBe(accessToken);
      expect(response.body.refresh_token).not.toBe(refreshToken);

      // Update tokens
      accessToken = response.body.access_token;
      refreshToken = response.body.refresh_token;
    });

    it('should fail with invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid-refresh-token',
        })
        .expect(403);
    });

    it('should fail with access token (not refresh token)', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: accessToken, // Using access token instead of refresh token
        })
        .expect(403);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Logged out successfully');
    });

    it('should fail to refresh after logout', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: refreshToken,
        })
        .expect(403);
    });

    it('should still access profile with valid access token', async () => {
      // Access token should still work until it expires
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  describe('GET /auth/admin-only (Role-based access)', () => {
    let adminAccessToken: string;

    beforeAll(async () => {
      // Create an admin user (you may need to manually set role in DB or create a separate endpoint)
      // For testing purposes, you might need to update the user's role directly in the database
      
      // This is a placeholder - implement based on your user role management
      // const adminUser = {
      //   email: 'admin@example.com',
      //   password: 'AdminPassword123',
      // };
      
      // You would typically have a separate script to create admin users
    });

    it('should deny access to non-admin users', async () => {
      await request(app.getHttpServer())
        .get('/auth/admin-only')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });

    // Uncomment this test once you have an admin user created
    // it('should allow access to admin users', async () => {
    //   const response = await request(app.getHttpServer())
    //     .get('/auth/admin-only')
    //     .set('Authorization', `Bearer ${adminAccessToken}`)
    //     .expect(200);
    //
    //   expect(response.body).toHaveProperty('message');
    //   expect(response.body.message).toContain('admin-only');
    // });
  });

  describe('@CurrentUser decorator', () => {
    it('should provide user info through CurrentUser decorator', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // The profile endpoint uses @CurrentUser() decorator
      expect(response.body.id).toBeDefined();
      expect(response.body.email).toBeDefined();
      expect(response.body.role).toBeDefined();
    });
  });
});

describe('Argon2 Password Hashing', () => {
  it('should hash passwords with Argon2', async () => {
    const argon2 = require('argon2');
    const password = 'TestPassword123';
    const hash = await argon2.hash(password);

    // Argon2 hashes start with $argon2
    expect(hash).toMatch(/^\$argon2/);

    // Verify the hash
    const isValid = await argon2.verify(hash, password);
    expect(isValid).toBe(true);

    // Verify fails with wrong password
    const isInvalid = await argon2.verify(hash, 'WrongPassword');
    expect(isInvalid).toBe(false);
  });
});