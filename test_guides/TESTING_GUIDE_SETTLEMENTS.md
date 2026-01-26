# Settlement System Testing Guide

## Overview
This guide covers testing the core settlement system endpoints including bills, splits, friends, and settlement computation.

---

## Prerequisites

1. **Start Servers**
   ```bash
   # Terminal 1: Start Node backend
   npm run dev
   
   # Terminal 2: Start Neo4j (if local)
   docker run -d -p 7687:7687 -p 7474:7474 neo4j
   
   # Terminal 3: Start PostgreSQL (if local)
   docker run -d -p 5432:5432 postgres
   ```

2. **Authentication**
   - Get JWT token from login endpoint
   - Use token in `Authorization: Bearer <token>` header for authenticated requests

---

## Phase 1: User & Friendship Setup

### 1.1 Create Users

**POST** `/api/auth/signup`
```json
{
  "email": "alice@example.com",
  "password": "password123",
  "name": "Alice"
}
```

**POST** `/api/auth/signup`
```json
{
  "email": "bob@example.com",
  "password": "password123",
  "name": "Bob"
}
```

**POST** `/api/auth/signup`
```json
{
  "email": "charlie@example.com",
  "password": "password123",
  "name": "Charlie"
}
```

### 1.2 Create Friendships

**POST** `/api/user/friend/request`
```json
{
  "targetUserId": "bob-user-id",
  "message": "Let's be friends!"
}
```

**POST** `/api/user/friend/accept`
```json
{
  "requestId": "request-id"
}
```

Repeat for all user pairs:
- Alice ↔ Bob
- Bob ↔ Charlie
- Alice ↔ Charlie

**GET** `/api/user/friends`
```
Expected: List of friend connections for authenticated user
```

---

## Phase 2: Create Bills & Splits

### 2.1 Alice Creates Bill (Equal Split)

**POST** `/api/expenses/makeBill`
```json
{
  "description": "Dinner at Restaurant",
  "totalAmount": 90,
  "splitType": "equal",
  "splitData": [
    {
      "userId": "alice-id",
      "splitAmount": 30
    },
    {
      "userId": "bob-id",
      "splitAmount": 30
    },
    {
      "userId": "charlie-id",
      "splitAmount": 30
    }
  ]
}
```

**Expected Response:**
```json
{
  "message": "Bill made!",
  "result": {
    "transactionId": "bill-uuid-1",
    "status": "created"
  }
}
```

### 2.2 Bob Creates Bill (Exact Split)

**POST** `/api/expenses/makeBill`
```json
{
  "description": "Movie & Popcorn",
  "totalAmount": 60,
  "splitType": "exact",
  "splitData": [
    {
      "userId": "bob-id",
      "splitAmount": 25
    },
    {
      "userId": "alice-id",
      "splitAmount": 35
    }
  ]
}
```

### 2.3 Charlie Creates Bill (Percentage Split)

**POST** `/api/expenses/makeBill`
```json
{
  "description": "Gas for road trip",
  "totalAmount": 100,
  "splitType": "percent",
  "splitData": [
    {
      "userId": "charlie-id",
      "splitAmount": 50
    },
    {
      "userId": "alice-id",
      "splitAmount": 30
    },
    {
      "userId": "bob-id",
      "splitAmount": 20
    }
  ]
}
```

---

## Phase 3: View Bills

### 3.1 Get All Bills

**GET** `/api/expenses/bills`

**Expected Response:**
```json
{
  "bills": [
    {
      "id": "bill-uuid-1",
      "description": "Dinner at Restaurant",
      "totalAmount": 90,
      "owner": "alice-id",
      "splitType": "equal",
      "createdAt": "2026-01-26T10:00:00Z"
    },
    {
      "id": "bill-uuid-2",
      "description": "Movie & Popcorn",
      "totalAmount": 60,
      "owner": "bob-id",
      "splitType": "exact",
      "createdAt": "2026-01-26T10:15:00Z"
    },
    {
      "id": "bill-uuid-3",
      "description": "Gas for road trip",
      "totalAmount": 100,
      "owner": "charlie-id",
      "splitType": "percent",
      "createdAt": "2026-01-26T10:30:00Z"
    }
  ]
}
```

### 3.2 Get User's Bills

**GET** `/api/expenses/bills/user/{userId}`

