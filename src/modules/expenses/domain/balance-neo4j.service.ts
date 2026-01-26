import { graph } from "../../../shared/infra/db/neo4j/neo4j-client.config";


export class neo4JSettlementService{
    async computeBalances(): Promise<Record<string, number>>{
        const driver = graph();
        const result = await driver.executeQuery(
            `
            MATCH (p:Person)
            WITH collect(p.id) as allPersons
            UNWIND allPersons as personId

            OPTIONAL MATCH (p: Person {id: personId}-[:CREATED]->(b: Bill))
            WITH personId, COALESCE(SUM(b.totalAmount),0) as paid

            OPTIONAL MATCH (p: Person {id: personId})-[part: PARTICIPATES_IN]->(b: Bill)
            WITH personId, paid, COALESCE(SUM(part.amount), 0) as owes

            RETURN personId, (paid - owes) as balance
            WHERE balance <> 0
            `
        );
        const balances: Record<string, number>={};
        for (const rec of result.records){
            const personId = rec.get('personId');
            const balance = rec.get('balance');
            balances[personId] = balance;
        }
        return balances;
    }
    async getUserBalance(userId: string): Promise<number>{
        const driver= graph(); 
        const result = await driver.executeQuery(
            `
            MATCH (p: Person {id: $userId})
            OPTIONAL MATCH (p)-[:CREATED]->(b:Bill)
            WITH p, COALESCE(SUM(b.totalAmount),0) as paid
            OPTIONAL MATCH (p)-[part: PARTICIPATES_IN]->(b2: Bill)
            WITH p, paid, COALESCE(SUM(part.amount),0) as owes
            RETURN (paid-owes) as balance
            `, {userId}
        );
        return result.records[0]?.get('balance')||0;
    }
}