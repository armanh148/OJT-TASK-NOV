'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  Download,
  Edit2,
  Trash2,
  Receipt,
  ArrowUpDown,
  ChevronDown,
  Check,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AddExpenseModal } from '@/components/expenses/AddExpenseModal';
import { EditExpenseModal } from '@/components/expenses/EditExpenseModal';
import { DeleteConfirmModal } from '@/components/expenses/DeleteConfirmModal';
import { useFinancial } from '@/context/FinancialContext';
import { formatPKR, formatDate, getCategoryMeta, CATEGORIES } from '@/lib/formatters';
import { ExpenseItem } from '@/types';

type SortField = 'date' | 'amount' | 'name';
type SortOrder = 'asc' | 'desc';

export default function ExpensesPage() {
  const { expenses, summary, exportCSV } = useFinancial();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<ExpenseItem | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const processedExpenses = useMemo(() => {
    let list = [...expenses];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((e) => e.name.toLowerCase().includes(q));
    }

    if (selectedCategory !== 'ALL') {
      list = list.filter(
        (e) => e.category.toUpperCase() === selectedCategory.toUpperCase()
      );
    }

    list.sort((a, b) => {
      if (sortField === 'date') {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      }
      if (sortField === 'amount') {
        const amtA = parseFloat(a.amount);
        const amtB = parseFloat(b.amount);
        return sortOrder === 'desc' ? amtB - amtA : amtA - amtB;
      }
      if (sortField === 'name') {
        return sortOrder === 'desc'
          ? b.name.localeCompare(a.name)
          : a.name.localeCompare(b.name);
      }
      return 0;
    });

    return list;
  }, [expenses, search, selectedCategory, sortField, sortOrder]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const activeCategoryMeta = selectedCategory === 'ALL'
    ? { label: 'All Categories', color: '#64748B' }
    : getCategoryMeta(selectedCategory);

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
              Expense Ledger
            </h1>
            <p className="text-xs sm:text-sm text-[#475569] dark:text-[#94A3B8] mt-1 font-medium">
              Search, filter, categorize, and audit transactions in Neon PostgreSQL.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => exportCSV()}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-full text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] hover:bg-[#F1F5F9] dark:hover:bg-[#2D3E5B] transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#0F2942] hover:bg-[#0A1D2F] transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
            >
              <Plus size={16} />
              <span>Record Expense</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#152238] border border-[#E2E8F0] dark:border-[#28364D] space-y-3 transition-colors">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]"
              />
              <input
                type="text"
                inputMode="search"
                placeholder="Search transactions by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl text-xs font-medium bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] outline-none focus:border-[#DC2626] dark:focus:border-[#EF4444] text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#94A3B8] transition-all"
              />
            </div>

            {/* Custom Styled Category Dropdown (Replacing ugly native OS select) */}
            <div className="relative w-full sm:w-auto" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className="w-full sm:w-auto min-w-[190px] h-11 px-3.5 rounded-xl text-xs font-bold bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] text-[#0F172A] dark:text-[#F8FAFC] flex items-center justify-between gap-3 shadow-xs hover:border-[#0F2942] dark:hover:border-[#38BDF8] transition-all focus:outline-none"
                aria-haspopup="listbox"
                aria-expanded={isCategoryDropdownOpen}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: activeCategoryMeta.color }}
                  />
                  <span className="truncate">{activeCategoryMeta.label}</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`text-[#64748B] dark:text-[#94A3B8] transition-transform duration-200 shrink-0 ${
                    isCategoryDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Styled Custom Floating Menu */}
              {isCategoryDropdownOpen && (
                <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-full sm:w-64 max-h-72 overflow-y-auto rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#28364D] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* All Categories Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('ALL');
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                      selectedCategory === 'ALL'
                        ? 'bg-[#0F2942] text-white shadow-xs'
                        : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#172338]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#64748B] shrink-0" />
                      <span>All Categories</span>
                    </div>
                    {selectedCategory === 'ALL' && <Check size={14} className="text-white shrink-0" />}
                  </button>

                  <div className="my-1 border-t border-[#E2E8F0] dark:border-[#28364D]" />

                  {/* List of Specific Categories */}
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                          isSelected
                            ? 'bg-[#0F2942] text-white shadow-xs'
                            : 'text-[#0F172A] dark:text-[#F8FAFC] hover:bg-[#F1F5F9] dark:hover:bg-[#172338]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: isSelected ? '#FFFFFF' : cat.color }}
                          />
                          <span className="truncate">{cat.label}</span>
                        </div>
                        {isSelected && <Check size={14} className="text-white shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] dark:border-[#28364D] text-xs text-[#475569] dark:text-[#94A3B8]">
            <span>
              Showing <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{processedExpenses.length}</strong> of{' '}
              {expenses.length} records
            </span>
            <span>
              Total for Active Filter:{' '}
              <strong className="text-[#DC2626] dark:text-[#EF4444] font-black tabular-numbers text-sm">
                {summary?.formattedTotalExpense || 'Rs. 0.00'}
              </strong>
            </span>
          </div>
        </div>

        {/* Expenses: Mobile Cards on < sm, Table on sm+ */}
        {processedExpenses.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#28364D] bg-white dark:bg-[#152238] p-12 text-center shadow-sm transition-colors">
            <Receipt size={32} className="text-[#94A3B8] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">No matching expenses found</h4>
            <p className="text-xs text-[#475569] dark:text-[#94A3B8] max-w-sm mx-auto mt-1">
              Try adjusting your search query or reset the category filter.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Cards List (< sm) */}
            <div className="sm:hidden space-y-2.5">
              {processedExpenses.map((exp) => {
                const meta = getCategoryMeta(exp.category);
                return (
                  <div
                    key={exp.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#28364D] flex items-center justify-between shadow-xs transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold"
                        style={{
                          backgroundColor: `${meta.color}15`,
                          color: meta.color,
                        }}
                      >
                        <Receipt size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate">{exp.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                            style={{
                              backgroundColor: `${meta.color}15`,
                              color: meta.color,
                            }}
                          >
                            {meta.label}
                          </span>
                          <span className="text-[10px] text-[#475569] dark:text-[#94A3B8]">
                            {formatDate(exp.date)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-black text-[#DC2626] dark:text-[#EF4444] tabular-numbers">
                        {formatPKR(exp.amount)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingExpense(exp)}
                          className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#28364D] text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] active:scale-90 transition-transform"
                          aria-label="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => setDeletingExpense(exp)}
                          className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-500 hover:text-rose-700 active:scale-90 transition-transform"
                          aria-label="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop / Tablet Table (sm+) */}
            <div className="hidden sm:block rounded-2xl border border-[#E2E8F0] dark:border-[#28364D] bg-white dark:bg-[#1E293B] overflow-hidden shadow-sm transition-colors">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] dark:border-[#28364D] text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider text-[10px] bg-[#F8FAFC] dark:bg-[#152238]">
                      <th
                        className="py-3.5 px-5 font-bold cursor-pointer hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
                        onClick={() => toggleSort('name')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Description</span>
                          <ArrowUpDown size={12} />
                        </div>
                      </th>
                      <th className="py-3.5 px-5 font-bold">Category</th>
                      <th
                        className="py-3.5 px-5 font-bold cursor-pointer hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
                        onClick={() => toggleSort('date')}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Date</span>
                          <ArrowUpDown size={12} />
                        </div>
                      </th>
                      <th
                        className="py-3.5 px-5 font-bold text-right cursor-pointer hover:text-[#0F172A] dark:hover:text-[#F8FAFC]"
                        onClick={() => toggleSort('amount')}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <span>Amount</span>
                          <ArrowUpDown size={12} />
                        </div>
                      </th>
                      <th className="py-3.5 px-5 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#28364D]">
                    {processedExpenses.map((exp) => {
                      const meta = getCategoryMeta(exp.category);
                      return (
                        <tr key={exp.id} className="hover:bg-[#F1F5F9] dark:hover:bg-[#28364D] transition-colors">
                          <td className="py-3.5 px-5 font-bold text-[#0F172A] dark:text-[#F8FAFC]">{exp.name}</td>
                          <td className="py-3.5 px-5">
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
                              style={{
                                backgroundColor: `${meta.color}15`,
                                borderColor: `${meta.color}30`,
                                color: meta.color,
                              }}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: meta.color }}
                              />
                              {meta.label}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-[#475569] dark:text-[#94A3B8] tabular-numbers font-medium">
                            {formatDate(exp.date)}
                          </td>
                          <td className="py-3.5 px-5 font-bold text-[#DC2626] dark:text-[#EF4444] text-right tabular-numbers text-sm">
                            {formatPKR(exp.amount)}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => setEditingExpense(exp)}
                                className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#28364D] text-[#475569] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-white dark:hover:bg-[#152238] transition-colors"
                                title="Edit expense"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => setDeletingExpense(exp)}
                                className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                                title="Delete expense"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <AddExpenseModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

      {editingExpense && (
        <EditExpenseModal
          isOpen={true}
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}

      {deletingExpense && (
        <DeleteConfirmModal
          isOpen={true}
          expense={deletingExpense}
          onClose={() => setDeletingExpense(null)}
        />
      )}
    </DashboardShell>
  );
}
