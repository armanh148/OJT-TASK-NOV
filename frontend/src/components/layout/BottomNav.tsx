'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, Receipt, DollarSign, PieChart, Plus } from 'lucide-react';
import { clsx } from 'clsx';

interface BottomNavProps {
  onQuickAdd?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onQuickAdd }) => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: LayoutGrid },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
    { name: 'Income', href: '/income', icon: DollarSign },
    { name: 'Analytics', href: '/analytics', icon: PieChart },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl border-t border-[#E2E8F0] dark:border-[#28364D] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-3 pb-[max(env(safe-area-inset-bottom),10px)] pt-2 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-around relative">
        {/* Left items: Home & Expenses */}
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center min-w-[60px] py-1 transition-all active:scale-95',
                isActive
                  ? 'text-[#DC2626] dark:text-[#EF4444]'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#DC2626]'
              )}
            >
              <div
                className={clsx(
                  'w-9 h-9 rounded-2xl flex items-center justify-center transition-colors',
                  isActive ? 'bg-[#F1F5F9] dark:bg-[#172338]' : ''
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={clsx('text-[10px] tracking-tight mt-0.5', isActive ? 'font-black' : 'font-semibold')}>
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* Center Prominent Floating "Quick Add" Action Button in Solid Navy Blue */}
        {onQuickAdd && (
          <button
            type="button"
            onClick={onQuickAdd}
            className="flex flex-col items-center justify-center -mt-6 group active:scale-90 transition-transform"
            aria-label="Add transaction"
          >
            <div className="w-12 h-12 rounded-full bg-[#0F2942] text-white flex items-center justify-center shadow-lg shadow-black/20 ring-4 ring-[#F1F5F9] dark:ring-[#080D1A] group-hover:scale-105 transition-transform">
              <Plus size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-black text-[#0F172A] dark:text-[#F8FAFC] mt-1">Add</span>
          </button>
        )}

        {/* Right items: Income & Analytics */}
        {navItems.slice(2, 4).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex flex-col items-center justify-center min-w-[60px] py-1 transition-all active:scale-95',
                isActive
                  ? 'text-[#DC2626] dark:text-[#EF4444]'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#DC2626]'
              )}
            >
              <div
                className={clsx(
                  'w-9 h-9 rounded-2xl flex items-center justify-center transition-colors',
                  isActive ? 'bg-[#F1F5F9] dark:bg-[#172338]' : ''
                )}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={clsx('text-[10px] tracking-tight mt-0.5', isActive ? 'font-black' : 'font-semibold')}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
