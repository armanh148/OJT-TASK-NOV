'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs: typeof errors = {};
    if (!email.trim()) {
      errs.email = 'Email or username is required';
    }

    if (!password) {
      errs.password = 'Password is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    const res = await login(email.trim(), password);
    setIsLoading(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setErrors({ general: res.message || 'Login failed. Invalid username or password.' });
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#080D1A] overflow-hidden font-sans">
      {/* Background with cool navy ambient lighting */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80')`,
        }}
      />
      {/* Solid Navy Overlay */}
      <div className="absolute inset-0 bg-[#080D1A]/90 backdrop-blur-[2px]" />

      {/* Main Container */}
      <div className="relative w-full max-w-7xl mx-auto min-h-[85vh] lg:min-h-[88vh] grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12 z-10">
        {/* LEFT COLUMN: Brand identity in Solid Navy Blue & Red */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between h-full p-6 sm:p-10 text-white">
          {/* Top Brand Bar */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#0F2942] flex items-center justify-center text-white font-black shadow-lg group-hover:scale-105 transition-transform">
                <Wallet size={20} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-tight">Monthly Budget Tracker</span>
                <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest">
                  Financial Management
                </span>
              </div>
            </Link>

            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Dashboard</span>
            </Link>
          </div>

          {/* Middle Copy Section */}
          <div className="my-12 lg:my-20 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
              <Sparkles size={13} className="text-sky-300" />
              <span className="text-[11px] font-bold text-white tracking-wide uppercase">
                Fintech Wealth Intelligence
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
              Track Smarter. <br />
              Save Faster. <br />
              <span className="text-[#DC2626]">
                Grow Anywhere.
              </span>
            </h1>

            <p className="mt-6 text-sm sm:text-base text-[#94A3B8] leading-relaxed font-normal max-w-lg">
              From monthly income allocations to granular expense audits, our authoritative decimal calculation engine gives you infallible financial oversight.
            </p>

            {/* Pagination Indicators */}
            <div className="flex items-center gap-2 mt-8">
              <span className="w-8 h-1.5 rounded-full bg-[#DC2626] shadow-sm" />
              <span className="w-2 h-1.5 rounded-full bg-white/40" />
              <span className="w-2 h-1.5 rounded-full bg-white/40" />
            </div>
          </div>

          {/* Bottom Security Capsule */}
          <div className="flex items-center gap-6 text-xs text-white/60">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400" />
              Neon PostgreSQL Connected
            </span>
            <span>•</span>
            <span>28-Digit Decimal Precision</span>
            <span>•</span>
            <span>HttpOnly JWT</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Elevated Floating Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          {/* Mobile Brand Bar */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#0F2942] flex items-center justify-center text-white font-black shadow-lg">
              <Wallet size={20} className="text-white" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-black text-white tracking-tight">Monthly Budget Tracker</span>
              <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest">
                Financial Management
              </span>
            </div>
          </div>

          <div className="bg-white rounded-[28px] p-7 sm:p-10 shadow-2xl border border-[#E2E8F0] backdrop-blur-xl">
            {/* Form Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">
                Welcome Back!
              </h2>
              <p className="text-xs sm:text-sm text-[#475569] mt-1.5 font-medium">
                Log in to manage your monthly budget with precision.
              </p>
            </div>

            {/* General Error Alert */}
            {errors.general && (
              <div className="p-3.5 mb-6 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username or Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0F172A] block">
                  Username or Email
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Input your username or email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    className="w-full h-12 px-4 rounded-xl text-sm font-medium bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] transition-all"
                    autoFocus
                  />
                </div>
                {errors.email && (
                  <span className="text-[11px] font-semibold text-rose-600 block mt-0.5">
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#0F172A] block">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Input your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    className="w-full h-12 pl-4 pr-11 rounded-xl text-sm font-medium bg-[#F8FAFC] border border-[#CBD5E1] text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 p-1 text-[#94A3B8] hover:text-[#DC2626] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-[11px] font-semibold text-rose-600 block mt-0.5">
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Utilities Row: Remember Me & Protected by JWT */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[#475569] hover:text-[#0F172A]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#CBD5E1] text-[#DC2626] focus:ring-[#DC2626]"
                  />
                  <span>Remember Me</span>
                </label>
                <span className="text-[#94A3B8]">Protected by JWT</span>
              </div>

              {/* Submit Button in Solid Navy Blue */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-2 rounded-xl text-xs font-black text-white bg-[#0F2942] hover:bg-[#0A1D2F] transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 disabled:opacity-50 active:scale-98"
              >
                <span>{isLoading ? 'Verifying Credentials...' : 'Login'}</span>
                <ArrowRight size={14} />
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-[#64748B]">
              <span>Don't have an account? </span>
              <Link
                href="/register"
                className="font-bold text-[#DC2626] hover:underline"
              >
                Sign up here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
