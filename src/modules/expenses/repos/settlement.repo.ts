import { graph } from "../../../shared/infra/db/neo4j/neo4j-client.config";

interface Settle{
    owesTo: Array<{to: string; amount: number}>;
    receivesFrom: Array<{from: string; amount: number}>;
}

export interface Settlement{
    id: string;
    from: string;
    to: string;
    amount: number;
}


export class SettlementNJRepository{
    async createSettlement(settlements: Settlement[]): Promise<void>{
        const driver = graph();
        for (const settlement of settlements){
            await driver.executeQuery(
                `
                MATCH (from: Person {id: $fromId}), (to: Person {id: $toId})
                CREATE (from)-[:SETTLES {
                id: $id,
                amount: $amount,
                createdAt: datetime()
                }]->(to)
                `, settlement
            )
        }
    }
    async getUserSettlements(userId: string): Promise<Settle>{
        const driver = graph();
        const owingResult = await driver.executeQuery(
            `MATCH (p:Person {id: $userId})-[s:SETTLES]-(cred: Person)
            RETURN cred.id AS to, s.amount AS amount
            `,
            {userId}
        );
        const receivingResult = await driver.executeQuery(
            `
            MATCH (debt: Person)-[s:SETTLES]->(p:Person{id: $userId})
            RETURN debt.id AS from, s.amount AS amount
            `,
            {userId}
        );
        return {
            owesTo: owingResult.records.map((r)=>({
                to: r.get('to'),
                amount: r.get('amount'),
            })),
            receivesFrom: receivingResult.records.map((r)=>({
                from: r.get('from'),
                amount: r.get('amount')
            }))
        }
    }

    async getAllSettlements(): Promise<Settlement[]>{
        const driver = graph();
        const result = await driver.executeQuery(
            `
            MATCH (from: Person)-[s:SETTLES]->(to:Person)
            RETURN s.id AS id, from.id AS from, to.id AS to, s.amount AS amount
            `
        )
        return result.records.map(r=>({
            id: r.get('id'),
            from: r.get('from'),
            to: r.get('to'),
            amount: r.get('amount'),
        }));
    }
    async clearSettlements(): Promise<void>{
        const driver = graph();
        await driver.executeQuery(
            `
            MATCH ()-[s:SETTLES]->()
            DELETE s
            `
        );
    }
}