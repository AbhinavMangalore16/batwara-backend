import { inArray } from "drizzle-orm";
import { db } from "../../../shared/infra/db/postgres/postgres-client.config";
import { bill, split } from "../repos/expense.schema";

export interface BalanceMapping{
    [userId: string]: number;
}

export class BalanceService{
    async computeBalances(userIds?: string[]): Promise<BalanceMapping|null>{
        const balances: BalanceMapping = {};
        const bills = userIds
        ? await db.select().from(bill).where(inArray(bill.owner,userIds))
        : await db.select().from(bill);
        const splits = userIds
        ? await db.select().from(split).where(inArray(split.slave,userIds))
        : await db.select().from(split);
        for (const b of bills) {
            const owner = b.owner;
            balances[owner] = (balances[owner] ?? 0) + b.totalAmount;
        }
        for (const s of splits) {
            const slave = s.slave;
            balances[slave] = (balances[slave] ?? 0) - s.splitAmount;
        }
        return balances;
}
}