'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Coins,
  Download,
  LogOut,
  Database,
  ScanFace,
  Lock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { useAuth } from '@/context/AuthContext';
import { useFinancial } from '@/context/FinancialContext';
import { FaceLockModal } from '@/components/security/FaceLockModal';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { exportCSV } = useFinancial();

  // Face Lock states
  const [faceLockEnabled, setFaceLockEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'enroll' | 'verify' | 'unlock'>('verify');
  const [justToggled, setJustToggled] = useState(false);

  useEffect(() => {
    // Check saved preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('finova_face_lock_enabled');
      if (saved === 'true') {
        setFaceLockEnabled(true);
      }
    }
  }, []);

  const handleToggleFaceLock = () => {
    if (!faceLockEnabled) {
      // Prompt enrollment scan first
      setModalMode('enroll');
      setIsModalOpen(true);
    } else {
      // Disable
      setFaceLockEnabled(false);
      localStorage.setItem('finova_face_lock_enabled', 'false');
      setJustToggled(true);
      setTimeout(() => setJustToggled(false), 3000);
    }
  };

  const handleEnrollSuccess = () => {
    setFaceLockEnabled(true);
    localStorage.setItem('finova_face_lock_enabled', 'true');
    setJustToggled(true);
    setTimeout(() => setJustToggled(false), 3000);
  };

  const handleTestFaceScan = () => {
    setModalMode('verify');
    setIsModalOpen(true);
  };

  const handleLockNow = () => {
    setModalMode('unlock');
    setIsModalOpen(true);
  };

  return (
    <DashboardShell>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
            Profile & Site Settings
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-1 font-medium">
            Manage your verified identity, biometric Face Lock, PostgreSQL session, and audit credentials.
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

        {/* Biometric Face Lock Security Card (NEW) */}
        <div className="p-6 rounded-[24px] bg-gradient-to-br from-white to-[#F8FAFC] dark:from-[#152238] dark:to-[#0F172A] border-2 border-[#0F2942]/20 dark:border-[#38BDF8]/30 shadow-md transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#0F2942] dark:bg-[#0F2942] text-white flex items-center justify-center shadow-md shrink-0">
                <ScanFace size={26} className="text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-[#0F172A] dark:text-[#F8FAFC]">
                    Biometric Face Lock
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                      faceLockEnabled
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}
                  >
                    {faceLockEnabled ? (
                      <>
                        <CheckCircle2 size={10} className="text-emerald-600" />
                        <span>Enabled</span>
                      </>
                    ) : (
                      <span>Disabled</span>
                    )}
                  </span>
                </div>
                <p className="text-xs text-[#475569] dark:text-[#94A3B8] mt-1 leading-relaxed">
                  Protect your budget with Face ID, Windows Hello, or Fingerprint authentication before accessing sensitive financial data.
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex items-center gap-3 self-end sm:self-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={faceLockEnabled}
                  onChange={handleToggleFaceLock}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-[#0F2942] dark:peer-checked:bg-cyan-600"></div>
              </label>
            </div>
          </div>

          {/* Interactive controls if Face Lock is enabled */}
          {faceLockEnabled && (
            <div className="mt-5 pt-4 border-t border-[#E2E8F0] dark:border-[#28364D] flex flex-wrap items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2 text-xs text-[#64748B] dark:text-[#94A3B8]">
                <Sparkles size={14} className="text-amber-500" />
                <span>Device Biometrics Verified • Ready for Instant Face Authentication</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestFaceScan}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#0F2942] dark:text-cyan-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1.5"
                >
                  <ScanFace size={13} />
                  <span>Test Face Scan</span>
                </button>

                <button
                  onClick={handleLockNow}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#0F2942] hover:bg-[#1a3b5c] transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Lock size={13} />
                  <span>Lock Dashboard</span>
                </button>
              </div>
            </div>
          )}

          {justToggled && (
            <div className="mt-3 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fade-in">
              <CheckCircle2 size={12} />
              <span>Face Lock preferences updated successfully.</span>
            </div>
          )}
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
              <span className="font-extrabold text-[#DC2626] dark:text-[#EF4444]">Biometric + JWT bcrypt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Face Scanner Modal */}
      <FaceLockModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleEnrollSuccess}
        userName={user?.name || 'Admin'}
        mode={modalMode}
      />
    </DashboardShell>
  );
}
