import { ExpensePGRepository } from "../repos/expense.repo";
import { SettlementNeo4jRepository, Settlement } from "../repos/settlement.repo";
import { dtoTypes } from "../dtos";
import { eq } from "drizzle-orm";
import { UserPGRepository } from "../../user/repos/user.repo";

export class ExpenseService {
  private settlementRepo: SettlementNeo4jRepository;

  constructor(
    private expenseRepo: ExpensePGRepository,
    settlementRepo?: SettlementNeo4jRepository
  ) {
      this.settlementRepo =
    settlementRepo ?? new SettlementNeo4jRepository(new UserPGRepository());
  }

  private calculateSplitAmounts(
    totalAmount: number,
    splitType: "equal" | "exact" | "percentage",
    data: any[]
  ): Array<{ userId: string; splitAmount: number }> {
    if (splitType === "equal") {
      const count = data.length;
      const base = Math.floor(totalAmount / count);
      const remainder = totalAmount % count;
      return data.map((val, index) => ({
        userId: val.userId,
        splitAmount: base + (index < remainder ? 1 : 0)
      }));
    }
    
    if (splitType === "exact") {
      return data.map((val) => ({
        userId: val.userId,
        splitAmount: val.amount
      }));
    }
    
    if (splitType === "percentage") {
      return data.map((val) => ({
        userId: val.userId,
        splitAmount: Math.floor((val.percentage * totalAmount) / 100)
      }));
    }
    
    return [];
  }

  async createBill(id: string, billingObject: dtoTypes["BillDTO"]): Promise<string | null> {
    const friendUsers = billingObject.splitData.data
    .map((v) => v.userId)
    .filter((uid) => uid !== id);
    const validFriends = await this.expenseRepo.validAllFriends(id, friendUsers);
    if (!validFriends) {
      throw new Error("All users must be friends with the bill creator!");
    }

    const mappedData = this.calculateSplitAmounts(
      billingObject.totalAmount,
      billingObject.splitData.splitType,
      billingObject.splitData.data
    );

    const myBillingObject = {
      totalAmount: billingObject.totalAmount,
      description: billingObject.description,
      splitType: billingObject.splitData.splitType,
      splitData: mappedData
    };

    try {
      const res = await this.expenseRepo.splitThat(id, myBillingObject);
      
      if (res?.transactionId) {
        // Create settlements for each split
        const settlements: Settlement[] = mappedData
          .filter((split) => split.userId !== id)
          .map(split => ({
          from: split.userId,
          to: id,
          amount: split.splitAmount
        }));
        
        if (settlements.length > 0) {
          await this.settlementRepo.createSettlement(settlements);
        }
        return res.transactionId;
      }
    } catch (error) {
      console.error("Error creating bill and settlements:", error);
      throw error;
    }
    
    return null;
  }

  async getAllSettlements() {
    return await this.settlementRepo.getAllSettlements();
  }

  async getUserSettlements(userId: string) {
    return await this.settlementRepo.getUserSettlements(userId);
  }

  async getBalances(userId?: string) {
    const balanceService = new (await import("../domain/balance-neo4j.service.js")).neo4JSettlementService();
    const balances = await balanceService.computeBalances(userId);
    
    // Persist balances to Neo4j nodes
    if (!userId) {
      await balanceService.persistBalances();
    }
    
    return balances;
  }
  

  async getOptimizedSettlements() {
    const balanceService = new (await import("../domain/balance-neo4j.service.js")).neo4JSettlementService();
    return await balanceService.computeOptimizedSettlements();
  }

  async persistOptimizedSettlements() {
    const balanceService = new (await import("../domain/balance-neo4j.service.js")).neo4JSettlementService();
    return await balanceService.persistOptimizedSettlements();
  }

  async markSettlementPaid(settlementId: string, userId: string) {
    try {
      // Query to find and delete the settlement from both DB and Neo4j
      const { db } = await import("../../../shared/infra/db/postgres/postgres-client.config.js");
      const { settlement } = await import("../repos/expense.schema.js");
      const { graph } = await import("../../../shared/infra/db/neo4j/neo4j-client.config.js");
      
      const driver = graph();
      
      // Delete from Neo4j
      await driver.executeQuery(
        `MATCH (from:Person)-[s:SETTLEMENT]->(to:Person {id: $userId})
         WHERE from.id = $settlementId OR to.id = $settlementId
         DELETE s
         RETURN count(*) as deleted`,
        { settlementId, userId }
      );
      
      // Delete from PostgreSQL
      await db.delete(settlement).where(eq(settlement.id, settlementId));
      
      return {
        settlementId,
        status: 'paid',
        markedBy: userId,
        markedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error("Error marking settlement as paid:", error);
      throw error;
    }
  }
  async getFriendDetails(userId: string, friendId: string) {
    const history = await this.expenseRepo.getFriendTransactions(userId, friendId);

    const raw = await this.settlementRepo.getUserSettlements(userId);
    const owesTo = raw?.owesTo ?? [];
    const receivesFrom = raw?.receivesFrom ?? [];
    const allSettlements = [...owesTo, ...receivesFrom];
    const directSettlements = allSettlements.filter(
      (s: any) =>
        (s.to === friendId && s.from === userId) ||
        (s.from === friendId && s.to === userId)
    );

    return {
      friendId,
      history,
      activeSettlements: directSettlements,
    };
  }

  async getDashboardChartData(userId: string, period: 'day' | 'week' | 'month' | 'year') {
      return await this.expenseRepo.getChartData(userId, period);
  }
}
