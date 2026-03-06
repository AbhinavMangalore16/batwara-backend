import { inArray } from 'drizzle-orm';
import { graph } from '../../../shared/infra/db/neo4j/neo4j-client.config';
import { db } from '../../../shared/infra/db/postgres/postgres-client.config';
import { user } from '../../user/repos/auth.schema';
import { neo4JSettlementService } from '../domain/balance-neo4j.service';
import { SettlementOptimizer } from '../domain/settlement.service';


export interface Settle {
    owesTo: Array<{ to: string; amount: number }>;
    receivesFrom: Array<{ from: string; amount: number }>;
}

export interface Settlement {
    id?: string;
    from: string;
    to: string;
    amount: number;
}


export class SettlementNeo4jRepository {
        constructor(
        private readonly userRepo: {
            getUsersByIds(ids: string[]): Promise<Array<{ id: string; name: string }>>;
        }
    ) {}
    async createSettlement(settlements: Settlement[]): Promise<void> {
        const driver = graph();
        for (const settlement of settlements) {
            await driver.executeQuery(
                `MATCH (from:Person {id: $from}), (to:Person {id: $to})
                 CREATE (from)-[:SETTLEMENT {amount: $amount, createdAt: datetime()}]->(to)`,
                {
                    from: settlement.from,
                    to: settlement.to,
                    amount: settlement.amount,
                }
            );
        }
    }
    async getUserSettlements(userId: string): Promise<{
        owesTo: Array<{ to: string; name: string; amount: number }>;
        receivesFrom: Array<{ from: string; name: string; amount: number }>;
        }> {
        const driver = graph();

        const owingResult = await driver.executeQuery(
            `MATCH (p:Person {id: $userId})-[s:SETTLEMENT]->(creditor:Person)
            RETURN creditor.id AS to, s.amount AS amount`,
            { userId }
        );

        const receivingResult = await driver.executeQuery(
            `MATCH (debtor:Person)-[s:SETTLEMENT]->(p:Person {id: $userId})
            RETURN debtor.id AS from, s.amount AS amount`,
            { userId }
        );

        const owesTo = owingResult.records.map(r => ({
            id: r.get("to"),
            amount: r.get("amount"),
        }));

        const receivesFrom = receivingResult.records.map(r => ({
            id: r.get("from"),
            amount: r.get("amount"),
        }));

        const allIds = [
            ...owesTo.map(x => x.id),
            ...receivesFrom.map(x => x.id),
        ];

        const uniqueIds = [...new Set(allIds)];

        if (uniqueIds.length === 0) {
            return { owesTo: [], receivesFrom: [] };
        }

        // ✅ Correctly use injected userRepo
        const users = await this.userRepo.getUsersByIds(uniqueIds);

        const userMap = new Map(users.map(u => [u.id, u.name]));

        return {
        owesTo: owesTo.map(x => ({
            from: userId,
            to: x.id,
            name: userMap.get(x.id) ?? "Unknown",
            amount: x.amount,
        })),
        receivesFrom: receivesFrom.map(x => ({
            from: x.id,
            to: userId,
            name: userMap.get(x.id) ?? "Unknown",
            amount: x.amount,
        })),
        };
        }
    async getAllSettlements(): Promise<Settlement[]> {
        const driver = graph();
        const result = await driver.executeQuery(
            `MATCH (from:Person)-[s:SETTLEMENT]->(to:Person)
             RETURN from.id AS from, to.id AS to, s.amount AS amount`
        );

        return result.records.map(r => ({
            from: r.get('from'),
            to: r.get('to'),
            amount: r.get('amount'),
        }));
    }
    async clearSettlements(): Promise<void> {
        const driver = graph();
        await driver.executeQuery(`MATCH ()-[s:SETTLEMENT]->() DELETE s`);
    }
}