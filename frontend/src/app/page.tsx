'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#070A13] text-white">
      <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-3" />
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Loading Monthly Budget Vault...
      </span>
    </div>
  );
}
