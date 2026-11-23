'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { AddExpenseModal } from '@/components/expenses/AddExpenseModal';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F1F5F9] dark:bg-[#080D1A] text-[#0F172A] dark:text-[#F8FAFC]">
        <Loader2 className="w-10 h-10 animate-spin text-[#0F2942] dark:text-[#EF4444] mb-4" />
        <p className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#080D1A] text-[#0F172A] dark:text-[#F8FAFC] flex flex-col font-sans selection:bg-[#DC2626] selection:text-white transition-colors duration-200">
      {/* Main Layout Area (Full width, No left sidebar) */}
      <div className="flex flex-col flex-1 min-w-0">
        <Navbar />

        {/* Container Sheet: Full width container with dark/light mode */}
        <main className="flex-1 bg-white dark:bg-[#0F172A] rounded-t-[24px] sm:rounded-t-[28px] lg:rounded-[32px] p-4 sm:p-6 lg:p-8 mx-0 sm:mx-4 lg:mx-6 mb-0 lg:mb-6 shadow-sm border-t lg:border border-[#E2E8F0] dark:border-[#28364D] pb-24 lg:pb-8 transition-colors duration-200">
          {children}
        </main>
      </div>

      {/* Native App-Style Mobile Bottom Navigation Bar */}
      <BottomNav onQuickAdd={() => setIsQuickAddOpen(true)} />

      {/* Quick Add Modal triggered from bottom navigation */}
      <AddExpenseModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
    </div>
  );
};
