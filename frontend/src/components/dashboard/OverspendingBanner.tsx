'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { formatPKR } from '@/lib/formatters';

interface OverspendingBannerProps {
  isOverspent: boolean;
  overspentAmount?: string;
  isBudgetWarning80?: boolean;
  budgetPercentage?: string;
}

export const OverspendingBanner: React.FC<OverspendingBannerProps> = ({
  isOverspent,
  overspentAmount = '0.00',
  isBudgetWarning80 = false,
  budgetPercentage = '0.00',
}) => {
  if (!isOverspent && !isBudgetWarning80) {
    return null;
  }

  const isDanger = isOverspent;

  return (
    <div
      className={`p-5 sm:p-6 rounded-3xl border backdrop-blur-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xl ${
        isDanger
          ? 'bg-rose-950/40 border-rose-500/40 text-rose-100 shadow-rose-950/50'
          : 'bg-amber-950/40 border-amber-500/40 text-amber-100 shadow-amber-950/50'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
            isDanger
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
          }`}
        >
          {isDanger ? <ShieldAlert size={22} className="animate-pulse" /> : <AlertTriangle size={22} />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-extrabold tracking-tight">
              {isDanger ? 'Overdraft Warning Triggered' : 'Budget Threshold Alert (80%+ Consumed)'}
            </h4>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                isDanger
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}
            >
              Action Recommended
            </span>
          </div>
          <p className="text-xs mt-1 text-slate-300 leading-relaxed max-w-xl">
            {isDanger
              ? `Your cumulative expenses have surpassed total income by an exact deficit of ${formatPKR(
                  overspentAmount
                )}. All transactions remain safely recorded in PostgreSQL.`
              : `You have utilized ${budgetPercentage}% of your total allocated budget. Watch subsequent discretionary expenses to maintain a positive runway.`}
          </p>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2 sm:self-center">
        <Link
          href="/expenses"
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
            isDanger
              ? 'bg-rose-500 text-white border-rose-400 hover:bg-rose-400 shadow-lg shadow-rose-500/30'
              : 'bg-amber-500 text-slate-900 border-amber-400 hover:bg-amber-400 shadow-lg shadow-amber-500/30'
          }`}
        >
          <span>Manage Expenses</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
