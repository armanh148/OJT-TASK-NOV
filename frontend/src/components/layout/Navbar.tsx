'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Receipt,
  DollarSign,
  PieChart,
  Settings,
  LogOut,
  Wallet,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { MonthPicker } from '@/components/ui/MonthPicker';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { clsx } from 'clsx';

interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
    { name: 'Income', href: '/income', icon: DollarSign },
    { name: 'Analytics', href: '/analytics', icon: PieChart },
  ];

  return (
    <header className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8 bg-transparent">
      {/* Left: Brand Logo in Solid Navy Blue */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-[#0F2942] flex items-center justify-center text-white font-black shadow-sm group-hover:scale-105 transition-transform">
            <Wallet size={20} className="text-white" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-base font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Monthly Budget Tracker
            </span>
            <span className="text-[10px] font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
              Fintech Wealth Vault
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Top Navigation Pills */}
      <nav className="hidden md:flex items-center gap-1.5 bg-white dark:bg-[#0F172A] p-1.5 rounded-2xl border border-[#E2E8F0] dark:border-[#28364D] shadow-sm">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all',
                isActive
                  ? 'bg-[#0F2942] text-white shadow-sm'
                  : 'text-[#475569] dark:text-[#94A3B8] hover:text-[#DC2626] dark:hover:text-[#EF4444] hover:bg-[#F1F5F9] dark:hover:bg-[#172338]'
              )}
            >
              <Icon size={15} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Month Selector Pill */}
        <MonthPicker />

        {/* Theme Toggle Button (Light & Dark Mode) */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full border border-[#E2E8F0] dark:border-[#28364D] bg-white dark:bg-[#0F172A] flex items-center justify-center text-[#0F172A] dark:text-[#F8FAFC] hover:border-[#DC2626] transition-all shadow-sm"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {isDark ? (
            <Sun size={17} className="text-amber-400" />
          ) : (
            <Moon size={17} className="text-[#0F2942]" />
          )}
        </button>

        {/* User Avatar with Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-1 pl-1 pr-2 rounded-full bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#28364D] hover:border-[#DC2626] hover:shadow-sm transition-all focus:outline-none"
            aria-label="User menu"
            aria-expanded={dropdownOpen}
          >
            <div className="w-8 h-8 rounded-full bg-[#0F2942] text-white font-bold flex items-center justify-center text-xs shadow-sm ring-2 ring-white dark:ring-[#172338]">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <ChevronDown
              size={14}
              className={clsx(
                'text-[#64748B] dark:text-[#94A3B8] transition-transform duration-200',
                dropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown Menu Box */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#28364D] shadow-2xl py-2 z-50 animate-in fade-in duration-150">
              {/* User Identity Header */}
              <div className="px-4 py-3 border-b border-[#F1F5F9] dark:border-[#172338]">
                <p className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                  {user?.name || 'admin'}
                </p>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate font-medium mt-0.5">
                  {user?.email || 'admin@budgettracker.com'}
                </p>
              </div>

              {/* Preferences: Profile & Settings */}
              <div className="p-1.5 space-y-0.5">
                <span className="px-3 pt-2 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8] block">
                  Preferences
                </span>

                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors',
                    pathname === '/profile'
                      ? 'bg-[#0F2942] text-white'
                      : 'text-[#334155] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#172338] hover:text-[#DC2626]'
                  )}
                >
                  <Settings
                    size={16}
                    className={pathname === '/profile' ? 'text-white' : 'text-[#64748B] dark:text-[#94A3B8]'}
                  />
                  <span>Profile & Settings</span>
                </Link>

                {/* Theme Switcher Row in Dropdown */}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-[#334155] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#172338] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isDark ? (
                      <Sun size={16} className="text-amber-400" />
                    ) : (
                      <Moon size={16} className="text-[#0F2942]" />
                    )}
                    <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#172338] text-[#64748B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#28364D]">
                    {isDark ? 'Dark' : 'Light'}
                  </span>
                </button>
              </div>

              {/* Neon Cloud Database Status Pill */}
              <div className="mx-2 my-1.5 p-2.5 rounded-xl bg-[#F1F5F9] dark:bg-[#172338] border border-[#E2E8F0] dark:border-[#28364D] flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div className="truncate">
                  <span className="text-[11px] font-bold text-[#0F172A] dark:text-[#F8FAFC] block leading-tight">
                    Neon Cloud
                  </span>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block leading-tight">
                    PostgreSQL Connected
                  </span>
                </div>
              </div>

              {/* Logout Action */}
              <div className="pt-1 border-t border-[#F1F5F9] dark:border-[#172338] px-1.5">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#DC2626] hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut size={16} className="text-[#DC2626]" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
