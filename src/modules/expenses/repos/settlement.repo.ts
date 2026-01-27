import { graph } from '../../../shared/infra/db/neo4j/neo4j-client.config';
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
    async getUserSettlements(userId: string): Promise<Settle> {
        const driver = graph();

        // user owes to others
        const owingResult = await driver.executeQuery(
            `MATCH (p:Person {id: $userId})-[s:SETTLEMENT]->(creditor:Person)
             RETURN creditor.id AS to, s.amount AS amount`,
            { userId }
        );

        //user receives from others
        const receivingResult = await driver.executeQuery(
            `MATCH (debtor:Person)-[s:SETTLEMENT]->(p:Person {id: $userId})
             RETURN debtor.id AS from, s.amount AS amount`,
            { userId }
        );

        return {
            owesTo: owingResult.records.map(r => ({
                to: r.get('to'),
                amount: r.get('amount'),
            })),
            receivesFrom: receivingResult.records.map(r => ({
                from: r.get('from'),
                amount: r.get('amount'),
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