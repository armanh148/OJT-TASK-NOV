export interface ColorScheme {
  primary: string;
  primaryHover: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  border: string;
  text: string;
  textMuted: string;
  textDim: string;
  income: string;
  incomeBg: string;
  incomeBorder: string;
  expense: string;
  expenseBg: string;
  expenseBorder: string;
  balance: string;
  balanceBg: string;
  balanceBorder: string;
  warning: string;
  warningBg: string;
  warningBorder: string;
  card: string;
  modalBg: string;
}

// Navy Blue & Red Theme - Light Mode (Ice Navy & Crimson Red)
export const lightColors: ColorScheme = {
  primary: '#DC2626',       // Vibrant Crimson Red
  primaryHover: '#B91C1C',
  background: '#F1F5F9',    // Ice Slate Navy Canvas
  surface: '#FFFFFF',
  surfaceVariant: '#E2E8F0',// Slate 200
  border: '#CBD5E1',        // Slate 300 Border
  text: '#0F172A',          // Deep Midnight Slate Navy
  textMuted: '#475569',     // Slate 600
  textDim: '#94A3B8',
  income: '#16A34A',        // Emerald Green
  incomeBg: '#F0FDF4',
  incomeBorder: '#BBF7D0',
  expense: '#DC2626',       // Crimson Red
  expenseBg: '#FEF2F2',
  expenseBorder: '#FECACA',
  balance: '#0F2942',       // Deep Royal Navy Blue
  balanceBg: '#0F294215',
  balanceBorder: '#0F294230',
  warning: '#D97706',       // Warm Amber
  warningBg: '#FFFBEB',
  warningBorder: '#FDE68A',
  card: '#FFFFFF',
  modalBg: 'rgba(15, 23, 42, 0.65)',
};

// Navy Blue & Red Theme - Dark Mode (Obsidian Navy & Vivid Red)
export const darkColors: ColorScheme = {
  primary: '#EF4444',       // Vibrant Crimson
  primaryHover: '#F87171',
  background: '#080D1A',    // Deep Obsidian Navy
  surface: '#0F172A',       // Midnight Navy Surface
  surfaceVariant: '#172338',// Deep Navy Variant
  border: '#28364D',        // Navy Steel Border
  text: '#F8FAFC',          // Cool Off-White
  textMuted: '#94A3B8',     // Soft Slate
  textDim: '#64748B',
  income: '#22C55E',        // Emerald Green
  incomeBg: '#14532D33',
  incomeBorder: '#166534',
  expense: '#EF4444',       // Crimson Red
  expenseBg: '#7F1D1D33',
  expenseBorder: '#991B1B',
  balance: '#38BDF8',       // Electric Sky Blue / Navy Accent
  balanceBg: '#38BDF820',
  balanceBorder: '#38BDF840',
  warning: '#F59E0B',
  warningBg: '#78350F33',
  warningBorder: '#92400E',
  card: '#0F172A',
  modalBg: 'rgba(8, 13, 26, 0.85)',
};

export const CATEGORY_COLORS: Record<string, string> = {
  FOOD: '#EA580C',          // Terracotta Orange
  HOUSING: '#1E3A8A',       // Deep Royal Navy
  UTILITIES: '#0D9488',     // Teal
  TRANSPORT: '#DC2626',     // Crimson Red
  HEALTH: '#BE123C',        // Wine Red
  ENTERTAINMENT: '#6366F1', // Indigo Navy
  SHOPPING: '#E11D48',      // Ruby Red
  EDUCATION: '#0284C7',     // Sky Blue
  PERSONAL: '#D97706',      // Golden Amber
  OTHER: '#64748B',         // Cool Slate
};

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
