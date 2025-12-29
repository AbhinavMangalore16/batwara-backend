import { Router } from 'express';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from '../domain/expense.service';
import { ExpensePGRepository } from '../repos/expense.repo';
import { authMiddleware } from '../../../shared/infra/auth/better-auth.middleware';
import type {Request,Response} from 'express'

const expenseRouter = Router();

const expenseRepo = new ExpensePGRepository
const expenseService = new ExpenseService(expenseRepo);
const expenseController = new ExpenseController(expenseService);

// Define the route
expenseRouter.post('/makeBill',authMiddleware,(req:Request,res:Response) => {
    return expenseController.makeBill(req,res);
})

export default expenseRouter;