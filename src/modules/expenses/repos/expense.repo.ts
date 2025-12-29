import { db } from '../../../shared/infra/db/postgres/postgres-client.config.js'; // Import your DB client
import { split, bill } from './expense.schema';

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
  async splitOnThatThang(userId:string,billObject:billObject): Promise<returnObject|null>{  //easter egg => https://tinyurl.com/385e4th9
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
        const splitArrayData = billObject.splitData.map((entry)=>{
            return {
                    slave:entry.userId,
                    expenseId:res[0]?.id,
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