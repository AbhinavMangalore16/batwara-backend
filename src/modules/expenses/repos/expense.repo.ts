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
    let splitArrayData;
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
        splitArrayData = billObject.splitData.map((entry)=>{

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
    const driver = graph();
    const result = await driver.executeQuery(
      `
      UNWIND $map as data
      MATCH (p: Person {id: $userId})-[r:FRIENDS_WITH]-(f: Person {id: data.slave})
      SET r.owes =
        coalesce(r.owes, 0) +
        CASE
            WHEN startNode(r) = p THEN data.splitAmount
            ELSE -data.splitAmount
        END
      RETURN p,f
      `,{
        map:splitArrayData,
        userId, 
      }
    )
    return {
        transactionId:data
    }
  }

}