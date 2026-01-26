# Settlement System - Quick Testing Reference

## API Endpoints Summary

| Method | Endpoint | Status | Purpose |
|--------|----------|--------|---------|
| POST | `/api/expenses/makeBill` | ✅ Implemented | Create bill with splits |
| GET | `/api/expenses/bills` | ⏳ TODO | Get all bills |
| GET | `/api/expenses/bills/{billId}` | ⏳ TODO | Get bill details |
| GET | `/api/expenses/bills/user/{userId}` | ⏳ TODO | Get user's bills |
| GET | `/api/expenses/balances` | ⏳ TODO | Get balance for users |
| GET | `/api/expenses/settlements` | ⏳ TODO | Get all settlements |
| GET | `/api/expenses/settlements/user/{userId}` | ⏳ TODO | Get user's settlements |
| GET | `/api/expenses/settlements/optimized` | ⏳ TODO | Get optimized settlements |
| POST | `/api/expenses/settlements/{id}/pay` | ⏳ TODO | Mark settlement as paid |

---

## Quick cURL Tests

### 1. Create Bill (Equal Split)
```bash
curl -X POST http://localhost:3000/api/expenses/makeBill \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Dinner",
    "totalAmount": 90,
    "splitType": "equal",
    "splitData": [
      {"userId": "user1-id", "splitAmount": 30},
      {"userId": "user2-id", "splitAmount": 30},
      {"userId": "user3-id", "splitAmount": 30}
    ]
  }'
```

### 2. Create Bill (Exact Split)
```bash
curl -X POST http://localhost:3000/api/expenses/makeBill \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Movie tickets",
    "totalAmount": 60,
    "splitType": "exact",
    "splitData": [
      {"userId": "user1-id", "splitAmount": 40},
      {"userId": "user2-id", "splitAmount": 20}
    ]
  }'
```

### 3. Create Bill (Percentage Split)
```bash
curl -X POST http://localhost:3000/api/expenses/makeBill \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Gas",
    "totalAmount": 100,
    "splitType": "percent",
    "splitData": [
      {"userId": "user1-id", "splitAmount": 50},
      {"userId": "user2-id", "splitAmount": 30},
      {"userId": "user3-id", "splitAmount": 20}
    ]
  }'
```

---

## Current Implementation Status

### ✅ Complete
- Settlement optimizer (heap-based algorithm)
- Balance calculators (SQL and Neo4j)
- Repository layer (SQL-First and Neo4j-First implementations)
- Bill/Split creation endpoint
- DTO schemas

### ⏳ In Progress  
- Settlement computation endpoints
- Settlement query endpoints
- Settlement payment marking

### ❌ Not Started
- User/Friendship management endpoints
- Authentication/Authorization
- Error handling middleware
- Request validation

---

## Data Flow Diagram

```
User Action: Create Bill
    ↓
Controller.makeBill()
    ↓
Service.createBill()
    ↓
Repository.splitThat()
    ├─ Validate friends (Neo4j)
    ├─ Insert bill/splits (SQL or Neo4j)
    └─ Call recomputeSettlements()
         ├─ Compute balances
         ├─ Optimize (heap algorithm)
         └─ Persist settlements
         
User Query: Get Settlements
    ↓
Controller.getSettlements()
    ↓
Service.getUserSettlements()
    ↓
Repository.getUserSettlements()
    └─ Query settlements from DB
```

---

## Backend Switching

To switch between SQL-First and Neo4j-First backends:

**environment.ts or .env**
```
EXPENSE_BACKEND=postgres  # or neo4j
```

The factory pattern in routes automatically selects:
```typescript
const repo = EXPENSE_BACKEND === 'neo4j' 
  ? new ExpenseNeo4jRepository()
  : new ExpensePGRepository();
```

---

## Database Queries for Debugging

### PostgreSQL

```sql
-- Check bills
SELECT * FROM bills;

-- Check splits
SELECT * FROM splits;

-- Check balances
SELECT 
  user_id,
  SUM(CASE WHEN type='bill' THEN amount ELSE 0 END) as paid,
  SUM(CASE WHEN type='split' THEN amount ELSE 0 END) as owes
FROM transactions
GROUP BY user_id;
```

### Neo4j

```cypher
-- Check bills
MATCH (p:Person)-[:CREATED]->(b:Bill) RETURN p, b;

-- Check splits
MATCH (p:Person)-[r:PARTICIPATES_IN]->(b:Bill) RETURN p, r, b;

-- Check settlements
MATCH (p1:Person)-[s:SETTLEMENT]->(p2:Person) 
RETURN p1.id, p2.id, s.amount;

-- Check balances
MATCH (p:Person)
OPTIONAL MATCH (p)-[:CREATED]->(b:Bill)
WITH p, COALESCE(SUM(b.totalAmount), 0) as paid
OPTIONAL MATCH (p)-[part:PARTICIPATES_IN]->(b:Bill)
WITH p, paid, COALESCE(SUM(part.amount), 0) as owes
RETURN p.id, paid - owes as balance;
```

---

## Known Issues to Fix

1. **Neo4j Repository imports** - Some class names reference wrong services
2. **Missing endpoints** - Most GET endpoints not yet implemented
3. **Settlement sync** - Need to ensure Neo4j PAYS edges sync with SQL settlements
4. **Error handling** - Need proper validation and error responses
5. **Testing** - No integration tests yet for settlement flow

---

## Next Steps for Testing

1. Fix remaining imports
2. Implement GET endpoints for bills and settlements
3. Add settlement payment endpoint
4. Create integration tests
5. Benchmark both backends
6. Deploy to staging