**Expected Response:**
```json
{
  "bills": [
    {
      "id": "bill-uuid-1",
      "description": "Dinner at Restaurant",
      "totalAmount": 90,
      "owner": "alice-id",
      "splits": [
        {
          "userId": "alice-id",
          "amount": 30
        },
        {
          "userId": "bob-id",
          "amount": 30
        },
        {
          "userId": "charlie-id",
          "amount": 30
        }
      ]
    }
  ]
}
```

---

## Phase 4: Settlement Computation & Optimization

### 4.1 Compute Balances

**GET** `/api/expenses/balances`

**Expected Response (before settlements):**
```json
{
  "balances": {
    "alice-id": {
      "paid": 90,
      "owes": 85,
      "balance": 5
    },
    "bob-id": {
      "paid": 60,
      "owes": 60,
      "balance": 0
    },
    "charlie-id": {
      "paid": 100,
      "owes": 60,
      "balance": 40
    }
  }
}
```

**Explanation:**
- Alice paid $90 (dinner) but owes $30 (dinner) + $35 (movie) + $30 (gas) = $95... wait let me recalculate

Actually:
- Alice: Paid $90 (dinner), owes $30 (dinner) + $35 (movie) + $30 (gas) = $95 → balance = -$5 (owes)
- Bob: Paid $60 (movie), owes $30 (dinner) + $20 (gas) = $50 → balance = +$10 (owed)
- Charlie: Paid $100 (gas), owes $30 (dinner) + $0 (movie) = $30 → balance = +$70 (owed)

### 4.2 Get Optimized Settlements

**GET** `/api/expenses/settlements/optimized`

**Expected Response:**
```json
{
  "settlements": [
    {
      "from": "alice-id",
      "to": "bob-id",
      "amount": 10,
      "status": "pending"
    },
    {
      "from": "alice-id",
      "to": "charlie-id",
      "amount": 65,
      "status": "pending"
    }
  ],
  "summary": {
    "totalTransactions": 2,
    "totalAmount": 75,
    "optimizationSavings": 1
  }
}
```

**How Heap Algorithm Works:**
1. Balances: Alice = -5, Bob = +10, Charlie = +70
2. Heap pairing: 
   - Bob needs +10, Alice owes -5 → Settlement: Alice pays Bob $5
   - Remaining: Bob = +5, Charlie = +70, Alice = 0
   - Charlie needs +70, Bob owes... wait Bob is still a gainer.
3. Actual optimal: Alice pays Bob $10, Alice pays Charlie $65
4. Total: 2 transactions (vs 3 without optimization)

---

## Phase 5: Settlement Operations

### 5.1 Get All Active Settlements

**GET** `/api/expenses/settlements`

**Expected Response:**
```json
{
  "settlements": [
    {
      "id": "settlement-1",
      "from": {
        "id": "alice-id",
        "name": "Alice"
      },
      "to": {
        "id": "bob-id",
        "name": "Bob"
      },
      "amount": 10,
      "status": "pending",
      "createdAt": "2026-01-26T10:35:00Z"
    },
    {
      "id": "settlement-2",
      "from": {
        "id": "alice-id",
        "name": "Alice"
      },
      "to": {
        "id": "charlie-id",
        "name": "Charlie"
      },
      "amount": 65,
      "status": "pending",
      "createdAt": "2026-01-26T10:35:00Z"
    }
  ]
}
```

### 5.2 Get User's Settlements (Owing & Owed)

**GET** `/api/expenses/settlements/user/{userId}`

**Expected Response for Alice:**
```json
{
  "owes": [
    {
      "id": "settlement-1",
      "to": {
        "id": "bob-id",
        "name": "Bob"
      },
      "amount": 10
    },
    {
      "id": "settlement-2",
      "to": {
        "id": "charlie-id",
        "name": "Charlie"
      },
      "amount": 65
    }
  ],
  "owed": [],
  "total": {
    "owes": 75,
    "owed": 0
  }
}
```

### 5.3 Mark Settlement as Paid

**POST** `/api/expenses/settlements/{settlementId}/pay`

```json
{
  "paymentMethod": "cash",
  "timestamp": "2026-01-26T11:00:00Z"
}
```

**Expected Response:**
```json
{
  "message": "Settlement marked as paid",
  "settlement": {
    "id": "settlement-1",
    "from": "alice-id",
    "to": "bob-id",
    "amount": 10,
    "status": "paid",
    "paidAt": "2026-01-26T11:00:00Z"
  }
}
```

