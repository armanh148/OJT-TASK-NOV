'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface BudgetProgressProps {
  spentPercentage: string;
  isOverspent: boolean;
}

export const BudgetProgressBar: React.FC<BudgetProgressProps> = ({
  spentPercentage,
  isOverspent,
}) => {
  const percentNum = parseFloat(spentPercentage) || 0;
  const isWarning = percentNum >= 80 && percentNum <= 100;

  const getBarGradient = () => {
    if (isOverspent) return 'bg-gradient-to-r from-rose-600 via-red-500 to-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.5)]';
    if (isWarning) return 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)]';
    return 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]';
  };

  const getStatusBadge = () => {
    if (isOverspent) {
      return {
        label: 'Budget Overdraft',
        icon: <AlertTriangle size={12} />,
        classes: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      };
    }
    if (isWarning) {
      return {
        label: 'Threshold Warning (80%+)',
        icon: <AlertTriangle size={12} />,
        classes: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      };
    }
    return {
      label: 'Optimal Runway',
      icon: <CheckCircle2 size={12} />,
      classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    };
  };

  const status = getStatusBadge();

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-2xl shadow-xl relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
            <Activity size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Monthly Budget Velocity
            </h3>
            <span className="text-[11px] text-slate-400">Consumption of allocated funds</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={clsx('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border', status.classes)}>
            {status.icon}
            {status.label}
          </span>
          <span className={clsx('text-xl font-black tabular-numbers', isOverspent ? 'text-rose-400' : 'text-white')}>
            {spentPercentage}%
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative pt-2">
        <div className="w-full h-3 rounded-full bg-slate-800/80 border border-white/[0.04] overflow-hidden p-0.5">
          <div
            className={clsx('h-full rounded-full transition-all duration-700 ease-out', getBarGradient())}
            style={{ width: `${Math.min(percentNum, 100)}%` }}
          />
        </div>

        {/* Milestone Marks */}
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mt-2 px-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span className={isOverspent ? 'text-rose-400 font-bold' : ''}>100%</span>
        </div>
      </div>
    </div>
  );
};
