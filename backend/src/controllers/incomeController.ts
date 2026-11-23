import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { IncomeService } from '../services/incomeService';

export const setIncomeSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  amount: z.union([z.number(), z.string()]),
});

export const getIncomeQuerySchema = z.object({
  month: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : new Date().getMonth() + 1)),
  year: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : new Date().getFullYear())),
});

export class IncomeController {
  public static async setIncome(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await IncomeService.setIncome(userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Monthly income saved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getIncome(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const month = Number(req.query.month) || new Date().getMonth() + 1;
      const year = Number(req.query.year) || new Date().getFullYear();

      const result = await IncomeService.getIncome(userId, month, year);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
