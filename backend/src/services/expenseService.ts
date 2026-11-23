import { prisma } from '../config/db';
import { SafeDecimal } from '../utils/safeDecimal';
import { CalculationEngine, MonthlyFinancialSummary } from './calculationEngine';
import { AppError } from '../middleware/errorMiddleware';

export interface CreateExpenseDTO {
  name: string;
  amount: string | number;
  category?: string;
  date?: string | Date;
  month?: number;
  year?: number;
}

export interface UpdateExpenseDTO {
  name?: string;
  amount?: string | number;
  category?: string;
  date?: string | Date;
}

export class ExpenseService {
  /**
   * Creates an expense for the authenticated user and recalculates monthly summary.
   */
  public static async createExpense(
    userId: string,
    data: CreateExpenseDTO
  ): Promise<{
    expense: {
      id: string;
      name: string;
      amount: string;
      category: string;
      date: Date;
      month: number;
      year: number;
      createdAt: Date;
    };
    summary: MonthlyFinancialSummary;
  }> {
    const validatedAmount = SafeDecimal.validatePositiveAmount(data.amount, 'Expense amount');
    const expenseDate = data.date ? new Date(data.date) : new Date();

    if (isNaN(expenseDate.getTime())) {
      throw new AppError('Invalid expense date format', 400);
    }

    const month = data.month || expenseDate.getMonth() + 1;
    const year = data.year || expenseDate.getFullYear();

    // Check if an income record exists for this month/year to link it
    const income = await prisma.income.findUnique({
      where: {
        user_month_year_unique: {
          user_id: userId,
          month,
          year,
        },
      },
    });

    const expense = await prisma.expense.create({
      data: {
        user_id: userId,
        income_id: income ? income.id : null,
        name: data.name.trim(),
        amount: validatedAmount.toString(),
        category: (data.category || 'OTHER').toUpperCase(),
        date: expenseDate,
        month,
        year,
      },
    });

    // Fetch all expenses for this month to compute authoritative balance
    const allExpenses = await prisma.expense.findMany({
      where: { user_id: userId, month, year },
      orderBy: { date: 'desc' },
    });

    const summary = CalculationEngine.calculateMonthlySummary({
      incomeAmount: income ? income.amount.toString() : '0.00',
      expenses: allExpenses.map((e) => ({
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
      expense: {
        id: expense.id,
        name: expense.name,
        amount: SafeDecimal.toFixed2(expense.amount.toString()),
        category: expense.category,
        date: expense.date,
        month: expense.month,
        year: expense.year,
        createdAt: expense.created_at,
      },
      summary,
    };
  }

  /**
   * Lists expenses for a month and provides the authoritative summary.
   */
  public static async getExpenses(
    userId: string,
    month: number,
    year: number,
    category?: string
  ): Promise<{
    expenses: Array<{
      id: string;
      name: string;
      amount: string;
      category: string;
      date: Date;
      createdAt: Date;
    }>;
    summary: MonthlyFinancialSummary;
  }> {
    const whereClause: any = {
      user_id: userId,
      month,
      year,
    };

    if (category && category !== 'ALL') {
      whereClause.category = category.toUpperCase();
    }

    const [expenses, allMonthExpenses, income] = await Promise.all([
      prisma.expense.findMany({
        where: whereClause,
        orderBy: { date: 'desc' },
      }),
      // Fetch all expenses without category filter for accurate monthly summary
      prisma.expense.findMany({
        where: { user_id: userId, month, year },
      }),
      prisma.income.findUnique({
        where: {
          user_month_year_unique: {
            user_id: userId,
            month,
            year,
          },
        },
      }),
    ]);

    const summary = CalculationEngine.calculateMonthlySummary({
      incomeAmount: income ? income.amount.toString() : '0.00',
      expenses: allMonthExpenses.map((e) => ({
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
      expenses: expenses.map((e) => ({
        id: e.id,
        name: e.name,
        amount: SafeDecimal.toFixed2(e.amount.toString()),
        category: e.category,
        date: e.date,
        createdAt: e.created_at,
      })),
      summary,
    };
  }

  /**
   * Updates an existing expense and recalculates monthly summary.
   * Strictly enforces user ownership.
   */
  public static async updateExpense(
    userId: string,
    expenseId: string,
    data: UpdateExpenseDTO
  ): Promise<{
    expense: {
      id: string;
      name: string;
      amount: string;
      category: string;
      date: Date;
      month: number;
      year: number;
    };
    summary: MonthlyFinancialSummary;
  }> {
    // 1. Verify existence and ownership
    const existing = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!existing || existing.user_id !== userId) {
      throw new AppError('Expense not found or access denied.', 404);
    }

    const updateData: any = {};
    if (data.name !== undefined) {
      if (!data.name.trim()) throw new AppError('Expense name cannot be empty', 400);
      updateData.name = data.name.trim();
    }
    if (data.amount !== undefined) {
      const validatedAmount = SafeDecimal.validatePositiveAmount(data.amount, 'Expense amount');
      updateData.amount = validatedAmount.toString();
    }
    if (data.category !== undefined) {
      updateData.category = data.category.toUpperCase();
    }
    if (data.date !== undefined) {
      const parsedDate = new Date(data.date);
      if (isNaN(parsedDate.getTime())) throw new AppError('Invalid date', 400);
      updateData.date = parsedDate;
      updateData.month = parsedDate.getMonth() + 1;
      updateData.year = parsedDate.getFullYear();
    }

    const updated = await prisma.expense.update({
      where: { id: expenseId },
      data: updateData,
    });

    // Recalculate summary for the expense's month and year
    const [allExpenses, income] = await Promise.all([
      prisma.expense.findMany({
        where: { user_id: userId, month: updated.month, year: updated.year },
      }),
      prisma.income.findUnique({
        where: {
          user_month_year_unique: {
            user_id: userId,
            month: updated.month,
            year: updated.year,
          },
        },
      }),
    ]);

    const summary = CalculationEngine.calculateMonthlySummary({
      incomeAmount: income ? income.amount.toString() : '0.00',
      expenses: allExpenses.map((e) => ({
        id: e.id,
        name: e.name,
        amount: e.amount.toString(),
        category: e.category,
        date: e.date,
      })),
      month: updated.month,
      year: updated.year,
    });

    return {
      expense: {
        id: updated.id,
        name: updated.name,
        amount: SafeDecimal.toFixed2(updated.amount.toString()),
        category: updated.category,
        date: updated.date,
        month: updated.month,
        year: updated.year,
      },
      summary,
    };
  }

  /**
   * Deletes an expense and recalculates monthly summary.
   * Strictly enforces user ownership.
   */
  public static async deleteExpense(
    userId: string,
    expenseId: string
  ): Promise<{
    deletedExpense: {
      id: string;
      name: string;
      amount: string;
    };
    summary: MonthlyFinancialSummary;
  }> {
    const existing = await prisma.expense.findUnique({
      where: { id: expenseId },
    });

    if (!existing || existing.user_id !== userId) {
      throw new AppError('Expense not found or access denied.', 404);
    }

    await prisma.expense.delete({
      where: { id: expenseId },
    });

    // Recalculate summary after deletion
    const [allExpenses, income] = await Promise.all([
      prisma.expense.findMany({
        where: { user_id: userId, month: existing.month, year: existing.year },
      }),
      prisma.income.findUnique({
        where: {
          user_month_year_unique: {
            user_id: userId,
            month: existing.month,
            year: existing.year,
          },
        },
      }),
    ]);

    const summary = CalculationEngine.calculateMonthlySummary({
      incomeAmount: income ? income.amount.toString() : '0.00',
      expenses: allExpenses.map((e) => ({
        id: e.id,
        name: e.name,
        amount: e.amount.toString(),
        category: e.category,
        date: e.date,
      })),
      month: existing.month,
      year: existing.year,
    });

    return {
      deletedExpense: {
        id: existing.id,
        name: existing.name,
        amount: SafeDecimal.toFixed2(existing.amount.toString()),
      },
      summary,
    };
  }

  /**
   * Generates CSV export content for expenses of a given month/year.
   */
  public static async exportExpensesCSV(
    userId: string,
    month: number,
    year: number
  ): Promise<string> {
    const expenses = await prisma.expense.findMany({
      where: { user_id: userId, month, year },
      orderBy: { date: 'asc' },
    });

    const header = 'ID,Date,Expense Name,Category,Amount (PKR),Month,Year\n';
    const rows = expenses.map((e) => {
      const dateStr = e.date.toISOString().split('T')[0];
      const safeName = `"${e.name.replace(/"/g, '""')}"`;
      return `${e.id},${dateStr},${safeName},${e.category},${SafeDecimal.toFixed2(e.amount.toString())},${e.month},${e.year}`;
    });

    return header + rows.join('\n');
  }
}
