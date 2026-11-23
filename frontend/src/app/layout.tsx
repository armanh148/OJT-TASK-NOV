import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { FinancialProvider } from '@/context/FinancialContext';

export const metadata: Metadata = {
  title: 'Monthly Budget Tracker',
  description: 'Enterprise-grade personal financial management and budget tracking.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Budget Tracker',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#090A10',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body
        className="antialiased font-sans selection:bg-indigo-600 selection:text-white overscroll-none"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            <FinancialProvider>{children}</FinancialProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
