import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        finova: {
          dark: '#080D1A',        // Deep Obsidian Navy
          darkCard: '#152238',    // Deep Navy Card
          card: '#F8FAFC',        // Slate 50 Light Card
          canvas: '#F1F5F9',      // Slate 100 Light Canvas
          muted: '#64748B',       // Slate 500 Muted
          label: '#475569',       // Slate 600 Label
          border: '#E2E8F0',      // Slate 200 Border
          borderDark: '#28364D',  // Navy Dark Border
          emerald: '#16A34A',     // Green
          rose: '#DC2626',        // Vibrant Crimson Red
          amber: '#D97706',       // Amber Gold
          navy: {
            50: '#F0F6FF',
            100: '#E0EEFE',
            200: '#BAE0FD',
            300: '#7CC5FB',
            400: '#38A5F8',
            500: '#0E87EB',
            600: '#026AC9',
            700: '#0354A3',
            800: '#074886',
            900: '#0F2942',
            950: '#080D1A',
          },
          red: {
            50: '#FEF2F2',
            100: '#FEE2E2',
            200: '#FECACA',
            300: '#FCA5A5',
            400: '#F87171',
            500: '#EF4444',
            600: '#DC2626',
            700: '#B91C1C',
            800: '#991B1B',
            900: '#7F1D1D',
          },
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'finova-card': '0 8px 30px rgba(15, 23, 42, 0.06)',
        'finova-hero': '0 12px 35px rgba(15, 41, 66, 0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
