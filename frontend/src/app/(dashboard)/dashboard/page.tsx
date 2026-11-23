'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Download,
  ArrowRight,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Receipt,
  Edit2,
  Trash2,
  Wallet,
  Gauge,
  Flame,
  Clock,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AddExpenseModal } from '@/components/expenses/AddExpenseModal';
import { EditExpenseModal } from '@/components/expenses/EditExpenseModal';
import { DeleteConfirmModal } from '@/components/expenses/DeleteConfirmModal';
import { useAuth } from '@/context/AuthContext';
import { useFinancial } from '@/context/FinancialContext';
import { formatPKR, formatDate, getCategoryMeta, getMonthName } from '@/lib/formatters';
import { ExpenseItem } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    selectedMonth,
    selectedYear,
    summary,
    analytics,
    expenses,
    incomeAmount,
    setMonthlyIncome,
    exportCSV,
  } = useFinancial();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<ExpenseItem | null>(null);

  const isOverspent = summary?.isOverspent ?? false;
  const totalIncomeFormatted = summary?.formattedTotalIncome || formatPKR(incomeAmount);
  const totalExpenseFormatted = summary?.formattedTotalExpense || 'Rs. 0.00';
  const remainingBalanceFormatted = summary?.formattedRemainingBalance || totalIncomeFormatted;

  // Real-time Daily Safe-to-Spend & Pace calculations (Production Financial Intelligence)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const isCurrentMonth = selectedYear === currentYear && selectedMonth === currentMonth;

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const currentDay = isCurrentMonth
    ? now.getDate()
    : selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth)
    ? daysInMonth
    : 1;

  const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);
  const remainingBalNum = parseFloat(summary?.remainingBalance || (incomeAmount ? incomeAmount : '0'));
  const dailyAllowance = remainingBalNum > 0 ? remainingBalNum / daysRemaining : 0;
  const monthProgressPercent = Math.min(100, Math.round((currentDay / daysInMonth) * 100));
  const budgetSpentPercent = Math.min(100, parseFloat(summary?.budgetSpentPercentage || '0'));

  // Burn Rate status
  const isPacingOptimal = budgetSpentPercent <= monthProgressPercent;
  const paceDelta = Math.abs(monthProgressPercent - budgetSpentPercent);

  const categories = summary?.categoryBreakdown || [];
  const recentExpenses = expenses.slice(0, 5);

  return (
    <DashboardShell>
      <div className="space-y-6 sm:space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Welcome Back, {user?.name?.split(' ')[0] || 'Syed'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-1 font-medium">
              Everything you need to manage, analyze, and grow your monthly finances in one place.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#0F2942] hover:bg-[#0A1D2F] transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
            >
              <Plus size={16} />
              <span>Record Expense</span>
            </button>
            <button
              onClick={() => exportCSV()}
              className="px-4 py-2.5 rounded-full text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] hover:bg-[#F1F5F9] dark:hover:bg-[#2D3E5B] transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Download size={14} />
              <span>Report</span>
            </button>
          </div>
        </div>

        {/* Overspending Banner Alert */}
        {isOverspent && (
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold">Budget Overdraft Activated</h4>
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  Total expenses exceed monthly income by an exact deficit of{' '}
                  <strong className="font-extrabold">{formatPKR(summary?.overspentAmount || '0')}</strong>.
                </p>
              </div>
            </div>
            <Link
              href="/expenses"
              className="px-4 py-2 rounded-full text-xs font-bold bg-[#DC2626] hover:bg-[#B91C1C] text-white shrink-0 text-center transition-colors shadow-sm"
            >
              Audit Expenses
            </Link>
          </div>
        )}

        {/* Main Dashboard Grid (Left 7 cols / Right 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Hero Balance Card + 4 KPIs + Financial Health Hub */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Row: Hero Total Balance Card (1 col) + 4 Metrics (2x2 Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              {/* Solid Balance Card */}
              <div
                className={`md:col-span-6 p-6 sm:p-7 rounded-[24px] text-white flex flex-col justify-between shadow-finova-hero relative overflow-hidden min-h-[220px] ${
                  isOverspent ? 'finova-liquid-wave-danger' : 'finova-liquid-wave'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#94A3B8] tracking-wide">
                      Total Balance
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isOverspent ? 'bg-rose-500/30 text-rose-300' : 'bg-white/15 text-sky-200'
                      }`}
                    >
                      {isOverspent ? 'Deficit' : 'Available'}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-3 tabular-numbers">
                    {remainingBalanceFormatted}
                  </h2>
                </div>

                <div className="flex items-center gap-2.5 pt-6 z-10">
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex-1 py-2.5 px-4 rounded-full text-xs font-bold text-[#0F172A] bg-white hover:bg-slate-100 transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                  >
                    <span>Record</span>
                    <ArrowDownRight size={14} />
                  </button>

                  <Link
                    href="/income"
                    className="flex-1 py-2.5 px-4 rounded-full text-xs font-bold text-white bg-white/15 border border-white/20 hover:bg-white/25 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <span>Deposit</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>

              {/* 4 Metric KPI Cards (2x2 Grid) */}
              <div className="md:col-span-6 grid grid-cols-2 gap-3.5">
                {/* Income */}
                <div className="p-4 rounded-[18px] bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-[#28364D] flex flex-col justify-between transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#475569] dark:text-[#94A3B8]">Income</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="my-2">
                    <span className="text-sm sm:text-base font-black text-[#0F172A] dark:text-[#F8FAFC] tabular-numbers block truncate">
                      {totalIncomeFormatted}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md inline-block self-start border border-emerald-200 dark:border-emerald-900">
                    Allocated
                  </span>
                </div>

                {/* Expense */}
                <div className="p-4 rounded-[18px] bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-[#28364D] flex flex-col justify-between transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#475569] dark:text-[#94A3B8]">Expense</span>
                    <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                  </div>
                  <div className="my-2">
                    <span className="text-sm sm:text-base font-black text-[#0F172A] dark:text-[#F8FAFC] tabular-numbers block truncate">
                      {totalExpenseFormatted}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#DC2626] dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md inline-block self-start border border-rose-200 dark:border-rose-900">
                    Outflow
                  </span>
                </div>

                {/* Savings Runway */}
                <div className="p-4 rounded-[18px] bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-[#28364D] flex flex-col justify-between transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#475569] dark:text-[#94A3B8]">Runway</span>
                    <span className="w-2 h-2 rounded-full bg-[#0F2942] dark:bg-[#38BDF8]" />
                  </div>
                  <div className="my-2">
                    <span className="text-sm sm:text-base font-black text-[#0F172A] dark:text-[#F8FAFC] tabular-numbers block truncate">
                      {remainingBalanceFormatted}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#0F2942] dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 px-2 py-0.5 rounded-md inline-block self-start border border-sky-200 dark:border-sky-900">
                    Surplus
                  </span>
                </div>

                {/* Budget Used */}
                <div className="p-4 rounded-[18px] bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-[#28364D] flex flex-col justify-between transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#475569] dark:text-[#94A3B8]">Velocity</span>
                    <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                  </div>
                  <div className="my-2">
                    <span className="text-sm sm:text-base font-black text-[#0F172A] dark:text-[#F8FAFC] tabular-numbers block truncate">
                      {summary?.budgetSpentPercentage || '0.00'}%
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-[#DC2626] dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md inline-block self-start border border-rose-200 dark:border-rose-900">
                    Consumed
                  </span>
                </div>
              </div>
            </div>

            {/* REAL FINANCIAL INTELLIGENCE & CASH FLOW HEALTH HUB */}
            <div className="p-5 sm:p-7 rounded-[24px] bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-[#28364D] space-y-5 transition-colors">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0F2942] text-white flex items-center justify-center shadow-sm">
                    <Gauge size={20} className="text-sky-200" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      Cash Flow Health & Safe Runway
                    </h3>
                    <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                      Authoritative budget pacing for {getMonthName(selectedMonth)} {selectedYear}
                    </p>
                  </div>
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold border hidden sm:flex items-center gap-1.5 ${
                    isOverspent
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
                      : isPacingOptimal
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOverspent
                        ? 'bg-rose-500 animate-pulse'
                        : isPacingOptimal
                        ? 'bg-emerald-500'
                        : 'bg-amber-500'
                    }`}
                  />
                  <span>
                    {isOverspent
                      ? 'Overdraft Alert'
                      : isPacingOptimal
                      ? 'Healthy Pace'
                      : 'Elevated Burn Rate'}
                  </span>
                </div>
              </div>

              {/* Daily Safe-to-Spend Allowance Metric */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] transition-colors">
                  <div className="flex items-center justify-between text-[#475569] dark:text-[#94A3B8] text-xs font-semibold mb-1">
                    <span>Safe-to-Spend / Day</span>
                    <Clock size={14} className="text-[#0F2942] dark:text-[#38BDF8]" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-[#F8FAFC] tabular-numbers">
                    {isOverspent ? 'Rs. 0.00' : formatPKR(dailyAllowance.toFixed(2))}
                  </div>
                  <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-1">
                    Based on <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{daysRemaining} days</strong> remaining in this cycle
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] transition-colors">
                  <div className="flex items-center justify-between text-[#475569] dark:text-[#94A3B8] text-xs font-semibold mb-1">
                    <span>Spending Burn Rate</span>
                    <Flame
                      size={14}
                      className={budgetSpentPercent > 80 ? 'text-[#DC2626] dark:text-rose-400' : 'text-amber-500'}
                    />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#0F172A] dark:text-[#F8FAFC] tabular-numbers">
                    {budgetSpentPercent.toFixed(1)}%
                  </div>
                  <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-1">
                    {monthProgressPercent}% of month elapsed ({isPacingOptimal ? `${paceDelta.toFixed(1)}% ahead` : `${paceDelta.toFixed(1)}% above curve`})
                  </p>
                </div>
              </div>

              {/* Visual Dual Progress Trackers */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] space-y-3 transition-colors">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#DC2626]" />
                      Budget Consumed
                    </span>
                    <span className="tabular-numbers">{budgetSpentPercent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#F1F5F9] dark:bg-[#0F172A] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        budgetSpentPercent > 90
                          ? 'bg-rose-600'
                          : budgetSpentPercent > 75
                          ? 'bg-amber-600'
                          : 'bg-[#0F2942]'
                      }`}
                      style={{ width: `${Math.min(budgetSpentPercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[#475569] dark:text-[#94A3B8] mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#0F2942] dark:bg-[#38BDF8]" />
                      Month Elapsed (Calendar)
                    </span>
                    <span className="tabular-numbers">
                      Day {currentDay} of {daysInMonth} ({monthProgressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#F1F5F9] dark:bg-[#0F172A] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0F2942] dark:bg-[#38BDF8] transition-all duration-700"
                      style={{ width: `${monthProgressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Native App Fast Utility Actions */}
              <div>
                <span className="text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider block mb-2">
                  Quick Financial Actions
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] hover:bg-[#F1F5F9] dark:hover:bg-[#2D3E5B] transition-all flex flex-col items-center justify-center text-center gap-1 active:scale-95 shadow-xs"
                  >
                    <Plus size={16} className="text-[#DC2626] dark:text-[#EF4444]" />
                    <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Add Expense</span>
                  </button>

                  <Link
                    href="/income"
                    className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] hover:bg-[#F1F5F9] dark:hover:bg-[#2D3E5B] transition-all flex flex-col items-center justify-center text-center gap-1 active:scale-95 shadow-xs"
                  >
                    <Wallet size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Set Budget</span>
                  </Link>

                  <button
                    onClick={() => exportCSV()}
                    className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] hover:bg-[#F1F5F9] dark:hover:bg-[#2D3E5B] transition-all flex flex-col items-center justify-center text-center gap-1 active:scale-95 shadow-xs"
                  >
                    <Download size={16} className="text-[#0F2942] dark:text-[#38BDF8]" />
                    <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Export CSV</span>
                  </button>

                  <Link
                    href="/analytics"
                    className="p-3 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] hover:bg-[#F1F5F9] dark:hover:bg-[#2D3E5B] transition-all flex flex-col items-center justify-center text-center gap-1 active:scale-95 shadow-xs"
                  >
                    <Activity size={16} className="text-[#DC2626] dark:text-rose-400" />
                    <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Analytics</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Quick Allocation Widget + Monthly Spendings (Donut Chart) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Widget A: "Monthly Allocation" (Exchange/Allocation Card) */}
            <div className="p-6 rounded-[24px] bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-[#28364D] space-y-4 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">Monthly Allocation</h3>
                  <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">Pakistani Rupee (PKR - Rs.)</p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5 shadow-sm">
                  <span>🇵🇰 PKR</span>
                </div>
              </div>

              {/* Amount Display */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] flex items-center justify-between transition-colors">
                <div>
                  <span className="text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider block">
                    Starting Income
                  </span>
                  <span className="text-xl font-black text-[#0F172A] dark:text-[#F8FAFC] tabular-numbers">
                    {totalIncomeFormatted}
                  </span>
                </div>
                <Link
                  href="/income"
                  className="px-3 py-1.5 rounded-lg bg-[#F1F5F9] dark:bg-[#28364D] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-xs font-bold text-[#0F2942] dark:text-[#38BDF8] transition-colors"
                >
                  Adjust
                </Link>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2">
                {[50000, 100000, 150000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={async () => {
                      await setMonthlyIncome(preset.toString());
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#28364D] transition-all tabular-numbers shadow-sm active:scale-95"
                  >
                    Set {formatPKR(preset.toString())}
                  </button>
                ))}
              </div>

              <Link href="/income" className="block pt-1">
                <button className="w-full h-11 rounded-xl text-xs font-bold text-white bg-[#0F2942] hover:bg-[#0A1D2F] transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-98">
                  <span>Open Income Allocation</span>
                  <ArrowRight size={14} />
                </button>
              </Link>
            </div>

            {/* Widget B: "Monthly Spendings" (Donut Chart & Category Breakdown) */}
            <div className="p-6 rounded-[24px] bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-[#28364D] space-y-5 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">Monthly Spendings</h3>
                  <p className="text-[11px] text-[#475569] dark:text-[#94A3B8]">
                    {getMonthName(selectedMonth)} {selectedYear}
                  </p>
                </div>
                <div className="px-2.5 py-1 rounded-full bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] shadow-sm">
                  {categories.length} Categories
                </div>
              </div>

              {/* Minimal Finova Donut Chart */}
              <div className="flex flex-col items-center justify-center pt-2">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-[#E2E8F0] dark:text-[#28364D] stroke-current"
                      strokeWidth="14"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      className="text-[#DC2626] dark:text-[#EF4444] stroke-current transition-all duration-700"
                      strokeWidth="14"
                      strokeDasharray="251.2"
                      strokeDashoffset={
                        251.2 - (251.2 * Math.min(parseFloat(summary?.budgetSpentPercentage || '0'), 100)) / 100
                      }
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center text-center">
                    <span className="text-base font-black text-[#0F172A] dark:text-[#F8FAFC] tabular-numbers leading-tight">
                      {totalExpenseFormatted}
                    </span>
                    <span className="text-[10px] font-semibold text-[#475569] dark:text-[#94A3B8]">Total Expenses</span>
                  </div>
                </div>
              </div>

              {/* Category Breakdown Rows */}
              <div className="space-y-2 pt-2 border-t border-[#E2E8F0] dark:border-[#28364D]">
                {categories.slice(0, 4).map((cat, i) => {
                  const meta = getCategoryMeta(cat.category);
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between py-1 text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: meta.color }}
                        />
                        <span className="font-semibold">{meta.label}</span>
                      </div>
                      <span className="font-bold tabular-numbers">{cat.formattedAmount}</span>
                    </div>
                  );
                })}

                {categories.length === 0 && (
                  <p className="text-xs text-[#475569] dark:text-[#94A3B8] text-center py-2">
                    No expense records for this month yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RECENT TRANSACTIONS LEDGER */}
        <div className="p-5 sm:p-7 rounded-[24px] bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-[#28364D] space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">Recent Ledger Entries</h3>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                All transactions registered in Neon PostgreSQL
              </p>
            </div>
            <Link
              href="/expenses"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#DC2626] dark:text-[#EF4444] hover:underline"
            >
              <span>View All ({expenses.length})</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentExpenses.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E2E8F0] dark:border-[#28364D]">
              <Receipt size={32} className="text-[#94A3B8] mx-auto mb-2" />
              <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">No expenses recorded for this month</p>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-0.5">
                Use the "Record Expense" button above to log your first transaction.
              </p>
            </div>
          ) : (
            <>
              {/* Mobile Card List (shown on small phone screens) */}
              <div className="sm:hidden space-y-2.5">
                {recentExpenses.map((exp) => {
                  const meta = getCategoryMeta(exp.category);
                  return (
                    <div
                      key={exp.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] flex items-center justify-between shadow-xs transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold"
                          style={{
                            backgroundColor: `${meta.color}15`,
                            color: meta.color,
                          }}
                        >
                          <Receipt size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">{exp.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                              style={{
                                backgroundColor: `${meta.color}15`,
                                color: meta.color,
                              }}
                            >
                              {meta.label}
                            </span>
                            <span className="text-[10px] text-[#475569] dark:text-[#94A3B8]">
                              {formatDate(exp.date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-black text-[#DC2626] dark:text-[#EF4444] tabular-numbers">
                          {formatPKR(exp.amount)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingExpense(exp)}
                            className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#28364D] text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] active:scale-90 transition-transform"
                            aria-label="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => setDeletingExpense(exp)}
                            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-500 hover:text-rose-700 active:scale-90 transition-transform"
                            aria-label="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop / Tablet Table (shown on sm+) */}
              <div className="hidden sm:block overflow-x-auto bg-white dark:bg-[#1E293B] rounded-2xl border border-[#E2E8F0] dark:border-[#28364D]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] dark:border-[#28364D] text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider text-[10px] bg-[#F8FAFC] dark:bg-[#152238]">
                      <th className="py-3.5 px-5 font-bold">Transaction</th>
                      <th className="py-3.5 px-5 font-bold">Category</th>
                      <th className="py-3.5 px-5 font-bold">Date</th>
                      <th className="py-3.5 px-5 font-bold text-right">Amount</th>
                      <th className="py-3.5 px-5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#28364D]">
                    {recentExpenses.map((exp) => {
                      const meta = getCategoryMeta(exp.category);
                      return (
                        <tr key={exp.id} className="hover:bg-[#F1F5F9] dark:hover:bg-[#28364D] transition-colors">
                          <td className="py-3.5 px-5 font-bold text-[#0F172A] dark:text-[#F8FAFC]">{exp.name}</td>
                          <td className="py-3.5 px-5">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                              style={{
                                backgroundColor: `${meta.color}15`,
                                borderColor: `${meta.color}30`,
                                color: meta.color,
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: meta.color }}
                              />
                              {meta.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-[#475569] dark:text-[#94A3B8] tabular-numbers font-medium">
                            {formatDate(exp.date)}
                          </td>
                          <td className="py-3.5 px-5 font-bold text-[#DC2626] dark:text-[#EF4444] text-right tabular-numbers text-sm">
                            {formatPKR(exp.amount)}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => setEditingExpense(exp)}
                                className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#28364D] text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-white dark:hover:bg-[#152238] transition-colors"
                                title="Edit expense"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => setDeletingExpense(exp)}
                                className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                                title="Delete expense"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddExpenseModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {editingExpense && (
        <EditExpenseModal
          isOpen={true}
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}

      {deletingExpense && (
        <DeleteConfirmModal
          isOpen={true}
          expense={deletingExpense}
          onClose={() => setDeletingExpense(null)}
        />
      )}
    </DashboardShell>
  );
}
