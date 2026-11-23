'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useFinancial } from '@/context/FinancialContext';
import { formatPKR, getMonthName } from '@/lib/formatters';

export default function IncomePage() {
  const { selectedMonth, selectedYear, incomeAmount, setMonthlyIncome } = useFinancial();

  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [successMessage, setSuccessMessage] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (incomeAmount && incomeAmount !== '0.00') {
      setAmount(incomeAmount);
    } else {
      setAmount('');
    }
    setSuccessMessage(undefined);
    setError(undefined);
  }, [incomeAmount, selectedMonth, selectedYear]);

  const validate = () => {
    if (!amount.trim()) {
      setError('Income amount is required');
      return false;
    }
    const num = parseFloat(amount.trim());
    if (isNaN(num) || num < 0) {
      setError('Income amount cannot be negative');
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setError(undefined);
    setSuccessMessage(undefined);

    const res = await setMonthlyIncome(amount.trim());
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage(
        `Successfully allocated income for ${getMonthName(selectedMonth)} ${selectedYear}!`
      );
    } else {
      setError(res.message || 'Failed to update income');
    }
  };

  const handlePreset = (presetVal: number) => {
    setAmount(presetVal.toString());
    setError(undefined);
  };

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Monthly Income Allocation
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-1 font-medium">
            Configure your authoritative starting budget for {getMonthName(selectedMonth)}{' '}
            {selectedYear}.
          </p>
        </div>

        {/* Form Card */}
        <div className="p-6 sm:p-8 rounded-[24px] bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-[#28364D] space-y-6 transition-colors">
          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 flex items-center gap-2.5 text-xs font-semibold">
              <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 flex items-center gap-2.5 text-xs font-semibold">
              <ShieldAlert size={16} className="text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] block mb-2">
                Monthly Income Allocation (PKR)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-[#0F2942] dark:text-[#38BDF8] font-black text-lg select-none pointer-events-none">
                  Rs.
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  enterKeyHint="done"
                  placeholder="e.g. 100000"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    if (error) setError(undefined);
                  }}
                  className="w-full h-14 pl-14 pr-4 rounded-2xl text-xl font-black bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] outline-none focus:border-[#DC2626] dark:focus:border-[#EF4444] tabular-numbers shadow-sm transition-all"
                />
              </div>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-1.5 font-medium">
                Enforced by UNIQUE(user_id, month, year) database constraint in Neon PostgreSQL.
              </p>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="text-[11px] font-bold text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider block mb-2.5">
                Quick Preset Allocations
              </span>
              <div className="flex flex-wrap gap-2">
                {[50000, 75000, 100000, 150000, 200000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePreset(preset)}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#28364D] transition-all tabular-numbers shadow-sm active:scale-95"
                  >
                    {formatPKR(preset.toString())}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 py-3 px-6 rounded-xl font-bold text-xs text-white bg-[#0F2942] hover:bg-[#0A1D2F] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-60 active:scale-98"
            >
              <span>{isSubmitting ? 'Syncing to Database...' : 'Confirm Monthly Allocation'}</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Current Status */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] flex items-center justify-between text-xs text-[#475569] dark:text-[#94A3B8] transition-colors">
            <span>Current Active Allocation:</span>
            <strong className="text-[#0F172A] dark:text-[#F8FAFC] text-sm font-black tabular-numbers">
              {formatPKR(incomeAmount)}
            </strong>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
