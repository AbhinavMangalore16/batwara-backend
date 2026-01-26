import {Heap} from 'heap-js';

interface HNode{
    userId: string;
    amount: number;
}

export interface Settlement{
    from: string;
    to: string;
    amount: number;
}

export class SettlementOptimizer{
    optimizeSettlements(balances: Record<string, number>): Settlement[] {
        const gainers = new Heap<HNode>((x,y)=> y.amount-x.amount);
        const losers = new Heap<HNode>((x,y)=> x.amount-y.amount);
        const settlements: Settlement[] = [];
        const EPS = 1;
        for (const [userId, amount] of Object.entries(balances)){
            if (amount>EPS){
                gainers.push({userId, amount});
            } else if(amount<-EPS){
                losers.push({userId, amount});
            }
        }
        while (gainers.size()>0 && losers.size()>0){
            const gainer = gainers.poll()!;
            const loser = losers.poll()!;
            const settleAmt = Math.min(gainer.amount, -loser.amount);
            settlements.push({
                from: loser.userId,
                to: gainer.userId,
                amount: settleAmt,
            })
            const gainerRem = gainer.amount-settleAmt;
            const loserRem = loser.amount+settleAmt;
            if (gainerRem>EPS){
                gainers.push({userId: gainer.userId, amount: gainerRem});
            }
            if (loserRem<-EPS){
                losers.push({userId: loser.userId, amount: loserRem});
            }
        }
        return settlements;
    }
}