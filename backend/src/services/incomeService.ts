import { prisma } from '../config/db';
import { SafeDecimal } from '../utils/safeDecimal';
import { CalculationEngine, MonthlyFinancialSummary } from './calculationEngine';

export interface SetIncomeDTO {
  month: number;
  year: number;
  amount: string | number;
}

export class IncomeService {
  /**
   * Sets or updates the monthly income for a user in a specific month/year.
   * Uses atomic upsert based on UNIQUE(user_id, month, year) to guarantee no duplicates.
   */
  public static async setIncome(
    userId: string,
    data: SetIncomeDTO
  ): Promise<{
    income: {
      id: string;
      month: number;
      year: number;
      amount: string;
      createdAt: Date;
      updatedAt: Date;
    };
    summary: MonthlyFinancialSummary;
  }> {
    const validatedAmount = SafeDecimal.validateNonNegativeAmount(data.amount, 'Income amount');

    // Atomic Upsert to prevent duplicate records
    const income = await prisma.income.upsert({
      where: {
        user_month_year_unique: {
          user_id: userId,
          month: data.month,
          year: data.year,
        },
      },
      create: {
        user_id: userId,
        month: data.month,
        year: data.year,
        amount: validatedAmount.toString(),
      },
      update: {
        amount: validatedAmount.toString(),
      },
    });

    // Link any existing unlinked expenses for this month/year to this income record
    await prisma.expense.updateMany({
      where: {
        user_id: userId,
        month: data.month,
        year: data.year,
        income_id: null,
      },
      data: {
        income_id: income.id,
      },
    });

    // Fetch all current expenses for this month to calculate the authoritative summary
    const expenses = await prisma.expense.findMany({
      where: {
        user_id: userId,
        month: data.month,
        year: data.year,
      },
    });

    const summary = CalculationEngine.calculateMonthlySummary({
      incomeAmount: income.amount.toString(),
      expenses: expenses.map((e) => ({
        id: e.id,
        name: e.name,
        amount: e.amount.toString(),
        category: e.category,
        date: e.date,
      })),
      month: data.month,
      year: data.year,
    });

    return {
      income: {
        id: income.id,
        month: income.month,
        year: income.year,
        amount: SafeDecimal.toFixed2(income.amount.toString()),
        createdAt: income.created_at,
        updatedAt: income.updated_at,
      },
      summary,
    };
  }

  /**
   * Retrieves the income and authoritative financial summary for a month.
   */
  public static async getIncome(
    userId: string,
    month: number,
    year: number
  ): Promise<{
    income: {
      id: string | null;
      month: number;
      year: number;
      amount: string;
    };
    summary: MonthlyFinancialSummary;
  }> {
    const income = await prisma.income.findUnique({
      where: {
        user_month_year_unique: {
          user_id: userId,
          month,
          year,
        },
      },
    });

    const expenses = await prisma.expense.findMany({
      where: {
        user_id: userId,
        month,
        year,
      },
      orderBy: { date: 'desc' },
    });

    const summary = CalculationEngine.calculateMonthlySummary({
      incomeAmount: income ? income.amount.toString() : '0.00',
      expenses: expenses.map((e) => ({
        id: e.id,
        name: e.name,
        amount: e.amount.toString(),
        category: e.category,
        date: e.date,
      })),
      month,
      year,
    });

    return {
      income: {
        id: income ? income.id : null,
        month,
        year,
        amount: income ? SafeDecimal.toFixed2(income.amount.toString()) : '0.00',
      },
      summary,
    };
  }
}
