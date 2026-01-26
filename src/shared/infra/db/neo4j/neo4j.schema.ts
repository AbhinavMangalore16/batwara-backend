import { graph } from "./neo4j-client.config";

export const NEO4J_SCHEMA = {
    PERSON: 'Person',
    BILL: 'Bill',
    SETTLEMENT: 'Settlement',

    CREATED: 'CREATED',
    PARTICIPATES_IN: 'PARTICIPATES_IN',
    SETTLEMENT: 'SETTLES',
    PAYS: 'PAYS',
    FRIENDS_WITH: 'FRIENDS_WITH',

    constraints: [
        `CREATE CONSTRAINT person_id IF NOT EXISTS FOR (p: Person) REQUIRE p.id IS UNIQUE`,
        `CREATE CONSTRAINT bill_id IF NOT EXISTS FOR (b: Bill) REQUIRE b.id IS UNIQUE`,
        `CREATE CONSTRAINT settlement_id IF NOT EXISTS FOR (s: Settlement) REQUIRE s.id IS UNIQUE`,
    ],
    indexes:[
        `CREATE INDEX person_email IF NOT EXISTS FOR (p:Person) ON (p.email)`,
        `CREATE INDEX bill_created IF NOT EXISTS FOR (b:Bill) ON (b.createdAt)`,
        `CREATE INDEX bill_owner IF NOT EXISTS FOR (b:Bill) ON (b.owner_id)`,
        `CREATE INDEX settlement_from IF NOT EXISTS FOR (s:Settlement) ON (s.from_id)`,
        `CREATE INDEX settlement_to IF NOT EXISTS FOR (s:Settlement) ON (s.to_id)`,  
    ]
}


export async function initializeNeo4jSchema(): Promise<void>{
    const driver = graph();
    for (const constraint of NEO4J_SCHEMA.constraints){
        await driver.executeQuery(constraint);
    }
    for (const index of NEO4J_SCHEMA.indexes){
        await driver.executeQuery(index);
    }
}