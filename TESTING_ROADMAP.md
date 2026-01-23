# End-to-End Testing Roadmap for Batwara Backend

This roadmap provides a comprehensive strategy for testing your backend APIs from unit tests to end-to-end integration tests.

## Table of Contents

1. [Testing Strategy Overview](#testing-strategy-overview)
2. [Test Setup & Configuration](#test-setup--configuration)
3. [Testing Layers](#testing-layers)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Test Data Management](#test-data-management)
6. [CI/CD Integration](#cicd-integration)
7. [Best Practices](#best-practices)

---

## Testing Strategy Overview

### Testing Pyramid

```
        /\
       /E2E\          ← Few E2E tests (Critical user flows)
      /------\
     /Integration\    ← More integration tests (API endpoints)
    /------------\
   /   Unit Tests \   ← Many unit tests (Business logic)
  /----------------\
```

### Test Types

1. **Unit Tests** - Test individual functions/services in isolation
2. **Integration Tests** - Test API endpoints with database interactions
3. **E2E Tests** - Test complete user flows across multiple endpoints

---

## Test Setup & Configuration

### Step 1: Install Testing Dependencies

Since you're using Bun, you can use Bun's built-in test runner (no additional dependencies needed), or add testing libraries:

```bash
# Option 1: Use Bun's built-in test runner (recommended)
# No installation needed - Bun has built-in test support

# Option 2: Add additional testing utilities (optional)
bun add -d @types/supertest supertest
bun add -d @faker-js/faker  # For generating test data
```

### Step 2: Create Test Directory Structure

```
batwara-backend/
├── src/
│   ├── modules/
│   │   ├── user/
│   │   │   ├── __tests__/          # Module-specific tests
│   │   │   │   ├── unit/
│   │   │   │   │   └── user.service.test.ts
│   │   │   │   ├── integration/
│   │   │   │   │   └── user.api.test.ts
│   │   │   │   └── fixtures/
│   │   │   │       └── user.fixtures.ts
│   │   ├── expenses/
│   │   │   └── __tests__/
│   │   │       ├── unit/
│   │   │       ├── integration/
│   │   │       └── fixtures/
│   ├── shared/
│   │   └── __tests__/
│   │       └── helpers/
│   │           ├── test-setup.ts
│   │           ├── db-helper.ts
│   │           └── auth-helper.ts
├── tests/                           # E2E tests
│   ├── e2e/
│   │   ├── auth-flow.test.ts
│   │   ├── user-flow.test.ts
│   │   └── expense-flow.test.ts
│   └── setup/
│       └── global-setup.ts
└── bunfig.toml                      # Bun configuration
```

### Step 3: Configure Test Environment

Create `.env.test` file:

```env
# Test Database (use separate test database)
PG_DATABASE_URL=postgresql://user:password@localhost:5432/batwara_test
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=test_password

# Test Auth Config
GITHUB_CLIENT_ID=test_client_id
GITHUB_CLIENT_SECRET=test_client_secret
FRONTEND_URL=http://localhost:3000

# Test Server
PORT=8001
NODE_ENV=test
```

### Step 4: Update package.json Scripts

```json
{
  "scripts": {
    "test": "bun test",
    "test:unit": "bun test src/**/__tests__/unit/**/*.test.ts",
    "test:integration": "bun test src/**/__tests__/integration/**/*.test.ts",
    "test:e2e": "bun test tests/e2e/**/*.test.ts",
    "test:watch": "bun test --watch",
    "test:coverage": "bun test --coverage",
    "test:ci": "bun test --coverage --reporter=json"
  }
}
```

---

## Testing Layers

### Layer 1: Unit Tests

**Purpose:** Test business logic in isolation (services, utilities)

**What to Test:**
- Service methods (UserService, ExpenseService)
- Business logic calculations (split calculations, validations)
- Data transformations

**Example Structure:**

```typescript
// src/modules/expenses/__tests__/unit/expense.service.test.ts
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { ExpenseService } from '../../domain/expense.service';
import { ExpensePGRepository } from '../../repos/expense.repo';

describe('ExpenseService', () => {
  let expenseService: ExpenseService;
  let mockRepo: ExpensePGRepository;

  beforeEach(() => {
    mockRepo = {
      splitThat: mock(() => Promise.resolve({ transactionId: 'test-123' }))
    } as any;
    expenseService = new ExpenseService(mockRepo);
  });

  describe('createBill - equal split', () => {
    it('should split amount equally among users', async () => {
      const billData = {
        totalAmount: 100,
        description: 'Test',
        splitData: {
          splitType: 'equal',
          data: [
            { userId: 'user1' },
            { userId: 'user2' },
            { userId: 'user3' }
          ]
        }
      };

      const result = await expenseService.createBill('payer-id', billData);
      
      expect(result).toBe('test-123');
      expect(mockRepo.splitThat).toHaveBeenCalled();
    });

    it('should handle remainder correctly', async () => {
      // Test $100 split among 3 users = $34, $33, $33
    });
  });

  describe('createBill - exact split', () => {
    // Test exact amount splitting
  });

  describe('createBill - percentage split', () => {
    // Test percentage-based splitting
  });
});
```

### Layer 2: Integration Tests

**Purpose:** Test API endpoints with real database interactions

**What to Test:**
- HTTP endpoints (routes + controllers)
- Database operations
- Authentication middleware
- Request/response validation

**Example Structure:**

```typescript
// src/modules/user/__tests__/integration/user.api.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { app } from '../../../../index';
import { db } from '../../../../shared/infra/db/postgres/postgres-client.config';
import { users } from '../../../../shared/infra/db/postgres/drizzle.schema';
import { createTestUser, getAuthToken } from '../../../../shared/__tests__/helpers/auth-helper';

describe('User API Integration Tests', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    // Setup test database
    await setupTestDatabase();
    
    // Create test user and get auth token
    const user = await createTestUser('test@example.com', 'password123');
    testUserId = user.id;
    authToken = await getAuthToken('test@example.com', 'password123');
  });

  afterAll(async () => {
    // Cleanup test database
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // Reset test data if needed
  });

  describe('GET /api/users/me', () => {
    it('should return user details when authenticated', async () => {
      const response = await app.request('/api/users/me', {
        headers: {
          'Cookie': `better-auth.session_token=${authToken}`
        }
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.email).toBe('test@example.com');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await app.request('/api/users/me');
      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/users/me', () => {
    it('should update user details', async () => {
      const response = await app.request('/api/users/me', {
        method: 'PATCH',
        headers: {
          'Cookie': `better-auth.session_token=${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Updated Name'
        })
      });

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.name).toBe('Updated Name');
    });
  });

  describe('POST /api/users/add', () => {
    it('should add a friend', async () => {
      // Create another user
      const friend = await createTestUser('friend@example.com', 'password123');
      
      const response = await app.request('/api/users/add', {
        method: 'POST',
        headers: {
          'Cookie': `better-auth.session_token=${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          friendId: friend.id
        })
      });

      expect(response.status).toBe(201);
    });
  });
});
```

### Layer 3: End-to-End Tests

**Purpose:** Test complete user flows across multiple endpoints

**What to Test:**
- Complete user journeys
- Multi-step workflows
- Cross-module interactions

**Example Structure:**

```typescript
// tests/e2e/user-flow.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { app } from '../../src/index';
import { setupTestEnvironment, cleanupTestEnvironment } from '../setup/global-setup';

describe('User E2E Flow', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    await setupTestEnvironment();
  });

  afterAll(async () => {
    await cleanupTestEnvironment();
  });

  it('should complete full user registration and profile update flow', async () => {
    // Step 1: Register user
    const registerResponse = await app.request('/api/auth/sign-up', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'e2e@example.com',
        password: 'password123',
        name: 'E2E User'
      })
    });

    expect(registerResponse.status).toBe(200);
    const cookies = registerResponse.headers.get('set-cookie');
    authToken = extractTokenFromCookies(cookies);

    // Step 2: Get user details
    const meResponse = await app.request('/api/users/me', {
      headers: { 'Cookie': `better-auth.session_token=${authToken}` }
    });

    expect(meResponse.status).toBe(201);
    const userData = await meResponse.json();
    userId = userData.id;

    // Step 3: Update profile
    const updateResponse = await app.request('/api/users/me', {
      method: 'PATCH',
      headers: {
        'Cookie': `better-auth.session_token=${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Updated E2E User'
      })
    });

    expect(updateResponse.status).toBe(201);
    const updatedData = await updateResponse.json();
    expect(updatedData.name).toBe('Updated E2E User');
  });

  it('should complete expense creation flow', async () => {
    // Step 1: Create friend users
    const friend1 = await createTestUser('friend1@example.com', 'pass');
    const friend2 = await createTestUser('friend2@example.com', 'pass');

    // Step 2: Add friends
    await app.request('/api/users/add', {
      method: 'POST',
      headers: {
        'Cookie': `better-auth.session_token=${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ friendId: friend1.id })
    });

    // Step 3: Create expense
    const expenseResponse = await app.request('/api/expenses/makeBill', {
      method: 'POST',
      headers: {
        'Cookie': `better-auth.session_token=${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        totalAmount: 100,
        description: 'Dinner',
        splitData: {
          splitType: 'equal',
          data: [
            { userId: userId },
            { userId: friend1.id },
            { userId: friend2.id }
          ]
        }
      })
    });

    expect(expenseResponse.status).toBe(200);
    const expenseData = await expenseResponse.json();
    expect(expenseData.result).toBeDefined();
  });
});
```

---

## Step-by-Step Implementation

### Phase 1: Setup (Week 1)

1. **Create test infrastructure**
   ```bash
   # Create directories
   mkdir -p src/shared/__tests__/helpers
   mkdir -p tests/e2e tests/setup
   ```

2. **Create test helpers**
   - `src/shared/__tests__/helpers/test-setup.ts` - Database setup/teardown
   - `src/shared/__tests__/helpers/auth-helper.ts` - Auth utilities
   - `src/shared/__tests__/helpers/db-helper.ts` - Database utilities

3. **Setup test database**
   - Create separate test database
   - Run migrations on test database
   - Setup database seeding/cleaning utilities

### Phase 2: Unit Tests (Week 2)

1. **Start with service layer**
   - `ExpenseService.createBill()` - Test all split types
   - `UserService` methods

2. **Test business logic**
   - Split calculations
   - Data validations
   - Edge cases

### Phase 3: Integration Tests (Week 3)

1. **Test API endpoints**
   - User endpoints (`/api/users/*`)
   - Expense endpoints (`/api/expenses/*`)
   - Auth endpoints (`/api/auth/*`)

2. **Test middleware**
   - Authentication middleware
   - Error handling
   - Request validation

### Phase 4: E2E Tests (Week 4)

1. **Critical user flows**
   - User registration → profile update → add friend
   - Create expense → view expenses → settle debts
   - Authentication flow

2. **Cross-module flows**
   - User + Expense interactions
   - Multi-user scenarios

---

## Test Data Management

### Test Fixtures

Create reusable test data:

```typescript
// src/modules/user/__tests__/fixtures/user.fixtures.ts
export const createTestUserData = (overrides = {}) => ({
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  ...overrides
});

export const createTestUserResponse = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date(),
  ...overrides
});
```

### Database Helpers

```typescript
// src/shared/__tests__/helpers/db-helper.ts
import { db } from '../../infra/db/postgres/postgres-client.config';
import { users, expenses } from '../../infra/db/postgres/drizzle.schema';

export async function setupTestDatabase() {
  // Run migrations
  // Seed initial data if needed
}

export async function cleanupTestDatabase() {
  // Truncate tables
  await db.delete(expenses);
  await db.delete(users);
}

export async function createTestUser(email: string, password: string) {
  // Create user via Better Auth or directly in DB
  // Return user object
}

export async function deleteTestUser(userId: string) {
  await db.delete(users).where(eq(users.id, userId));
}
```

### Auth Helpers

```typescript
// src/shared/__tests__/helpers/auth-helper.ts
import { auth } from '../../infra/auth/better-auth.config';

export async function createTestUser(email: string, password: string) {
  const result = await auth.api.signUpEmail({
    body: { email, password, name: 'Test User' }
  });
  return result;
}

export async function getAuthToken(email: string, password: string) {
  const result = await auth.api.signInEmail({
    body: { email, password }
  });
  // Extract token from result
  return result.session?.token || '';
}

export function createAuthHeaders(token: string) {
  return {
    'Cookie': `better-auth.session_token=${token}`
  };
}
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: batwara_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      neo4j:
        image: neo4j:5
        env:
          NEO4J_AUTH: neo4j/test_password
        ports:
          - 7687:7687
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install
      
      - name: Run migrations
        run: bun run migrate
        env:
          PG_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/batwara_test
      
      - name: Run unit tests
        run: bun run test:unit
      
      - name: Run integration tests
        run: bun run test:integration
        env:
          PG_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/batwara_test
          NEO4J_URI: bolt://localhost:7687
          NEO4J_USER: neo4j
          NEO4J_PASSWORD: test_password
      
      - name: Run E2E tests
        run: bun run test:e2e
        env:
          PG_DATABASE_URL: postgresql://postgres:postgres@localhost:5432/batwara_test
          NEO4J_URI: bolt://localhost:7687
          NEO4J_USER: neo4j
          NEO4J_PASSWORD: test_password
          PORT: 8001
      
      - name: Generate coverage report
        run: bun run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## Best Practices

### 1. Test Organization

- **One test file per source file** (e.g., `user.service.ts` → `user.service.test.ts`)
- **Group related tests** using `describe` blocks
- **Use descriptive test names** that explain what is being tested

### 2. Test Isolation

- **Each test should be independent** - no shared state
- **Clean up after each test** - use `beforeEach`/`afterEach`
- **Use transactions** for database tests (rollback after each test)

### 3. Test Data

- **Use factories/fixtures** for test data creation
- **Avoid hardcoded values** - use constants or factories
- **Clean up test data** after tests complete

### 4. Assertions

- **Test one thing per test** - single responsibility
- **Use meaningful assertions** - test behavior, not implementation
- **Test edge cases** - empty inputs, null values, boundary conditions

### 5. Performance

- **Use test database** - separate from development database
- **Run tests in parallel** when possible (Bun supports this)
- **Mock external services** - don't make real API calls in tests

### 6. Maintenance

- **Keep tests updated** - update when code changes
- **Remove flaky tests** - fix or remove unreliable tests
- **Review test coverage** - aim for 80%+ coverage on critical paths

---

## Testing Checklist

### Setup Phase
- [ ] Test database configured
- [ ] Test environment variables set
- [ ] Test helpers created
- [ ] Test scripts added to package.json

### Unit Tests
- [ ] ExpenseService tests (all split types)
- [ ] UserService tests
- [ ] Business logic tests
- [ ] Edge case tests

### Integration Tests
- [ ] User API endpoints
- [ ] Expense API endpoints
- [ ] Auth endpoints
- [ ] Middleware tests
- [ ] Error handling tests

### E2E Tests
- [ ] User registration flow
- [ ] User profile update flow
- [ ] Friend addition flow
- [ ] Expense creation flow
- [ ] Multi-user expense flow

### CI/CD
- [ ] GitHub Actions workflow configured
- [ ] Test database in CI
- [ ] Coverage reporting
- [ ] Test reports generated

---

## Quick Start Commands

```bash
# Run all tests
bun test

# Run specific test suite
bun test:unit
bun test:integration
bun test:e2e

# Run tests in watch mode
bun test:watch

# Run with coverage
bun test:coverage

# Run specific test file
bun test src/modules/user/__tests__/unit/user.service.test.ts
```

---

## Next Steps

1. **Start with Phase 1** - Setup test infrastructure
2. **Create your first unit test** - Pick a simple service method
3. **Add integration tests** - Test one endpoint end-to-end
4. **Expand coverage** - Add more tests incrementally
5. **Set up CI/CD** - Automate test runs

Remember: **Start small, test incrementally, and build up your test suite over time.**
