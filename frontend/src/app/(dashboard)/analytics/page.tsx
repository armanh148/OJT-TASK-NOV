'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useFinancial } from '@/context/FinancialContext';
import { formatPKR, getMonthName, getCategoryMeta } from '@/lib/formatters';

export default function AnalyticsPage() {
  const { selectedMonth, selectedYear, summary, analytics, exportCSV } = useFinancial();

  const prevComp = analytics?.previousMonthComparison;
  const changeNum = parseFloat(prevComp?.expenseChangePercentage || '0');
  const isSpendingIncreased = changeNum > 0;
  const isSpendingDecreased = changeNum < 0;

  const categories = summary?.categoryBreakdown || [];

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Financial Analytics & Insights
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-1 font-medium">
              Month-over-month variances and distribution of capital outflow.
            </p>
          </div>

          <button
            onClick={() => exportCSV()}
            className="px-4 py-2.5 rounded-full text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] hover:bg-[#F1F5F9] dark:hover:bg-[#2D3E5B] transition-all flex items-center gap-1.5 shadow-sm active:scale-95 self-start sm:self-auto"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Month-over-Month Comparison Card */}
        {prevComp?.hasPreviousData && (
          <div className="p-6 sm:p-7 rounded-[24px] bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-[#28364D] space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Month-over-Month Variance Analysis
                </h3>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                  Compared against {getMonthName(prevComp.previousMonth)} {prevComp.previousYear}
                </p>
              </div>

              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  isSpendingIncreased
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
                    : isSpendingDecreased
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300'
                    : 'bg-[#F1F5F9] dark:bg-[#172338] border-[#E2E8F0] dark:border-[#28364D] text-[#475569] dark:text-[#94A3B8]'
                }`}
              >
                {isSpendingIncreased && <TrendingUp size={13} className="text-rose-600 dark:text-rose-400" />}
                {isSpendingDecreased && <TrendingDown size={13} className="text-emerald-600 dark:text-emerald-400" />}
                {!isSpendingIncreased && !isSpendingDecreased && <Minus size={13} />}
                <span className="tabular-numbers">
                  {prevComp.expenseChangePercentage}% Spending {isSpendingIncreased ? 'Increase' : 'Decrease'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8] block mb-1">
                  Prior Month Expenses
                </span>
                <span className="text-xl font-black text-[#0F172A] dark:text-[#F8FAFC] tabular-numbers">
                  {formatPKR(prevComp.previousExpense)}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8] block mb-1">
                  Active Month Expenses
                </span>
                <span className="text-xl font-black text-[#0F172A] dark:text-[#F8FAFC] tabular-numbers">
                  {summary?.formattedTotalExpense || 'Rs. 0.00'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Category Breakdown Table */}
        <div className="p-6 sm:p-7 rounded-[24px] bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-[#28364D] space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">Category Share</h3>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8]">
                Breakdown of spending by category for {getMonthName(selectedMonth)} {selectedYear}
              </p>
            </div>
            <div className="px-3 py-1 rounded-full bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Total: {summary?.formattedTotalExpense || 'Rs. 0.00'}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat, idx) => {
              const meta = getCategoryMeta(cat.category);
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] shadow-sm transition-colors"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">{meta.label}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-[#0F172A] dark:text-[#F8FAFC] tabular-numbers block">
                      {cat.formattedAmount}
                    </span>
                    <span className="text-[10px] font-bold text-[#475569] dark:text-[#94A3B8] tabular-numbers">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}

            {categories.length === 0 && (
              <p className="text-xs text-[#475569] dark:text-[#94A3B8] col-span-3 text-center py-6">
                No expense categories recorded for this month.
              </p>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
