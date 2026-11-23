'use client';

import React from 'react';
import {
  ShieldCheck,
  Coins,
  Download,
  LogOut,
  Database,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useAuth } from '@/context/AuthContext';
import { useFinancial } from '@/context/FinancialContext';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { exportCSV } = useFinancial();

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Profile & Security
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-1 font-medium">
            Manage your verified identity, PostgreSQL session, and export credentials.
          </p>
        </div>

        {/* User Card */}
        <div className="p-6 sm:p-7 rounded-[24px] bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-[#28364D] flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0F2942] text-white font-black text-xl flex items-center justify-center shadow-md">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0F172A] dark:text-[#F8FAFC]">{user?.name || 'Verified User'}</h2>
              <p className="text-xs text-[#475569] dark:text-[#94A3B8]">{user?.email || 'admin@budgettracker.com'}</p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mt-2">
                <ShieldCheck size={12} className="text-emerald-700 dark:text-emerald-400" />
                <span>Neon PostgreSQL Authenticated</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#DC2626] dark:text-[#EF4444] bg-white dark:bg-[#1E293B] border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950 transition-all flex items-center gap-2 self-start sm:self-auto shadow-sm"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-[#28364D] flex items-center justify-between transition-colors">
            <div>
              <h3 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Reporting Currency</h3>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-0.5">Pakistani Rupee (PKR - Rs.)</p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
              <Coins size={16} />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-[#28364D] flex items-center justify-between transition-colors">
            <div>
              <h3 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">Audit Data Export</h3>
              <p className="text-[11px] text-[#475569] dark:text-[#94A3B8] mt-0.5">Download full RFC-4180 CSV</p>
            </div>
            <button
              onClick={() => exportCSV()}
              className="p-2 rounded-lg bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] hover:bg-[#F1F5F9] dark:hover:bg-[#28364D] text-[#0F172A] dark:text-[#F8FAFC] transition-colors shadow-sm"
              title="Download CSV"
            >
              <Download size={16} />
            </button>
          </div>
        </div>

        {/* Tech Specifications */}
        <div className="p-6 rounded-[24px] bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-[#28364D] space-y-3 transition-colors">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-[#0F2942] dark:text-[#38BDF8]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC]">
              System Specifications
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#28364D]">
              <span className="text-[10px] text-[#475569] dark:text-[#94A3B8] font-bold block">Engine</span>
              <span className="font-extrabold text-[#0F172A] dark:text-[#F8FAFC]">Decimal.js 28-Digit</span>
            </div>
            <div className="p-3 bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#28364D]">
              <span className="text-[10px] text-[#475569] dark:text-[#94A3B8] font-bold block">Database</span>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400">Neon PostgreSQL</span>
            </div>
            <div className="p-3 bg-white dark:bg-[#1E293B] rounded-xl border border-[#E2E8F0] dark:border-[#28364D]">
              <span className="text-[10px] text-[#475569] dark:text-[#94A3B8] font-bold block">Security Protocol</span>
              <span className="font-extrabold text-[#DC2626] dark:text-[#EF4444]">HttpOnly JWT + bcrypt</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
