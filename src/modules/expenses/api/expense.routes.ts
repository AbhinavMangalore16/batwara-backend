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

// Bill endpoints
expenseRouter.post('/makeBill', authMiddleware, (req: Request, res: Response) => {
    return expenseController.makeBill(req, res);
});

// Settlement endpoints
expenseRouter.get('/settlements', authMiddleware, (req: Request, res: Response) => {
    return expenseController.getSettlements(req, res);
});

expenseRouter.get('/settlements/user/:userId', authMiddleware, (req: Request, res: Response) => {
    return expenseController.getUserSettlements(req, res);
});

expenseRouter.post('/settlements/:settlementId/pay', authMiddleware, (req: Request, res: Response) => {
    return expenseController.markSettlementPaid(req, res);
});

// Balance endpoints
expenseRouter.get('/balances', authMiddleware, (req: Request, res: Response) => {
    return expenseController.getBalances(req, res);
});

expenseRouter.get('/balances/user/:userId', authMiddleware, (req: Request, res: Response) => {
    return expenseController.getUserBalance(req, res);
});

// Optimized settlements endpoints
expenseRouter.get('/settlements/optimized', authMiddleware, (req: Request, res: Response) => {
    return expenseController.getOptimizedSettlements(req, res);
});

expenseRouter.post('/settlements/optimized/persist', authMiddleware, (req: Request, res: Response) => {
    return expenseController.persistOptimizedSettlements(req, res);
});

export default expenseRouter;
