import { db } from '../../../shared/infra/db/postgres/postgres-client.config.js'; // Import your DB client
import { split, bill } from './expense.schema';
import { graph } from '../../../shared/infra/db/neo4j/neo4j-client.config.js';

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
            MATCH (p:Person {id: $userId})
            MATCH (f:Person {id: data.slave})
            OPTIONAL MATCH (p)-[r1:OWES]->(f)
            OPTIONAL MATCH (f)-[r2:OWES]->(p)
            WITH p, f, data, r1, r2, coalesce(r1.amount, 0) - coalesce(r2.amount, 0) + data.splitAmount AS net

            FOREACH (ig IN CASE WHEN r1 IS NOT NULL THEN [1] ELSE [] END | DELETE r1)
            FOREACH (ig IN CASE WHEN r2 IS NOT NULL THEN [1] ELSE [] END | DELETE r2)

            FOREACH (ig IN CASE WHEN net >0 THEN [1] ELSE [] END | 
                CREATE (p)-[:OWES {amount: net}]->(f)
            )
            FOREACH (ig IN CASE WHEN net < 0 THEN [1] ELSE [] END |
                CREATE (f)-[:OWES {amount: -net}]->(p)
            )
            RETURN p.id AS from, f.id AS to, net

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
}