'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Edit2, Trash2, Receipt, Clock } from 'lucide-react';
import { ExpenseItem } from '@/types';
import { formatPKR, formatDate, getCategoryMeta } from '@/lib/formatters';

interface RecentExpensesProps {
  expenses: ExpenseItem[];
  onEdit: (exp: ExpenseItem) => void;
  onDelete: (exp: ExpenseItem) => void;
}

export const RecentExpensesTable: React.FC<RecentExpensesProps> = ({
  expenses,
  onEdit,
  onDelete,
}) => {
  const recent = expenses.slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl border border-white/[0.08] bg-slate-900/70 backdrop-blur-2xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-white/[0.08] text-slate-400 mx-auto flex items-center justify-center mb-3">
          <Receipt size={24} />
        </div>
        <h4 className="text-sm font-bold text-white mb-1">No Transactions Recorded</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          You haven't logged any expense records for this month. Use the button above to add your first transaction.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-white/[0.08] backdrop-blur-2xl shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Recent Ledger Entries</h3>
            <p className="text-xs text-slate-400">Latest transactions registered in PostgreSQL</p>
          </div>
        </div>

        <Link
          href="/expenses"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-slate-800/60 text-xs font-bold text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 transition-all group"
        >
          <span>View All ({expenses.length})</span>
          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] text-slate-400 uppercase tracking-wider text-[10px]">
              <th className="pb-3.5 font-bold">Transaction</th>
              <th className="pb-3.5 font-bold">Category</th>
              <th className="pb-3.5 font-bold">Date</th>
              <th className="pb-3.5 font-bold text-right">Amount</th>
              <th className="pb-3.5 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {recent.map((exp) => {
              const meta = getCategoryMeta(exp.category);
              return (
                <tr key={exp.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="py-4 font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {exp.name}
                  </td>
                  <td className="py-4">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                      style={{
                        backgroundColor: `${meta.color}15`,
                        borderColor: `${meta.color}40`,
                        color: meta.color,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }} />
                      {meta.label}
                    </span>
                  </td>
                  <td className="py-4 text-slate-400 tabular-numbers font-medium">
                    {formatDate(exp.date)}
                  </td>
                  <td className="py-4 font-black text-rose-400 text-right tabular-numbers text-sm">
                    {formatPKR(exp.amount)}
                  </td>
                  <td className="py-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => onEdit(exp)}
                        className="p-1.5 rounded-lg border border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                        title="Edit expense"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => onDelete(exp)}
                        className="p-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
