import { db } from '../../infra/db/postgres/postgres-client.config';
import { graph } from '../../infra/db/neo4j/neo4j-client.config';

/**
 * Setup test database before running tests
 */
export async function setupTestDatabase() {
  // Ensure test database is ready
  // You can run migrations here if needed
  console.log('Setting up test database...');
}

/**
 * Cleanup test database after tests
 */
export async function cleanupTestDatabase() {
  // Clean up test data
  // Note: In production tests, use transactions and rollback
  console.log('Cleaning up test database...');
}

/**
 * Reset database state between tests
 */
export async function resetTestDatabase() {
  // Truncate tables or use transactions
  // This is called in beforeEach/afterEach hooks
}

/**
 * Get test database connection
 */
export function getTestDb() {
  return db;
}

/**
 * Get test Neo4j connection
 */
export function getTestGraph() {
  return graph();
}
