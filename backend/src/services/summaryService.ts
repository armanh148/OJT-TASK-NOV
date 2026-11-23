import Decimal from 'decimal.js';
import { prisma } from '../config/db';
import { CalculationEngine, MonthlyFinancialSummary } from './calculationEngine';
import { SafeDecimal } from '../utils/safeDecimal';

export interface SummaryAnalyticsResponse {
  summary: MonthlyFinancialSummary;
  isBudgetWarning80: boolean;
  previousMonthComparison: {
    hasPreviousData: boolean;
    previousMonth: number;
    previousYear: number;
    previousIncome: string;
    previousExpense: string;
    expenseDiff: string;
    expenseChangePercentage: string;
  };
}

export class SummaryService {
  public static async getAnalyticsSummary(
    userId: string,
    month: number,
    year: number
  ): Promise<SummaryAnalyticsResponse> {
    // Current month data
    const [currentIncome, currentExpenses] = await Promise.all([
      prisma.income.findUnique({
        where: {
          user_month_year_unique: {
            user_id: userId,
            month,
            year,
          },
        },
      }),
      prisma.expense.findMany({
        where: { user_id: userId, month, year },
      }),
    ]);

    const summary = CalculationEngine.calculateMonthlySummary({
      incomeAmount: currentIncome ? currentIncome.amount.toString() : '0.00',
      expenses: currentExpenses.map((e) => ({
        id: e.id,
        name: e.name,
        amount: e.amount.toString(),
        category: e.category,
        date: e.date,
      })),
      month,
      year,
    });

    // 80% budget alert: Spent >= 80% of income and not yet overspent (> 100%)
    const spentPercent = new Decimal(summary.budgetSpentPercentage);
    const isBudgetWarning80 = spentPercent.gte(80) && spentPercent.lte(100);

    // Previous month calculation
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }

    const [prevIncome, prevExpenses] = await Promise.all([
      prisma.income.findUnique({
        where: {
          user_month_year_unique: {
            user_id: userId,
            month: prevMonth,
            year: prevYear,
          },
        },
      }),
      prisma.expense.findMany({
        where: { user_id: userId, month: prevMonth, year: prevYear },
      }),
    ]);

    const hasPreviousData = !!(prevIncome || prevExpenses.length > 0);
    const prevExpenseTotal = SafeDecimal.sum(prevExpenses.map((e) => e.amount.toString()));
    const curExpenseTotal = new Decimal(summary.totalExpense);

    let expenseChangePercentage = '0.00';
    const expenseDiff = curExpenseTotal.minus(prevExpenseTotal);

    if (prevExpenseTotal.gt(0)) {
      expenseChangePercentage = expenseDiff.dividedBy(prevExpenseTotal).times(100).toFixed(2);
    }

    return {
      summary,
      isBudgetWarning80,
      previousMonthComparison: {
        hasPreviousData,
        previousMonth: prevMonth,
        previousYear: prevYear,
        previousIncome: prevIncome ? SafeDecimal.toFixed2(prevIncome.amount.toString()) : '0.00',
        previousExpense: prevExpenseTotal.toFixed(2),
        expenseDiff: expenseDiff.toFixed(2),
        expenseChangePercentage,
      },
    };
  }
}
