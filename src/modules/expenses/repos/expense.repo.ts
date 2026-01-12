import { db } from '../../../shared/infra/db/postgres/postgres-client.config.js'; // Import your DB client
import { split, bill } from './expense.schema';
import { graph } from '../../../shared/infra/db/neo4j/neo4j-client.config.js';

interface returnObject{
    transactionId:string
}

interface splitObject{
    userId:string,
    splitAmount:number
}

interface billObject{
    totalAmount:number,
    description:string,
    splitType:"equal"|"percentage"|"exact",
    splitData:splitObject[]
}

export class ExpensePGRepository {
  async splitThat(userId:string,billObject:billObject): Promise<returnObject|null>{  //easter egg => https://tinyurl.com/385e4th9
    const data:string = await db.transaction(async (tx)=>{
        const res = await tx.
            insert(bill).
            values({
                totalAmount:billObject.totalAmount,
                owner:userId,
                description:billObject.description,
                splitType:billObject.splitType
            }).returning();
        if(!res[0] || !res[0].id){
            tx.rollback();
            throw new Error("userId not defined");
        }
        const driver = graph();
        const splitArrayData = billObject.splitData.map(async(entry)=>{
            
            const result = await driver.executeQuery(
            `
                MATCH (p: Person {id: $userId),
                SET p.balance = p.balance + $splitAmount
                RETURN p.id
                `,{
                    userId, 
                    splitAmount:entry.splitAmount
                }
            )
            const result2 = await driver.executeQuery(
            `
                MATCH (p: Person {id: $friendId),
                SET p.balance = p.balance-$splitAmount
                RETURN p.id
                `,{
                    friendId:entry.userId, 
                    splitAmount:entry.splitAmount
                }
            )

            return {
                    slave:entry.userId,
                    expenseId:res[0]?.id ?? "",
                    splitAmount:entry.splitAmount
                };
        });
        await tx.
        insert(split).
        values(splitArrayData);
        return res[0].id;
    });
    return {
        transactionId:data
    }
  }

}