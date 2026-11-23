'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useFinancial } from '@/context/FinancialContext';
import { getMonthName } from '@/lib/formatters';

export const MonthPicker: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { selectedMonth, selectedYear, nextMonth, previousMonth } = useFinancial();

  return (
    <div
      className={`inline-flex items-center justify-between gap-1 px-2.5 py-1.5 rounded-full border border-[#E2E8F0] dark:border-[#28364D] bg-white dark:bg-[#0F172A] shadow-sm ${className}`}
    >
      <button
        type="button"
        onClick={previousMonth}
        className="p-1 rounded-full text-[#64748B] dark:text-[#94A3B8] hover:text-[#DC2626] dark:hover:text-[#EF4444] hover:bg-[#F1F5F9] dark:hover:bg-[#172338] transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="flex items-center gap-1.5 px-2 select-none">
        <Calendar size={13} className="text-[#0F2942] dark:text-[#38BDF8]" />
        <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
          {getMonthName(selectedMonth)} {selectedYear}
        </span>
      </div>

      <button
        type="button"
        onClick={nextMonth}
        className="p-1 rounded-full text-[#64748B] dark:text-[#94A3B8] hover:text-[#DC2626] dark:hover:text-[#EF4444] hover:bg-[#F1F5F9] dark:hover:bg-[#172338] transition-colors"
        aria-label="Next month"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};
