import { graph } from "../../../shared/infra/db/neo4j/neo4j-client.config";
import { SettlementOptimizer, Settlement } from "./settlement.service";

export interface UserBalance {
  userId: string;
  balance: number;
  owes: number;
  receives: number;
}

export interface AllBalances {
  [userId: string]: UserBalance;
}

export class neo4JSettlementService {
  async computeBalances(userId?: string): Promise<AllBalances | UserBalance | null> {
    const driver = graph();

    if (userId) {
      return this.getUserBalance(userId);
    }

    // Get all user balances based on OWES relationships
    // balance = amount others owe to you - amount you owe to others
    const result = await driver.executeQuery(
      `
      MATCH (p:Person)
      WITH p
      
      OPTIONAL MATCH ()-[owesMe:OWES]->(p)
      WITH p, COALESCE(SUM(owesMe.amount), 0) AS totalOwedToMe
      
      OPTIONAL MATCH (p)-[iOwe:OWES]->()
      WITH p, totalOwedToMe, COALESCE(SUM(iOwe.amount), 0) AS totalIOwe
      
      WITH p.id AS personId, (totalOwedToMe - totalIOwe) AS balance, totalIOwe, totalOwedToMe
      WHERE balance <> 0 OR totalIOwe <> 0 OR totalOwedToMe <> 0
      RETURN personId, balance, totalIOwe, totalOwedToMe
      `
    );

    const balances: AllBalances = {};
    for (const rec of result.records) {
      const personId = rec.get('personId');
      const balance = rec.get('balance');
      const owes = rec.get('totalIOwe');
      const receives = rec.get('totalOwedToMe');

      balances[personId] = {
        userId: personId,
        balance,
        owes,
        receives
      };
    }

    return Object.keys(balances).length > 0 ? balances : null;
  }

  async getUserBalance(userId: string): Promise<UserBalance | null> {
    const driver = graph();

    const result = await driver.executeQuery(
      `
      MATCH (p:Person {id: $userId})
      
      OPTIONAL MATCH ()-[owesMe:OWES]->(p)
      WITH p, COALESCE(SUM(owesMe.amount), 0) AS totalOwedToMe
      
      OPTIONAL MATCH (p)-[iOwe:OWES]->()
      WITH p, totalOwedToMe, COALESCE(SUM(iOwe.amount), 0) AS totalIOwe
      
      WITH p.id AS personId, (totalOwedToMe - totalIOwe) AS balance, totalIOwe, totalOwedToMe
      RETURN personId, balance, totalIOwe, totalOwedToMe
      `,
      { userId }
    );

    if (result.records.length === 0) {
      return null;
    }

    const rec = result.records[0]!;
    return {
      userId: rec.get('personId'),
      balance: rec.get('balance'),
      owes: rec.get('totalIOwe'),
      receives: rec.get('totalOwedToMe')
    };
  }

  //persist balances as node properties for quick access
  async persistBalances(): Promise<void> {
    const balances = await this.computeBalances();
    if (!balances || typeof balances !== 'object') return;

    const driver = graph();
    const balanceEntries = Object.entries(balances);

    for (const [userId, balanceData] of balanceEntries) {
      await driver.executeQuery(
        `
        MATCH (p:Person {id: $userId})
        SET p.balance = $balance, 
            p.owes = $owes, 
            p.receives = $receives,
            p.lastBalanceUpdate = datetime()
        RETURN p
        `,
        {
          userId,
          balance: balanceData.balance,
          owes: balanceData.owes,
          receives: balanceData.receives
        }
      );
    }
  }

  // Compute optimized settlements (minimal transactions)
  async computeOptimizedSettlements(): Promise<Settlement[]> {
    const balances = await this.computeBalances();
    if (!balances || typeof balances !== 'object') return [];

    // Convert balance object to simple record for optimizer
    const balanceRecord: Record<string, number> = {};
    for (const [userId, balanceData] of Object.entries(balances)) {
      balanceRecord[userId] = balanceData.balance;
    }

    const optimizer = new SettlementOptimizer();
    return optimizer.optimizeSettlements(balanceRecord);
  }

  // Create optimized SETTLEMENT relationships in Neo4j
  async createOptimizedSettlements(): Promise<Settlement[]> {
    const settlements = await this.computeOptimizedSettlements();
    const driver = graph();

    // Clear old settlements
    await driver.executeQuery(`MATCH ()-[s:SETTLEMENT]->() DELETE s`);

    // Create new optimized settlements
    for (const settlement of settlements) {
      await driver.executeQuery(
        `
        MATCH (from:Person {id: $from}), (to:Person {id: $to})
        CREATE (from)-[:SETTLEMENT {amount: $amount, createdAt: datetime()}]->(to)
        `,
        {
          from: settlement.from,
          to: settlement.to,
          amount: settlement.amount
        }
      );
    }

    return settlements;
  }

  //Persist optimized settlements to PostgreSQL and Neo4j
  async persistOptimizedSettlements(): Promise<Settlement[]> {
    const settlements = await this.computeOptimizedSettlements();
    if (settlements.length === 0) return [];

    const driver = graph();
    const { db } = await import("../../../shared/infra/db/postgres/postgres-client.config.js");
    const { settlement } = await import("../repos/expense.schema.js");

    //Clear old settlements from PostgreSQL
    await db.delete(settlement);

    //Clear old settlements from Neo4j
    await driver.executeQuery(`MATCH ()-[s:SETTLEMENT]->() DELETE s`);

    //Insert new settlements to PostgreSQL
    const settlementRecords = settlements.map(s => ({
      from: s.from,
      to: s.to,
      amount: s.amount
    }));

    if (settlementRecords.length > 0) {
      await db.insert(settlement).values(settlementRecords);
    }

    //create new optimized settlements in Neo4j
    for (const settle of settlements) {
      await driver.executeQuery(
        `
        MATCH (from:Person {id: $from}), (to:Person {id: $to})
        CREATE (from)-[:SETTLEMENT {amount: $amount, createdAt: datetime()}]->(to)
        `,
        {
          from: settle.from,
          to: settle.to,
          amount: settle.amount
        }
      );
    }

    return settlements;
  }
}
