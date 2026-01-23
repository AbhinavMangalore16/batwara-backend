import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { createTestUser, signInTestUser, createAuthHeaders } from '../../../../shared/__tests__/helpers/auth-helper';
import { setupTestDatabase, cleanupTestDatabase } from '../../../../shared/__tests__/helpers/test-setup';
import { startTestServer, stopTestServer, getTestServerUrl } from '../../../../shared/__tests__/helpers/test-server';

describe('User API Integration Tests', () => {
  let authToken: string;
  let testUserId: string;
  let testUserEmail: string;
  let baseUrl: string;

  beforeAll(async () => {
    await setupTestDatabase();
    baseUrl = await startTestServer();
    
    // Create test user
    testUserEmail = `test-${Date.now()}@example.com`;
    const userResult = await createTestUser(testUserEmail, 'password123', 'Test User');
    testUserId = userResult.user?.id || '';
    
    // Sign in to get token
    const signInResult = await signInTestUser(testUserEmail, 'password123');
    authToken = signInResult.session?.token || '';
  });

  afterAll(async () => {
    await stopTestServer();
    await cleanupTestDatabase();
  });

  describe('GET /api/users/me', () => {
    it('should return user details when authenticated', async () => {
      const response = await fetch(`${baseUrl}/api/users/me`, {
        headers: createAuthHeaders(authToken)
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.email).toBe(testUserEmail);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await fetch(`${baseUrl}/api/users/me`);
      expect(response.status).toBe(401);
    });

    it('should return 401 with invalid token', async () => {
      const response = await fetch(`${baseUrl}/api/users/me`, {
        headers: createAuthHeaders('invalid-token')
      });
      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update user details', async () => {
      const updateData = {
        name: 'Updated Test User'
      };

      const response = await fetch(`${baseUrl}/api/users/me`, {
        method: 'PATCH',
        headers: {
          ...createAuthHeaders(authToken),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.name).toBe('Updated Test User');
    });

    it('should return 404 when user ID not found in session', async () => {
      // This would require mocking the auth middleware to not set res.locals.id
      // For now, this is a placeholder test
    });
  });

  describe('GET /api/users/check', () => {
    it('should check if user exists', async () => {
      const response = await fetch(`${baseUrl}/api/users/check`, {
        headers: createAuthHeaders(authToken)
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toBeDefined();
    });
  });

  describe('POST /api/users/add', () => {
    it('should add a friend', async () => {
      // Create another user to add as friend
      const friendEmail = `friend-${Date.now()}@example.com`;
      const friendResult = await createTestUser(friendEmail, 'password123', 'Friend User');
      const friendId = friendResult.user?.id || '';

      const response = await fetch(`${baseUrl}/api/users/add`, {
        method: 'POST',
        headers: {
          ...createAuthHeaders(authToken),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          friendId: friendId
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toBeDefined();
    });

    it('should return 401 when not authenticated', async () => {
      const response = await fetch(`${baseUrl}/api/users/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          friendId: 'some-friend-id'
        })
      });

      expect(response.status).toBe(401); // Should be unauthorized first
    });
  });
});
