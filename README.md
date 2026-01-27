# batwara-backend
A modular monolith expense-sharing backend built with TypeScript, Express, PostgreSQL, and Neo4j. Handles user management, expense splitting, and settlement calculations across multiple split strategies.

## Stack

- **Runtime**: Node.js (Bun)
- **Framework**: Express 5.x
- **Language**: TypeScript 5.9
- **SQL Database**: PostgreSQL (via Drizzle ORM)
- **Graph Database**: Neo4j (debt simplification)
- **Authentication**: Better Auth
- **Validation**: Zod + class-validator
- **Testing**: Bun test framework

## Project Structure

```
src/
├── index.ts                          # Application entry point
├── modules/                          # Bounded contexts
│   ├── user/                         # User management & authentication
│   │   ├── api/                      # Routes & controllers
│   │   ├── domain/                   # Business logic (UserService)
│   │   ├── repos/                    # Data access layer
│   │   └── dtos/                     # Request/response schemas
│   └── expense/                      # Expense & settlement logic
│       ├── api/
│       ├── domain/                   # ExpenseService, SettlementService
│       ├── repos/                    # SQL & Neo4j repositories
│       └── dtos/
└── shared/
    ├── infra/                        # Infrastructure configuration
    │   ├── auth/                     # Better Auth setup
    │   └── db/                       # Database clients
    └── default/                      # Database migrations
```

## Development

### Prerequisites

- Bun 1.0+
- PostgreSQL 13+
- Neo4j 4.0+

### Setup

1. Install dependencies:
   ```bash
   bun install
   ```

2. Configure environment variables (create `.env`):
   ```
   DATABASE_URL=postgresql://...
   NEO4J_URI=neo4j+s://...
   NEO4J_USERNAME=neo4j
   NEO4J_PASSWORD=...
   ```

3. Generate database schemas:
   ```bash
   bun run db:generate
   ```

4. Generate Better Auth schemas:
   ```bash
   bun run auth-generate
   ```

5. Run migrations:
   ```bash
   bun run migrate
   ```

6. Start the development server:
   ```bash
   bun run dev
   ```

Server runs on `http://localhost:3000` by default.

## Scripts

- `bun run dev` - Start development server with file watching
- `bun start` - Run in production mode
- `bun test` - Run all tests
- `bun run test:unit` - Unit tests only
- `bun run test:integration` - Integration tests only
- `bun run test:e2e` - End-to-end tests
- `bun run test:watch` - Watch mode for tests
- `bun run test:coverage` - Generate coverage report
- `bun run db:generate` - Generate Drizzle migrations
- `bun run migrate` - Apply pending migrations
- `bun run pull` - Sync schema from database

## Architecture

This is a modular monolith with clear separation of concerns:

### Layer Responsibilities

| Layer | Responsibility |
|-------|---|
| **Route** | HTTP endpoint mapping |
| **Controller** | Request orchestration, HTTP responses |
| **Service** | Business logic and domain rules |
| **Repository** | Database access abstraction |
| **DTO** | Request/response validation and serialization |

### Request Flow

```
HTTP Request → Route → DTO Validation → Controller → Service → Repository → Database
```

### Modules

#### User Module
Handles user accounts and authentication via Better Auth.
- `UserService` - User CRUD and account management
- `UserRepository` - PostgreSQL data access
- OAuth 2.0 support (Google, GitHub)

#### Expense Module
Core domain for expense tracking and settlement.
- `ExpenseService` - Expense creation, modification, validation
- `SettlementService` - Debt calculation and simplification
- `BalanceSqlService` - Direct SQL balance queries
- `BalanceNeo4jService` - Graph-based debt analysis
- Multiple split strategies: equal, itemwise, percentage

Repositories support both:
- PostgreSQL for transactional data
- Neo4j for debt graph analysis and settlement simplification

### Data Ownership

- **User Module** owns: `users`, `accounts`, `sessions`, `organizations`
- **Expense Module** owns: `expenses`, `splits`, `settlements`, `bills`

Foreign key relationships are explicit and documented. Cross-module queries are not permitted—data is accessed through service boundaries.

## Testing

Tests are organized by type:

- `unit/` - Isolated service logic tests
- `integration/` - Database interaction tests
- `e2e/` - Full flow tests

```bash
# Run specific test file
bun test src/modules/expense/__tests__/unit/expense.service.test.ts

# Watch mode
bun run test:watch

# Coverage
bun run test:coverage
```

## Database

### PostgreSQL (Drizzle ORM)

Primary transactional database. Schema is defined in TypeScript using Drizzle:
- [Postgres schema](src/shared/infra/db/postgres/drizzle.schema.ts)
- [Drizzle config](src/shared/infra/db/postgres/drizzle.config.ts)

Generate and apply migrations:
```bash
bun run db:generate
bun run migrate
```

### Neo4j (Graph DB)

Used for debt graph analysis and settlement simplification. Reduces complex debt networks to minimal payment flows.
- [Neo4j schema](src/shared/infra/db/neo4j/neo4j.schema.ts)
- [Neo4j config](src/shared/infra/db/neo4j/neo4j-client.config.ts)

## Validation

DTOs use both **Zod** (runtime validation) and **class-validator** decorators:

```typescript
export class CreateExpenseDto {
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsArray()
  splits: SplitDto[];
}
```

Validation occurs in middleware before reaching controllers.

## Authentication

Authentication is managed by **Better Auth**:
- Email/password flows
- OAuth providers (Google, GitHub)
- Session management with automatic refresh
- Database hooks for domain event integration

Configuration: [better-auth.config.ts](src/shared/infra/auth/better-auth.config.ts)

## Conventions

See [conventions.md](conventions.md) for:
- Naming rules (kebab-case for files, camelCase for exports)
- Folder structure requirements
- Anti-patterns to avoid
- Service/Repository patterns
- Event handling