'use client';

import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useFinancial } from '@/context/FinancialContext';
import { formatPKR } from '@/lib/formatters';
import { ExpenseItem } from '@/types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  expense?: ExpenseItem | null;
  expenseName?: string;
  expenseAmount?: string;
  onClose: () => void;
  onConfirm?: () => Promise<void> | void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  expense,
  expenseName,
  expenseAmount,
  onClose,
  onConfirm,
}) => {
  const { deleteExpense } = useFinancial();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const targetName = expense?.name || expenseName || 'this expense';
  const targetAmount = expense?.amount || expenseAmount || '0';

  const handleDelete = async () => {
    setIsDeleting(true);
    if (onConfirm) {
      await onConfirm();
    } else if (expense?.id) {
      await deleteExpense(expense.id);
    }
    setIsDeleting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md p-6 sm:p-8 bg-white dark:bg-[#0F172A] rounded-t-[32px] sm:rounded-3xl border border-[#E2E8F0] dark:border-[#28364D] shadow-2xl text-center transition-colors">
        {/* Mobile Swipe / Drag Handle */}
        <div className="w-12 h-1.5 bg-[#E2E8F0] dark:bg-[#28364D] rounded-full mx-auto mb-4 sm:hidden" />

        <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-[#DC2626] dark:text-rose-400 mb-4">
          <Trash2 size={24} />
        </div>

        <h3 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC] mb-2">
          Delete Transaction Record?
        </h3>

        <p className="text-sm text-[#475569] dark:text-[#94A3B8] mb-2">
          Are you sure you want to remove <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">"{targetName}"</span> valued at{' '}
          <span className="font-bold text-[#DC2626] dark:text-[#EF4444] tabular-numbers">{formatPKR(targetAmount)}</span>?
        </p>

        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mb-6">
          The monthly remaining balance will be automatically restored and recalculated in Neon PostgreSQL.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="w-1/2 py-3 px-4 rounded-xl text-xs font-bold text-[#475569] dark:text-[#94A3B8] bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] hover:bg-[#F1F5F9] dark:hover:bg-[#2D3E5B] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-1/2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-[#DC2626] hover:bg-[#B91C1C] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md active:scale-95"
          >
            <Trash2 size={14} />
            <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
