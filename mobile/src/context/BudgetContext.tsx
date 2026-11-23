import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

export interface Income {
  id: string;
  amount: string;
  month: number;
  year: number;
}

export interface Expense {
  id: string;
  name: string;
  amount: string;
  category: string;
  date: string;
  month: number;
  year: number;
}

export interface FinancialSummary {
  totalIncome: string;
  totalExpenses: string;
  remainingBalance: string;
  expenseCount: number;
  percentageSpent: number;
  isOverspent: boolean;
  isNearLimit: boolean;
  categoryBreakdown: Record<string, string>;
}

interface BudgetContextType {
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  setMonthAndYear: (month: number, year: number) => void;
  income: Income | null;
  expenses: Expense[];
  summary: FinancialSummary;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  setMonthlyIncome: (amount: number | string) => Promise<{ success: boolean; message?: string }>;
  addExpense: (data: {
    name: string;
    amount: number | string;
    category?: string;
    date?: string;
  }) => Promise<{ success: boolean; message?: string; overspentWarning?: boolean }>;
  updateExpense: (
    id: string,
    data: {
      name?: string;
      amount?: number | string;
      category?: string;
      date?: string;
    }
  ) => Promise<{ success: boolean; message?: string }>;
  deleteExpense: (id: string) => Promise<{ success: boolean; message?: string }>;
}

const defaultSummary: FinancialSummary = {
  totalIncome: '0.00',
  totalExpenses: '0.00',
  remainingBalance: '0.00',
  expenseCount: 0,
  percentageSpent: 0,
  isOverspent: false,
  isNearLimit: false,
  categoryBreakdown: {},
};

