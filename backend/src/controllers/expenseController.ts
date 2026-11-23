import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ExpenseService } from '../services/expenseService';

export const createExpenseSchema = z.object({
  name: z.string().min(1, 'Expense name is required').max(150, 'Expense name too long'),
  amount: z.union([z.number(), z.string()]),
  category: z.string().optional(),
  date: z.string().optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
});

export const getExpensesQuerySchema = z.object({
  month: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : new Date().getMonth() + 1)),
  year: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : new Date().getFullYear())),
  category: z.string().optional(),
});

export const updateExpenseSchema = z.object({
  name: z.string().min(1, 'Expense name cannot be empty').max(150).optional(),
  amount: z.union([z.number(), z.string()]).optional(),
  category: z.string().optional(),
  date: z.string().optional(),
});

export const expenseIdParamSchema = z.object({
  id: z.string().uuid('Invalid expense ID format'),
});

export class ExpenseController {
  public static async createExpense(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await ExpenseService.createExpense(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Expense created successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getExpenses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const month = Number(req.query.month) || new Date().getMonth() + 1;
      const year = Number(req.query.year) || new Date().getFullYear();
      const category = req.query.category as string | undefined;

      const result = await ExpenseService.getExpenses(userId, month, year, category);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateExpense(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const expenseId = req.params.id as string;
      const result = await ExpenseService.updateExpense(userId, expenseId, req.body);
      res.status(200).json({
        success: true,
        message: 'Expense updated successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteExpense(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const expenseId = req.params.id as string;
      const result = await ExpenseService.deleteExpense(userId, expenseId);
      res.status(200).json({
        success: true,
        message: 'Expense deleted successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async exportExpenses(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const month = Number(req.query.month) || new Date().getMonth() + 1;
      const year = Number(req.query.year) || new Date().getFullYear();

      const csvData = await ExpenseService.exportExpensesCSV(userId, month, year);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=expenses_${year}_${month}.csv`
      );
      res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  }
}