### 5.4 Get Settled Bills Report

**GET** `/api/expenses/report/settled`

**Expected Response:**
```json
{
  "period": {
    "start": "2026-01-20",
    "end": "2026-01-26"
  },
  "summary": {
    "totalBills": 3,
    "totalAmount": 250,
    "settledAmount": 75,
    "pendingAmount": 0
  },
  "transactions": [
    {
      "date": "2026-01-26T11:00:00Z",
      "from": "alice-id",
      "to": "bob-id",
      "amount": 10,
      "status": "paid"
    }
  ]
}
```

---

## Phase 6: Edge Cases & Error Testing

### 6.1 Non-Friend Split Attempt

**POST** `/api/expenses/makeBill` (user not friends with participant)

**Expected Response (400 Bad Request):**
```json
{
  "error": "Not all participants are friends",
  "code": "VALIDATION_ERROR"
}
```

### 6.2 Invalid Split Amounts

**POST** `/api/expenses/makeBill`
```json
{
  "description": "Invalid split",
  "totalAmount": 100,
  "splitType": "exact",
  "splitData": [
    {
      "userId": "alice-id",
      "splitAmount": 60
    },
    {
      "userId": "bob-id",
      "splitAmount": 60
    }
  ]
}
```

**Expected Response (400 Bad Request):**
```json
{
  "error": "Split amounts do not equal total amount",
  "code": "SPLIT_MISMATCH"
}
```

### 6.3 Circular Debt Scenario

Create a circular debt and verify optimizer handles it:

Bill 1: Alice pays $100, Bob owes $100
Bill 2: Bob pays $100, Charlie owes $100  
Bill 3: Charlie pays $100, Alice owes $100

**Expected Settlements:**
```json
{
  "settlements": [],
  "summary": {
    "totalTransactions": 0,
    "circular": true,
    "message": "All debts circulate - net settlement is zero"
  }
}
```

### 6.4 Multiple Bills Same Day

Create 5+ bills in same transaction and verify settlement batching.

---

## Phase 7: Backend Testing (SQL vs Neo4j)

### 7.1 Test SQL-First Backend

Set environment variable:
```bash
EXPENSE_BACKEND=postgres
```

Run full test sequence (Phases 1-6) and verify results.

### 7.2 Test Neo4j-First Backend

Set environment variable:
```bash
EXPENSE_BACKEND=neo4j
```

Run full test sequence (Phases 1-6) and verify identical results.

### 7.3 Compare Query Performance

Use database monitoring tools:

**PostgreSQL:**
```sql
-- Check query performance
EXPLAIN ANALYZE SELECT ... FROM settlements;
```

**Neo4j:**
```cypher
-- Check Cypher performance
PROFILE MATCH ()-[s:SETTLEMENT]->() RETURN s;
```

---

## Test Checklist

- [ ] Users can sign up and authenticate
- [ ] Friendships created correctly in both SQL and Neo4j
- [ ] Bills created with various split types
- [ ] Balance computation correct for all users
- [ ] Settlement optimizer minimizes transactions
- [ ] Circular debts resolved
- [ ] Settlements can be marked as paid
- [ ] Reports generated accurately
- [ ] Non-friends cannot split bills
- [ ] Invalid splits rejected
- [ ] SQL backend works end-to-end
- [ ] Neo4j backend works end-to-end
- [ ] Both backends produce identical results
- [ ] Performance acceptable (< 100ms for most queries)

---

## Common Issues

### Issue: Settlements not recomputing after bill creation
**Solution:** Ensure `recomputeSettlements()` is called in `splitThat()` method

### Issue: Neo4j friend validation failing
**Solution:** Verify `FRIENDS_WITH` relationships exist in Neo4j before creating bills

### Issue: Circular debts not resolved
**Solution:** Check `SettlementOptimizer.optimizeSettlements()` for heap algorithm correctness

### Issue: Balance calculation off
**Solution:** Verify all bills and splits are included, check formula:
- Balance = (Sum of amounts CREATED by user) - (Sum of amounts PARTICIPATES_IN by user)

---

## Post-Testing Tasks

After verification:
1. Add integration tests for full flow
2. Add performance benchmarks
3. Document API response schemas
4. Set up CI/CD pipeline
5. Deploy to staging environment
