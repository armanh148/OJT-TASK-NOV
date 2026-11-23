import Decimal from 'decimal.js';

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function getMonthName(monthNumber: number): string {
  if (monthNumber < 1 || monthNumber > 12) return 'Unknown';
  return MONTH_NAMES[monthNumber - 1];
}

/**
 * Format arbitrary amount to Pakistani Rupee (PKR / Rs.)
 * Uses Decimal.js for precise representation
 */
export function formatPKR(amount: string | number | Decimal | undefined | null): string {
  if (amount === undefined || amount === null) {
    return 'Rs. 0.00';
  }

  try {
    const dec = new Decimal(amount.toString());
    const isNegative = dec.isNegative();
    const abs = dec.abs();

    const parts = abs.toFixed(2).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formatted = `${integerPart}.${parts[1]}`;

    return isNegative ? `-Rs. ${formatted}` : `Rs. ${formatted}`;
  } catch {
    return 'Rs. 0.00';
  }
}

export function formatDate(dateStringOrDate: string | Date): string {
  try {
    const d = new Date(dateStringOrDate);
    if (isNaN(d.getTime())) return '';
    const day = d.getDate().toString().padStart(2, '0');
    const month = MONTH_NAMES[d.getMonth()].slice(0, 3);
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return '';
  }
}

export const CATEGORIES = [
  { id: 'FOOD', label: 'Food & Dining', icon: 'Utensils', color: '#F97316' },
  { id: 'BILLS', label: 'Bills & Utilities', icon: 'Zap', color: '#EAB308' },
  { id: 'HOUSING', label: 'Housing & Rent', icon: 'Home', color: '#3B82F6' },
  { id: 'TRAVEL', label: 'Travel & Transport', icon: 'Car', color: '#8B5CF6' },
  { id: 'HEALTHCARE', label: 'Medical & Healthcare', icon: 'HeartPulse', color: '#EC4899' },
  { id: 'EDUCATION', label: 'Education & Learning', icon: 'GraduationCap', color: '#06B6D4' },
  { id: 'ENTERTAINMENT', label: 'Entertainment & Leisure', icon: 'Film', color: '#6366F1' },
  { id: 'SHOPPING', label: 'Shopping', icon: 'ShoppingBag', color: '#10B981' },
  { id: 'OTHER', label: 'General / Other', icon: 'Receipt', color: '#64748B' },
] as const;

export function getCategoryMeta(categoryId?: string) {
  const normalized = (categoryId || 'OTHER').toUpperCase();
  // Map UTILITIES to BILLS and TRANSPORT to TRAVEL for backward compatibility
  const mapped = normalized === 'UTILITIES' ? 'BILLS' : normalized === 'TRANSPORT' ? 'TRAVEL' : normalized;
  const match = CATEGORIES.find((c) => c.id === mapped);
  return match || { id: 'OTHER', label: 'General', icon: 'Receipt', color: '#64748B' };
}
