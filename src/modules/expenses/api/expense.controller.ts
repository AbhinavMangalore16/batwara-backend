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
            return res.status(200).json({message: "bill ban gaya",result})
        }
        else return res.status(404).json({message: "bsdk id to daal header me"})
    } catch (error) {
      console.log(error)
      return res.status(400).json({error: error})
    }
  }
}