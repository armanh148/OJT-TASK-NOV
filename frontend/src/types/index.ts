export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: string;
  category: string;
  date: string;
  month?: number;
  year?: number;
  createdAt?: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: string;
  formattedAmount: string;
  percentage: string;
}

export interface MonthlySummary {
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
  categoryBreakdown: CategoryBreakdown[];
}

export interface AnalyticsData {
  summary: MonthlySummary;
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
