'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Wallet, AlertTriangle, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

interface FinancialCardProps {
  type: 'income' | 'expense' | 'balance';
  title: string;
  amount: string;
  isOverspent?: boolean;
  subtitle?: string;
}

export const FinancialCard: React.FC<FinancialCardProps> = ({
  type,
  title,
  amount,
  isOverspent = false,
  subtitle,
}) => {
  const isBalance = type === 'balance';
  const isIncome = type === 'income';

  const getCardTheme = () => {
    if (isBalance && isOverspent) {
      return {
        border: 'border-rose-500/60 shadow-lg shadow-rose-950/40',
        glowTop: 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-600',
        iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
        textGradient: 'text-rose-400 glow-text-danger',
        badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
        icon: <AlertTriangle size={20} className="animate-bounce" />,
        badgeText: 'Deficit Alert',
      };
    }
    if (isBalance) {
      return {
        border: 'border-indigo-500/30 shadow-lg shadow-indigo-950/30',
        glowTop: 'bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-600',
        iconBg: 'bg-indigo-500/20 text-cyan-300 border border-indigo-500/30',
        textGradient: 'text-cyan-300 glow-text-cyan',
        badgeBg: 'bg-indigo-500/15 text-cyan-300 border-indigo-500/30',
        icon: <Wallet size={20} />,
        badgeText: 'Net Surplus',
      };
    }
    if (isIncome) {
      return {
        border: 'border-emerald-500/30 shadow-lg shadow-emerald-950/30',
        glowTop: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600',
        iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
        textGradient: 'text-emerald-400 glow-text-emerald',
        badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        icon: <ArrowUpRight size={20} />,
        badgeText: 'Allocated',
      };
    }
    // Expense
    return {
      border: 'border-rose-500/25 shadow-lg shadow-rose-950/20',
      glowTop: 'bg-gradient-to-r from-rose-500 via-amber-400 to-rose-600',
      iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
      textGradient: 'text-rose-400',
      badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      icon: <ArrowDownRight size={20} />,
      badgeText: 'Spent Outflow',
    };
  };

  const theme = getCardTheme();

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={clsx(
        'relative overflow-hidden rounded-3xl p-6 sm:p-7 backdrop-blur-2xl transition-all',
        'bg-slate-900/80 dark:bg-slate-900/80 border',
        theme.border
      )}
    >
      {/* Top Ambient Glow Edge */}
      <div className={clsx('absolute top-0 left-0 right-0 h-[2px]', theme.glowTop)} />

      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className="flex items-center gap-2">
          <span className={clsx('px-2.5 py-0.5 rounded-full text-[10px] font-bold border', theme.badgeBg)}>
            {theme.badgeText}
          </span>
          <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', theme.iconBg)}>
            {theme.icon}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h2 className={clsx('text-2xl sm:text-3xl font-black tracking-tight tabular-numbers', theme.textGradient)}>
          {amount}
        </h2>
        {subtitle && (
          <p className="mt-2 text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
};
