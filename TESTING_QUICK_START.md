# Testing Quick Start Guide

This is a quick reference guide to get started with testing your backend APIs.

## 🚀 Quick Start

### 1. Setup Test Environment

Create `.env.test` file:
```env
PG_DATABASE_URL=postgresql://user:password@localhost:5432/batwara_test
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=test_password
PORT=8001
NODE_ENV=test
```

### 2. Run Your First Test

```bash
# Run all tests
bun test

# Run unit tests only
bun test:unit

# Run integration tests only
bun test:integration

# Run E2E tests only
bun test:e2e

# Watch mode (auto-rerun on changes)
bun test:watch
```

## 📁 Test Structure

```
src/
├── modules/
│   ├── user/
│   │   └── __tests__/
│   │       ├── unit/              # Unit tests (services, logic)
│   │       └── integration/       # Integration tests (API endpoints)
│   └── expenses/
│       └── __tests__/
│           ├── unit/
│           └── integration/
├── shared/
│   └── __tests__/
│       └── helpers/               # Test utilities
│           ├── test-setup.ts
│           ├── auth-helper.ts
│           └── test-server.ts
└── tests/
    └── e2e/                       # End-to-end tests
        └── user-expense-flow.test.ts
```

## 🧪 Example Tests

### Unit Test Example
```typescript
// src/modules/expenses/__tests__/unit/expense.service.test.ts
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { ExpenseService } from '../../domain/expense.service';

describe('ExpenseService', () => {
  it('should split amount equally', async () => {
    // Your test here
  });
});
```

### Integration Test Example
```typescript
// src/modules/user/__tests__/integration/user.api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { startTestServer, stopTestServer } from '../../../../shared/__tests__/helpers/test-server';
import { createAuthHeaders } from '../../../../shared/__tests__/helpers/auth-helper';

describe('User API', () => {
  let baseUrl: string;
  
  beforeAll(async () => {
    baseUrl = await startTestServer();
  });
  
  afterAll(async () => {
    await stopTestServer();
  });
  
  it('should get user details', async () => {
    const response = await fetch(`${baseUrl}/api/users/me`, {
      headers: createAuthHeaders(token)
    });
    expect(response.status).toBe(201);
  });
});
```

## 🔧 Test Helpers

### Authentication Helper
```typescript
import { createTestUser, signInTestUser, createAuthHeaders } from './helpers/auth-helper';

// Create a test user
const user = await createTestUser('test@example.com', 'password123');

// Sign in and get token
const signIn = await signInTestUser('test@example.com', 'password123');
const token = signIn.session?.token || '';

// Create auth headers for requests
const headers = createAuthHeaders(token);
```

### Database Helper
```typescript
import { setupTestDatabase, cleanupTestDatabase } from './helpers/test-setup';

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await cleanupTestDatabase();
});
```

## 📋 Testing Checklist

### Phase 1: Unit Tests ✅
- [ ] ExpenseService.createBill() - equal split
- [ ] ExpenseService.createBill() - exact split
- [ ] ExpenseService.createBill() - percentage split
- [ ] UserService methods
- [ ] Edge cases and error handling

### Phase 2: Integration Tests ✅
- [ ] GET /api/users/me
- [ ] PATCH /api/users/me
- [ ] POST /api/users/add
- [ ] POST /api/expenses/makeBill
- [ ] Authentication middleware
- [ ] Error responses

### Phase 3: E2E Tests ✅
- [ ] User registration → profile update → add friend
- [ ] Create expense with multiple users
- [ ] Different split types (equal, exact, percentage)
- [ ] Multi-user scenarios

## 🎯 Common Commands

```bash
# Run specific test file
bun test src/modules/expenses/__tests__/unit/expense.service.test.ts

# Run tests with coverage
bun test:coverage

# Run tests in watch mode
bun test:watch

# Run tests matching a pattern
bun test --grep "equal split"
```

## 🐛 Troubleshooting

### Issue: Tests can't connect to database
- **Solution:** Make sure test database is running and `.env.test` is configured

### Issue: Port already in use
- **Solution:** Change `TEST_PORT` in `test-server.ts` or kill the process using port 8001

### Issue: Auth token not working
- **Solution:** Check Better Auth configuration and ensure test users are created correctly

### Issue: Tests are slow
- **Solution:** Use transactions for database tests, mock external services

## 📚 Next Steps

1. Read the full [TESTING_ROADMAP.md](./TESTING_ROADMAP.md) for detailed strategy
2. Start with unit tests for your business logic
3. Add integration tests for API endpoints
4. Create E2E tests for critical user flows
5. Set up CI/CD to run tests automatically

## 💡 Tips

- **Start small:** Begin with one unit test, then expand
- **Test behavior, not implementation:** Focus on what the code does, not how
- **Keep tests independent:** Each test should work in isolation
- **Use descriptive names:** Test names should explain what is being tested
- **Mock external dependencies:** Don't make real API calls or use production databases

---

For more details, see [TESTING_ROADMAP.md](./TESTING_ROADMAP.md)
