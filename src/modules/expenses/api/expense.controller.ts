import { Request, Response } from 'express';
import { ExpenseService } from '../domain/expense.service';
import { BillSchema } from '../dtos/bill.dto';

export class ExpenseController {
  constructor(private expenseService: ExpenseService) {}

  async makeBill(req: Request, res: Response) {
    try {
        const id:string | undefined = res.locals.id;
        if(id){
            const result = await this.expenseService.createBill(id,BillSchema.parse(req.body));
            return res.status(200).json({message: "Bill made!",result})
        }
        else return res.status(404).json({message: "ID not found in header"})
    } catch (error) {
      console.log(error)
      return res.status(400).json({error: error})
    }
  }

  async getSettlements(req: Request, res: Response) {
    try {
      const settlements = await this.expenseService.getAllSettlements();
      return res.status(200).json({ settlements });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error });
    }
  }

  async getUserSettlements(req: Request, res: Response) {
    try {
      const userId: string | undefined = res.locals.id;
      if (!userId) {
        return res.status(404).json({ message: 'User ID not found' });
      }
      const settlements = await this.expenseService.getUserSettlements(userId);
      return res.status(200).json({ settlements });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error });
    }
  }

  async getBalances(req: Request, res: Response) {
    try {
      const balances = await this.expenseService.getBalances();
      return res.status(200).json({ balances });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error });
    }
  }

  async getUserBalance(req: Request, res: Response) {
    try {
      const userId = res.locals.id; // 👈 always use auth

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const balances = await this.expenseService.getBalances(userId);

      return res.status(200).json(balances); // 👈 return directly
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  async getOptimizedSettlements(req: Request, res: Response) {
    try {
      const optimized = await this.expenseService.getOptimizedSettlements();
      return res.status(200).json({ optimized });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error });
    }
  }

  async persistOptimizedSettlements(req: Request, res: Response) {
    try {
      const persisted = await this.expenseService.persistOptimizedSettlements();
      return res.status(200).json({ 
        message: 'Optimized settlements computed and persisted', 
        settlements: persisted 
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error });
    }
  }

  async markSettlementPaid(req: Request, res: Response) {
    try {
      const id: string | undefined = res.locals.id;
      const settlementId: any = req.params.settlementId;
      if (!settlementId || typeof settlementId !== 'string') {
        throw new Error('Invalid settlementId');
    }
      if (!id) {
        return res.status(400).json({ message: 'User ID or Settlement ID missing' });
      }
      const result = await this.expenseService.markSettlementPaid(settlementId, id);
      return res.status(200).json({ message: 'Settlement marked as paid', result });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error });
    }
  }

  async getFriendDetails(req: Request, res: Response) {
    try {
      const userId: string | undefined = res.locals.id;
      const friendId: string | undefined = req.params.friendId;
      if (!userId) {
        return res.status(404).json({ message: 'User ID not found in header' });
      }
      if (!friendId) {
        return res.status(400).json({ message: 'Friend ID not provided' });
      }
      const details = await this.expenseService.getFriendDetails(userId, friendId);
      return res.status(200).json(details);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error });
    }
  }
  

  async getDashboardChartData(req: Request, res: Response) {
    try {
      const userId: string | undefined = res.locals.id;
      const period = (req.query.period as 'day' | 'week' | 'month' | 'year') || 'month';
      if (!userId) {
        return res.status(404).json({ message: 'User ID not found in header' });
      }
      const chartData = await this.expenseService.getDashboardChartData(userId, period);
      return res.status(200).json(chartData);
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error });
    }
  }
}
