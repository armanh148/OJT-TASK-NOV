import Decimal from 'decimal.js';
import { SafeDecimal } from '../utils/safeDecimal';
import { formatPKR } from '../utils/currency';

export interface RawExpenseItem {
  id?: string;
  name?: string;
  amount: string | number | Decimal;
  category?: string;
  date?: Date | string;
}

export interface CategorySummaryItem {
  category: string;
  amount: string;
  formattedAmount: string;
  percentage: string;
}

export interface MonthlyFinancialSummary {
  month: number;
  year: number;
  totalIncome: string;
  totalExpense: string;
  remainingBalance: string;
  isOverspent: boolean;
  overspentAmount: string;
  budgetSpentPercentage: string;
  formattedTotalIncome: string;
  formattedTotalExpense: string;
  formattedRemainingBalance: string;
  categoryBreakdown: CategorySummaryItem[];
}

export class CalculationEngine {
  /**
   * Authoritative calculation of monthly financial figures.
   *
   * Formula:
   * Total Income = Monthly Income (or 0.00 if unset)
   * Total Expense = SUM(valid expenses for that user and month)
   * Remaining Balance = Total Income - Total Expense
   * isOverspent = Remaining Balance < 0
   *
   * Uses arbitrary-precision decimal mathematics with zero floating-point error.
   */
  public static calculateMonthlySummary(params: {
    incomeAmount?: string | number | Decimal | null;
    expenses: RawExpenseItem[];
    month: number;
    year: number;
  }): MonthlyFinancialSummary {
    const { incomeAmount, expenses, month, year } = params;

    // 1. Authoritative Total Income
    const incomeDec = incomeAmount
      ? SafeDecimal.validateNonNegativeAmount(incomeAmount, 'Income')
      : new Decimal(0);

    // 2. Authoritative Total Expense (Summation of valid expenses)
    let totalExpenseDec = new Decimal(0);
    const categoryTotals: Record<string, Decimal> = {};

    for (const exp of expenses) {
      const expDec = SafeDecimal.validatePositiveAmount(exp.amount, 'Expense amount');
      totalExpenseDec = totalExpenseDec.plus(expDec);

      const category = (exp.category || 'OTHER').toUpperCase();
      if (!categoryTotals[category]) {
        categoryTotals[category] = new Decimal(0);
      }
      categoryTotals[category] = categoryTotals[category].plus(expDec);
    }

    // 3. Authoritative Remaining Balance = Total Income - Total Expense
    const remainingBalanceDec = incomeDec.minus(totalExpenseDec);

    // 4. Overspending analysis
    const isOverspent = remainingBalanceDec.isNegative();
    const overspentAmountDec = isOverspent ? remainingBalanceDec.abs() : new Decimal(0);

    // 5. Budget spent percentage
    let budgetSpentPercentage = '0.00';
    if (incomeDec.gt(0)) {
      budgetSpentPercentage = totalExpenseDec
        .dividedBy(incomeDec)
        .times(100)
        .toFixed(2);
    } else if (totalExpenseDec.gt(0)) {
      // Spent with 0 income is 100% over-budget
      budgetSpentPercentage = '100.00';
    }

    // 6. Category Breakdown with percentage of total expenses
    const categoryBreakdown: CategorySummaryItem[] = Object.keys(categoryTotals)
      .map((cat) => {
        const catAmountDec = categoryTotals[cat];
        let catPercentage = '0.00';
        if (totalExpenseDec.gt(0)) {
          catPercentage = catAmountDec
            .dividedBy(totalExpenseDec)
            .times(100)
            .toFixed(2);
        }
        return {
          category: cat,
          amount: catAmountDec.toFixed(2),
          formattedAmount: formatPKR(catAmountDec),
          percentage: catPercentage,
        };
      })
      .sort((a, b) => new Decimal(b.amount).minus(new Decimal(a.amount)).toNumber());

    return {
      month,
      year,
      totalIncome: incomeDec.toFixed(2),
      totalExpense: totalExpenseDec.toFixed(2),
      remainingBalance: remainingBalanceDec.toFixed(2),
      isOverspent,
      overspentAmount: overspentAmountDec.toFixed(2),
      budgetSpentPercentage,
      formattedTotalIncome: formatPKR(incomeDec),
      formattedTotalExpense: formatPKR(totalExpenseDec),
      formattedRemainingBalance: formatPKR(remainingBalanceDec),
      categoryBreakdown,
    };
  }
}
