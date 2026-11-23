'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Edit2 } from 'lucide-react';
import { useFinancial } from '@/context/FinancialContext';
import { CATEGORIES } from '@/lib/formatters';
import { ExpenseItem } from '@/types';

interface EditExpenseModalProps {
  isOpen: boolean;
  expense: ExpenseItem | null;
  onClose: () => void;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  expense,
  onClose,
}) => {
  const { editExpense } = useFinancial();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('FOOD');
  const [date, setDate] = useState('');
  const [errors, setErrors] = useState<{ name?: string; amount?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expense) {
      setName(expense.name);
      setAmount(expense.amount);
      setCategory(expense.category.toUpperCase());
      setDate(
        expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      );
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const validate = () => {
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = 'Expense name is required';
    if (!amount.trim()) {
      errs.amount = 'Amount is required';
    } else {
      const num = parseFloat(amount.trim());
      if (isNaN(num) || num <= 0) {
        errs.amount = 'Amount must be greater than zero';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    const res = await editExpense(expense.id, {
      name: name.trim(),
      amount: amount.trim(),
      category,
      date: new Date(date).toISOString(),
    });

    setIsSubmitting(false);

    if (res.success) {
      onClose();
    } else {
      setErrors({ general: res.message || 'Failed to update expense' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 sm:p-8 bg-white dark:bg-[#0F172A] rounded-t-[32px] sm:rounded-3xl border border-[#E2E8F0] dark:border-[#28364D] shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto transition-colors">
        {/* Mobile Swipe / Drag Handle Indicator */}
        <div className="w-12 h-1.5 bg-[#E2E8F0] dark:bg-[#28364D] rounded-full mx-auto mb-4 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-[#28364D] mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F2942] text-white flex items-center justify-center shadow-sm">
              <Edit2 size={18} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC]">Modify Expense</h3>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8]">Recalculate balance in PostgreSQL</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#172338] transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {errors.general && (
          <div className="p-3.5 mb-4 text-xs font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          {/* Description */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8] block mb-1.5">
              Description
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-[#94A3B8] pointer-events-none">
                <FileText size={18} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="w-full h-12 pl-11 pr-4 rounded-xl text-sm font-medium bg-[#F8FAFC] dark:bg-[#172338] border border-[#E2E8F0] dark:border-[#28364D] text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] outline-none focus:border-[#DC2626] dark:focus:border-[#EF4444] transition-all"
              />
            </div>
            {errors.name && (
              <span className="text-[11px] font-bold text-rose-500 mt-1 block">
                {errors.name}
              </span>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8] block mb-1.5">
              Amount (PKR)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 font-bold text-sm text-[#0F2942] dark:text-[#38BDF8] pointer-events-none">
                Rs.
              </span>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                enterKeyHint="done"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-xl text-sm font-bold bg-[#F8FAFC] dark:bg-[#172338] border border-[#E2E8F0] dark:border-[#28364D] text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] outline-none focus:border-[#DC2626] dark:focus:border-[#EF4444] transition-all tabular-numbers"
              />
            </div>
            {errors.amount && (
              <span className="text-[11px] font-bold text-rose-500 mt-1 block">
                {errors.amount}
              </span>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8] block mb-2">
              Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 active:scale-95 ${
                      isSelected
                        ? 'border-[#0F2942] bg-[#0F2942] text-white shadow-sm'
                        : 'border-[#E2E8F0] dark:border-[#28364D] bg-[#F8FAFC] dark:bg-[#172338] text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: isSelected ? '#FFFFFF' : cat.color }}
                    />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#475569] dark:text-[#94A3B8] block mb-1.5">
              Date
            </label>
            <div className="relative flex items-center">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-12 px-4 rounded-xl text-sm font-medium bg-[#F8FAFC] dark:bg-[#172338] border border-[#E2E8F0] dark:border-[#28364D] text-[#0F172A] dark:text-[#F8FAFC] outline-none focus:border-[#DC2626] dark:focus:border-[#EF4444] transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl text-xs font-bold text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#172338] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#0F2942] hover:bg-[#0A1D2F] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-60 active:scale-95"
            >
              <Edit2 size={16} />
              <span>{isSubmitting ? 'Updating...' : 'Update Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