const BudgetContext = createContext<BudgetContextType>({
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  setSelectedMonth: () => {},
  setSelectedYear: () => {},
  setMonthAndYear: () => {},
  income: null,
  expenses: [],
  summary: defaultSummary,
  isLoading: false,
  isRefreshing: false,
  error: null,
  refreshData: async () => {},
  setMonthlyIncome: async () => ({ success: false }),
  addExpense: async () => ({ success: false }),
  updateExpense: async () => ({ success: false }),
  deleteExpense: async () => ({ success: false }),
});

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  const [income, setIncome] = useState<Income | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>(defaultSummary);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute Client-Side Mirroring for instantaneous recalculation
  const computeClientSummary = (
    inc: Income | null,
    expList: Expense[]
  ): FinancialSummary => {
    const incAmount = inc ? parseFloat(inc.amount) || 0 : 0;
    let expTotal = 0;
    const catMap: Record<string, number> = {};

    for (const exp of expList) {
      const amt = parseFloat(exp.amount) || 0;
      expTotal += amt;
      const cat = exp.category || 'OTHER';
      catMap[cat] = (catMap[cat] || 0) + amt;
    }

    const rem = incAmount - expTotal;
    const pct = incAmount > 0 ? (expTotal / incAmount) * 100 : 0;

    const breakdownFormatted: Record<string, string> = {};
    for (const [k, v] of Object.entries(catMap)) {
      breakdownFormatted[k] = v.toFixed(2);
    }

    return {
      totalIncome: incAmount.toFixed(2),
      totalExpenses: expTotal.toFixed(2),
      remainingBalance: rem.toFixed(2),
      expenseCount: expList.length,
      percentageSpent: parseFloat(pct.toFixed(2)),
      isOverspent: rem < 0,
      isNearLimit: pct >= 80 && pct <= 100,
      categoryBreakdown: breakdownFormatted,
    };
  };

  const loadData = useCallback(
    async (isBackgroundRefresh = false) => {
      if (!token) {
        setIncome(null);
        setExpenses([]);
        setSummary(defaultSummary);
        return;
      }

      if (isBackgroundRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const [incomeRes, expensesRes, summaryRes] = await Promise.all([
          api.income.get(selectedMonth, selectedYear),
          api.expenses.list(selectedMonth, selectedYear),
          api.summary.get(selectedMonth, selectedYear),
        ]);

        let loadedIncome: Income | null = null;
        if (incomeRes.success && incomeRes.data) {
          loadedIncome = incomeRes.data.income;
          setIncome(loadedIncome);
        } else {
          setIncome(null);
        }

        let loadedExpenses: Expense[] = [];
        if (expensesRes.success && Array.isArray(expensesRes.data)) {
          loadedExpenses = expensesRes.data;
          setExpenses(loadedExpenses);
        } else {
          setExpenses([]);
        }

        if (summaryRes.success && summaryRes.data) {
          setSummary(summaryRes.data);
        } else {
          // Fallback to client derived computation
          setSummary(computeClientSummary(loadedIncome, loadedExpenses));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load budget data');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [token, selectedMonth, selectedYear]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const setMonthAndYear = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const setMonthlyIncome = async (amount: number | string) => {
    const res = await api.income.set(selectedMonth, selectedYear, amount);
    if (res.success && res.data) {
      const newIncome: Income = {
        id: res.data.id,
        amount: String(res.data.amount),
        month: selectedMonth,
        year: selectedYear,
      };
      setIncome(newIncome);
      setSummary(computeClientSummary(newIncome, expenses));
      // Refresh to ensure server sync
      loadData(true);
      return { success: true, message: 'Monthly income saved successfully' };
    }
    return { success: false, message: res.message || 'Failed to set income' };
  };

  const addExpense = async (data: {
    name: string;
    amount: number | string;
    category?: string;
    date?: string;
  }) => {
    const numAmount = parseFloat(String(data.amount));
    const currRem = parseFloat(summary.remainingBalance);
    const willOverspend = numAmount > currRem;

    const res = await api.expenses.create({
      ...data,
      month: selectedMonth,
      year: selectedYear,
    });

    if (res.success && res.data) {
      const newExp: Expense = {
        id: res.data.id,
        name: res.data.name,
        amount: String(res.data.amount),
        category: res.data.category || 'OTHER',
        date: res.data.date || new Date().toISOString(),
        month: selectedMonth,
        year: selectedYear,
      };
      const updatedList = [newExp, ...expenses];
      setExpenses(updatedList);
      setSummary(computeClientSummary(income, updatedList));
      loadData(true);
      return {
        success: true,
        message: 'Expense added successfully',
        overspentWarning: willOverspend,
      };
    }
    return { success: false, message: res.message || 'Failed to add expense' };
  };

  const updateExpense = async (
    id: string,
    data: {
      name?: string;
      amount?: number | string;
      category?: string;
      date?: string;
    }
  ) => {
    const res = await api.expenses.update(id, data);
    if (res.success && res.data) {
      const updatedList = expenses.map((item) =>
        item.id === id
          ? {
              ...item,
              name: data.name ?? item.name,
              amount: data.amount !== undefined ? String(data.amount) : item.amount,
              category: data.category ?? item.category,
              date: data.date ?? item.date,
            }
          : item
      );
      setExpenses(updatedList);
      setSummary(computeClientSummary(income, updatedList));
      loadData(true);
      return { success: true, message: 'Expense updated successfully' };
    }
    return { success: false, message: res.message || 'Failed to update expense' };
  };

  const deleteExpense = async (id: string) => {
    const res = await api.expenses.delete(id);
    if (res.success) {
      const updatedList = expenses.filter((e) => e.id !== id);
      setExpenses(updatedList);
      setSummary(computeClientSummary(income, updatedList));
      loadData(true);
      return { success: true, message: 'Expense deleted successfully' };
    }
    return { success: false, message: res.message || 'Failed to delete expense' };
  };

  return (
    <BudgetContext.Provider
      value={{
        selectedMonth,
        selectedYear,
        setSelectedMonth,
        setSelectedYear,
        setMonthAndYear,
        income,
        expenses,
        summary,
        isLoading,
        isRefreshing,
        error,
        refreshData: () => loadData(true),
        setMonthlyIncome,
        addExpense,
        updateExpense,
        deleteExpense,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => useContext(BudgetContext);
