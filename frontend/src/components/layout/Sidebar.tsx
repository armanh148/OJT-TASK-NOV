'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  Receipt,
  DollarSign,
  PieChart,
  Settings,
  LogOut,
  X,
  Bot,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
    { name: 'Income', href: '/income', icon: DollarSign },
    { name: 'Analytics', href: '/analytics', icon: PieChart },
  ];

  const preferenceItems = [
    { name: 'Profile & Settings', href: '/profile', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Finova Obsidian Sidebar */}
      <aside
        className={clsx(
          'fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-[#090A10] text-[#8F92A1] transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-20 px-6">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            {/* Finova Geometric Logo */}
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#090A10] font-black shadow-md group-hover:scale-105 transition-transform">
              <div className="w-5 h-5 flex flex-wrap gap-0.5 justify-center items-center">
                <span className="w-2 h-2 rounded-[3px] bg-[#090A10]" />
                <span className="w-2 h-2 rounded-[3px] bg-indigo-600" />
                <span className="w-2 h-2 rounded-[3px] bg-cyan-500" />
                <span className="w-2 h-2 rounded-[3px] bg-[#090A10]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-white tracking-tight">Finova</span>
              <span className="text-[9px] font-bold text-[#6E7191] uppercase tracking-widest">
                Budget Vault
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="p-1.5 text-[#6E7191] hover:text-white rounded-lg lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Body */}
        <div className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
          {/* Section: MENU */}
          <div className="space-y-1.5">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#6E7191] block mb-2">
              Menu
            </span>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={clsx(
                    'flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all',
                    isActive
                      ? 'bg-white text-[#090A10] shadow-sm'
                      : 'text-[#8F92A1] hover:text-white hover:bg-white/[0.04]'
                  )}
                >
                  <Icon
                    size={18}
                    className={clsx(
                      'transition-colors',
                      isActive ? 'text-[#090A10]' : 'text-[#8F92A1]'
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Section: PREFERENCES */}
          <div className="space-y-1.5">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#6E7191] block mb-2">
              Preferences
            </span>
            {preferenceItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={clsx(
                    'flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all',
                    isActive
                      ? 'bg-white text-[#090A10] shadow-sm'
                      : 'text-[#8F92A1] hover:text-white hover:bg-white/[0.04]'
                  )}
                >
                  <Icon
                    size={18}
                    className={clsx(
                      'transition-colors',
                      isActive ? 'text-[#090A10]' : 'text-[#8F92A1]'
                    )}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Database Sync Capsule */}
        <div className="mx-4 mb-3 p-3 rounded-2xl bg-[#13151F] border border-white/[0.06] flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <div className="truncate">
            <span className="text-[11px] font-bold text-white block">Neon Cloud</span>
            <span className="text-[10px] text-[#6E7191]">ACID PostgreSQL</span>
          </div>
        </div>

        {/* User Footer & Logout */}
        <div className="p-4 border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-white block truncate">
                {user?.name || 'Authorized'}
              </span>
              <span className="text-[10px] text-[#6E7191] block truncate">
                {user?.email || 'user@finova.com'}
              </span>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="p-2 text-[#8F92A1] hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
};
