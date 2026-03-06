import { db } from '../../../shared/infra/db/postgres/postgres-client.config.js'; // Import your DB client
import { split, bill } from './expense.schema';
import { graph } from '../../../shared/infra/db/neo4j/neo4j-client.config.js';
import { and, or, eq, desc, sql } from 'drizzle-orm';
import { neo4JSettlementService } from '../domain/balance-neo4j.service.js';
import { SettlementOptimizer } from '../domain/settlement.service.js';

interface returnObject {
    transactionId: string
}

interface splitObject {
    userId: string,
    splitAmount: number
}

interface billObject {
    totalAmount: number,
    description: string,
    splitType: "equal" | "percentage" | "exact",
    splitData: splitObject[]
}

export class ExpensePGRepository {
    async splitThat(userId: string, billObject: billObject): Promise<returnObject | null> {  //easter egg => https://tinyurl.com/385e4th9
        let splitArrayData;
        const data: string = await db.transaction(async (tx) => {
            const res = await tx.
                insert(bill).
                values({
                    totalAmount: billObject.totalAmount,
                    owner: userId,
                    description: billObject.description,
                    splitType: billObject.splitType
                }).returning();
            if (!res[0] || !res[0].id) {
                tx.rollback();
                throw new Error("userId not defined");
            }
            splitArrayData = billObject.splitData.map((entry) => {
                return {
                    slave: entry.userId,
                    expenseId: res[0]?.id ?? "",
                    splitAmount: entry.splitAmount
                };
            });
            await tx.
                insert(split).
                values(splitArrayData);
            return res[0].id;
        });
        const driver = graph();
        const result = await driver.executeQuery(
            `
            UNWIND $map AS data
            MATCH (payer:Person {id: $userId})
            MATCH (debtor:Person {id: data.slave})
            
            OPTIONAL MATCH (debtor)-[r1:OWES]->(payer)
            OPTIONAL MATCH (payer)-[r2:OWES]->(debtor)
            WITH payer, debtor, data, r1, r2, coalesce(r1.amount, 0) - coalesce(r2.amount, 0) + data.splitAmount AS net

            FOREACH (ig IN CASE WHEN r1 IS NOT NULL THEN [1] ELSE [] END | DELETE r1)
            FOREACH (ig IN CASE WHEN r2 IS NOT NULL THEN [1] ELSE [] END | DELETE r2)

            FOREACH (ig IN CASE WHEN net > 0 THEN [1] ELSE [] END | 
                CREATE (debtor)-[:OWES {amount: net}]->(payer)
            )
            FOREACH (ig IN CASE WHEN net < 0 THEN [1] ELSE [] END |
                CREATE (payer)-[:OWES {amount: -net}]->(debtor)
            )
            RETURN payer.id AS to, debtor.id AS from, net

      `, {
            map: splitArrayData,
            userId,
        }
        )
        return {
            transactionId: data
        }
    }
    async validAllFriends(userId: string, restIds: string[]): Promise<boolean> {
        const driver = graph();
        const result = await driver.executeQuery(
            `
        MATCH (p: Person {id: $userId})
        WHERE ALL(fid in $restIds WHERE fid=p.id OR
        EXISTS{
        MATCH (p)-[:FRIENDS_WITH]-(f: Person {id: fid})
            }
        )
        RETURN true as allFriends
        `,
            { userId, restIds }
        );
        return result.records[0]?.get('allFriends') === true;
    }
    async getFriendTransactions(userId: string, friendId: string) {
      return await db.select({
          billId: bill.id,
          description: bill.description,
          totalBillAmount: bill.totalAmount,
          splitAmount: split.splitAmount,
          paidBy: bill.owner,
          owedBy: split.slave,
          date: bill.created_at,
      })
      .from(bill)
      .innerJoin(split, eq(bill.id, split.expenseId))
      .where(
          or(
              // Current user paid, friend was part of the split
              and(eq(bill.owner, userId), eq(split.slave, friendId)),
              // Friend paid, current user was part of the split
              and(eq(bill.owner, friendId), eq(split.slave, userId))
          )
      )
      .orderBy(desc(bill.created_at));
  }

  /**
   * Aggregate data for dashboard charts
   * @param period 'day', 'week', 'month', or 'year'
   */
    async getChartData(
    userId: string,
    period: 'day' | 'week' | 'month' | 'year' = 'month'
    ) {
    const paidByMe = await db
        .select({
        date: sql<Date>`DATE_TRUNC(${sql.raw(`'${period}'`)}, ${bill.created_at})`,
        totalAmount: sql<number>`COALESCE(SUM(${bill.totalAmount}),0)::int`,
        })
        .from(bill)
        .where(eq(bill.owner, userId))
        .groupBy(sql`DATE_TRUNC(${sql.raw(`'${period}'`)}, ${bill.created_at})`)
        .orderBy(sql`DATE_TRUNC(${sql.raw(`'${period}'`)}, ${bill.created_at})`);

    const owedByMe = await db
        .select({
        date: sql<Date>`DATE_TRUNC(${sql.raw(`'${period}'`)}, ${split.created_at})`,
        totalAmount: sql<number>`COALESCE(SUM(${split.splitAmount}),0)::int`,
        })
        .from(split)
        .where(eq(split.slave, userId))
        .groupBy(sql`DATE_TRUNC(${sql.raw(`'${period}'`)}, ${split.created_at})`)
        .orderBy(sql`DATE_TRUNC(${sql.raw(`'${period}'`)}, ${split.created_at})`);

    return { paidByMe, owedByMe };
}
}