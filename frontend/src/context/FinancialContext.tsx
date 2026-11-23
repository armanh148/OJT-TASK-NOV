'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { useAuth } from './AuthContext';
import { ExpenseItem, MonthlySummary, AnalyticsData } from '@/types';

interface FinancialContextType {
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (m: number) => void;
  setSelectedYear: (y: number) => void;
  nextMonth: () => void;
  previousMonth: () => void;
  summary: MonthlySummary | null;
  analytics: AnalyticsData | null;
  expenses: ExpenseItem[];
  incomeAmount: string;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  setMonthlyIncome: (amount: string | number) => Promise<{ success: boolean; message?: string }>;
  addExpense: (data: { name: string; amount: string | number; category?: string; date?: string }) => Promise<{ success: boolean; message?: string }>;
  editExpense: (id: string, data: { name?: string; amount?: string | number; category?: string; date?: string }) => Promise<{ success: boolean; message?: string }>;
  deleteExpense: (id: string) => Promise<{ success: boolean; message?: string }>;
  exportCSV: () => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | null>(null);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [incomeAmount, setIncomeAmount] = useState<string>('0.00');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (isBackground = false) => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      if (isBackground) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      try {
        const [incRes, expRes, sumRes] = await Promise.all([
          apiClient.get(`/income?month=${selectedMonth}&year=${selectedYear}`),
          apiClient.get(`/expenses?month=${selectedMonth}&year=${selectedYear}`),
          apiClient.get(`/summary?month=${selectedMonth}&year=${selectedYear}`),
        ]);

        setIncomeAmount(incRes.data.data.income.amount);
        setExpenses(expRes.data.data.expenses);
        setSummary(expRes.data.data.summary);
        setAnalytics(sumRes.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load financial data.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isAuthenticated, selectedMonth, selectedYear]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const nextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const previousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const setMonthlyIncome = async (amount: string | number) => {
    try {
      const res = await apiClient.post('/income', {
        month: selectedMonth,
        year: selectedYear,
        amount,
      });
      const { income, summary: updatedSummary } = res.data.data;
      setIncomeAmount(income.amount);
      setSummary(updatedSummary);
      await fetchData(true);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update income.',
      };
    }
  };

  const addExpense = async (data: { name: string; amount: string | number; category?: string; date?: string }) => {
    try {
      const res = await apiClient.post('/expenses', {
        ...data,
        month: selectedMonth,
        year: selectedYear,
      });
      const { summary: updatedSummary } = res.data.data;
      setSummary(updatedSummary);
      await fetchData(true);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to record expense.',
      };
    }
  };

  const editExpense = async (
    id: string,
    data: { name?: string; amount?: string | number; category?: string; date?: string }
  ) => {
    try {
      const res = await apiClient.put(`/expenses/${id}`, data);
      const { summary: updatedSummary } = res.data.data;
      setSummary(updatedSummary);
      await fetchData(true);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to update expense.',
      };
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const res = await apiClient.delete(`/expenses/${id}`);
      const { summary: updatedSummary } = res.data.data;
      setSummary(updatedSummary);
      await fetchData(true);
      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to delete expense.',
      };
    }
  };

  const exportCSV = async () => {
    try {
      const response = await apiClient.get(
        `/expenses/export?month=${selectedMonth}&year=${selectedYear}`,
        { responseType: 'blob' }
      );
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `monthly_budget_${selectedYear}_${selectedMonth}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    }
  };

  return (
    <FinancialContext.Provider
      value={{
        selectedMonth,
        selectedYear,
        setSelectedMonth,
        setSelectedYear,
        nextMonth,
        previousMonth,
        summary,
        analytics,
        expenses,
        incomeAmount,
        isLoading,
        isRefreshing,
        error,
        refreshData: () => fetchData(true),
        setMonthlyIncome,
        addExpense,
        editExpense,
        deleteExpense,
        exportCSV,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within FinancialProvider');
  }
  return context;
};
