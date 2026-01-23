import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { createTestUser, signInTestUser, createAuthHeaders } from '../../src/shared/__tests__/helpers/auth-helper';
import { setupTestDatabase, cleanupTestDatabase } from '../../src/shared/__tests__/helpers/test-setup';
import { startTestServer, stopTestServer, getTestServerUrl } from '../../src/shared/__tests__/helpers/test-server';

describe('User & Expense E2E Flow', () => {
  let user1Token: string;
  let user1Id: string;
  let user2Token: string;
  let user2Id: string;
  let user3Token: string;
  let user3Id: string;
  let baseUrl: string;

  beforeAll(async () => {
    await setupTestDatabase();
    baseUrl = await startTestServer();
    
    // Create three test users
    const timestamp = Date.now();
    
    const user1Result = await createTestUser(
      `user1-${timestamp}@example.com`,
      'password123',
      'User One'
    );
    user1Id = user1Result.user?.id || '';
    const signIn1 = await signInTestUser(`user1-${timestamp}@example.com`, 'password123');
    user1Token = signIn1.session?.token || '';

    const user2Result = await createTestUser(
      `user2-${timestamp}@example.com`,
      'password123',
      'User Two'
    );
    user2Id = user2Result.user?.id || '';
    const signIn2 = await signInTestUser(`user2-${timestamp}@example.com`, 'password123');
    user2Token = signIn2.session?.token || '';

    const user3Result = await createTestUser(
      `user3-${timestamp}@example.com`,
      'password123',
      'User Three'
    );
    user3Id = user3Result.user?.id || '';
    const signIn3 = await signInTestUser(`user3-${timestamp}@example.com`, 'password123');
    user3Token = signIn3.session?.token || '';
  });

  afterAll(async () => {
    await stopTestServer();
    await cleanupTestDatabase();
  });

  it('should complete full user registration, friend addition, and expense creation flow', async () => {
    // Step 1: Verify users can get their own details
    const meResponse1 = await fetch(`${baseUrl}/api/users/me`, {
      headers: createAuthHeaders(user1Token)
    });
    expect(meResponse1.status).toBe(201);
    const user1Data = await meResponse1.json();
    expect(user1Data.email).toContain('user1-');

    // Step 2: User 1 adds User 2 as friend
    const addFriendResponse = await fetch(`${baseUrl}/api/users/add`, {
      method: 'POST',
      headers: {
        ...createAuthHeaders(user1Token),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        friendId: user2Id
      })
    });
    expect(addFriendResponse.status).toBe(201);

    // Step 3: User 1 adds User 3 as friend
    const addFriend2Response = await fetch(`${baseUrl}/api/users/add`, {
      method: 'POST',
      headers: {
        ...createAuthHeaders(user1Token),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        friendId: user3Id
      })
    });
    expect(addFriend2Response.status).toBe(201);

    // Step 4: User 1 creates an expense (equal split)
    const expenseResponse = await fetch(`${baseUrl}/api/expenses/makeBill`, {
      method: 'POST',
      headers: {
        ...createAuthHeaders(user1Token),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        totalAmount: 300,
        description: 'Dinner at Restaurant',
        splitData: {
          splitType: 'equal',
          data: [
            { userId: user1Id },
            { userId: user2Id },
            { userId: user3Id }
          ]
        }
      })
    });

    expect(expenseResponse.status).toBe(200);
    const expenseData = await expenseResponse.json();
    expect(expenseData.message).toBe('Bill made!');
    expect(expenseData.result).toBeDefined();
  });

  it('should handle expense creation with exact split', async () => {
    const expenseResponse = await fetch(`${baseUrl}/api/expenses/makeBill`, {
      method: 'POST',
      headers: {
        ...createAuthHeaders(user1Token),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        totalAmount: 150,
        description: 'Groceries',
        splitData: {
          splitType: 'exact',
          data: [
            { userId: user1Id, amount: 60 },
            { userId: user2Id, amount: 50 },
            { userId: user3Id, amount: 40 }
          ]
        }
      })
    });

    expect(expenseResponse.status).toBe(200);
    const expenseData = await expenseResponse.json();
    expect(expenseData.result).toBeDefined();
  });

  it('should handle expense creation with percentage split', async () => {
    const expenseResponse = await fetch(`${baseUrl}/api/expenses/makeBill`, {
      method: 'POST',
      headers: {
        ...createAuthHeaders(user2Token),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        totalAmount: 200,
        description: 'Movie Tickets',
        splitData: {
          splitType: 'percentage',
          data: [
            { userId: user1Id, percentage: 50 },
            { userId: user2Id, percentage: 30 },
            { userId: user3Id, percentage: 20 }
          ]
        }
      })
    });

    expect(expenseResponse.status).toBe(200);
    const expenseData = await expenseResponse.json();
    expect(expenseData.result).toBeDefined();
  });

  it('should handle unauthorized expense creation', async () => {
    const expenseResponse = await fetch(`${baseUrl}/api/expenses/makeBill`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        totalAmount: 100,
        description: 'Unauthorized Expense',
        splitData: {
          splitType: 'equal',
          data: [{ userId: user1Id }]
        }
      })
    });

    expect(expenseResponse.status).toBe(401);
  });
});
