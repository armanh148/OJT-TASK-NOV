'use client';

import React from 'react';
import { PieChart, TrendingUp, Layers } from 'lucide-react';
import { CategoryBreakdown } from '@/types';
import { getCategoryMeta } from '@/lib/formatters';

interface CategoryChartProps {
  categories: CategoryBreakdown[];
  totalExpenseFormatted: string;
}

export const CategoryDistributionChart: React.FC<CategoryChartProps> = ({
  categories,
  totalExpenseFormatted,
}) => {
  if (!categories || categories.length === 0) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl border border-white/[0.08] bg-slate-900/70 backdrop-blur-2xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center mb-3">
          <PieChart size={24} />
        </div>
        <h4 className="text-sm font-bold text-white mb-1">No Expense Distribution Yet</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Add an expense record to view your real-time category distribution and cashflow breakdown.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-2xl shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
            <PieChart size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Expense Distribution Breakdown
            </h3>
            <p className="text-xs text-slate-400">Visual allocation across spending channels</p>
          </div>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-white/[0.08] text-xs font-bold text-white flex items-center gap-2">
          <span className="text-slate-400 font-normal">Active Outflow:</span>
          <span className="text-rose-400 tabular-numbers">{totalExpenseFormatted}</span>
        </div>
      </div>

      {/* Segmented Distribution Bar with Glow */}
      <div className="flex h-3.5 w-full rounded-full overflow-hidden bg-slate-800 border border-white/[0.04] p-0.5 mb-6">
        {categories.map((cat, idx) => {
          const meta = getCategoryMeta(cat.category);
          const width = Math.max(parseFloat(cat.percentage) || 0, 2);
          return (
            <div
              key={idx}
              title={`${meta.label}: ${cat.percentage}%`}
              style={{ width: `${width}%`, backgroundColor: meta.color }}
              className="h-full rounded-full transition-all duration-300 hover:brightness-125"
            />
          );
        })}
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat, idx) => {
          const meta = getCategoryMeta(cat.category);
          return (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-2xl border border-white/[0.06] bg-slate-800/40 hover:bg-slate-800/70 hover:border-white/[0.12] transition-all group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span
                  className="w-3.5 h-3.5 rounded-lg shrink-0 shadow-sm"
                  style={{ backgroundColor: meta.color }}
                />
                <div className="truncate">
                  <span className="text-xs font-bold text-white block truncate">
                    {meta.label}
                  </span>
                  <span className="text-[10px] text-slate-400 tabular-numbers">
                    {cat.percentage}% of outflow
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-slate-200 block tabular-numbers">
                  {cat.formattedAmount}
                </span>
                <span className="text-[10px] font-semibold text-cyan-400 tabular-numbers">
                  {cat.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
