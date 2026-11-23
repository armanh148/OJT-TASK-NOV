'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);

  const getPasswordStrength = () => {
    if (!password) return { label: 'Password required', color: 'bg-slate-300', score: 0 };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { label: 'Weak (needs 8+ chars & numbers)', color: 'bg-rose-500', score: 1 };
    if (score === 2) return { label: 'Medium (add uppercase & special chars)', color: 'bg-amber-500', score: 2 };
    return { label: 'Strong password', color: 'bg-emerald-500', score: 3 };
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!name.trim()) {
      errs.name = 'Full name is required';
    } else if (name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters long';
    } else if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      errs.password = 'Must contain at least 1 uppercase letter and 1 number';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    const res = await register(name.trim(), email.trim(), password);
    setIsLoading(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setErrors({ general: res.message || 'Registration failed' });
    }
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#090A10] overflow-hidden font-sans">
      {/* Financial Architecture Glass Facade Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1920&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#090A10]/95 via-[#090A10]/80 to-[#090A10]/50 backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090A10] via-transparent to-[#090A10]/60" />

      {/* Main Container */}
      <div className="relative w-full max-w-7xl mx-auto min-h-[85vh] lg:min-h-[88vh] grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-12 z-10">
        {/* LEFT COLUMN: Value Proposition & Brand Copy (visible on desktop) */}
        <div className="hidden lg:flex lg:col-span-7 flex-col justify-between h-full p-6 sm:p-10 text-white">
          {/* Top Brand Bar */}
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#090A10] font-black shadow-lg group-hover:scale-105 transition-transform">
                <div className="w-5 h-5 flex flex-wrap gap-0.5 justify-center items-center">
                  <span className="w-2 h-2 rounded-[3px] bg-[#090A10]" />
                  <span className="w-2 h-2 rounded-[3px] bg-indigo-600" />
                  <span className="w-2 h-2 rounded-[3px] bg-cyan-500" />
                  <span className="w-2 h-2 rounded-[3px] bg-[#090A10]" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-white tracking-tight">Finova</span>
                <span className="text-[9px] font-bold text-[#8F92A1] uppercase tracking-widest">
                  Budget Tracker
                </span>
              </div>
            </Link>

            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </Link>
          </div>

          {/* Middle Copy Section */}
          <div className="my-8 lg:my-16 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
              <Sparkles size={13} className="text-cyan-300" />
              <span className="text-[11px] font-bold text-white tracking-wide uppercase">
                Create Live Vault Account
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
              Institutional Security. <br />
              <span className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-emerald-300 bg-clip-text text-transparent">
                Personal Control.
              </span>
            </h1>

            <p className="mt-6 text-sm sm:text-base text-white/80 leading-relaxed font-normal max-w-lg">
              Start managing your monthly income and expenses with arbitrary decimal precision, PostgreSQL multi-tenant isolation, and real-time auditability.
            </p>

            <div className="flex items-center gap-2 mt-8">
              <span className="w-8 h-1.5 rounded-full bg-white shadow-sm" />
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
            <span>Zero Floating-Point Error</span>
            <span>•</span>
            <span>bcrypt Hashed</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Elevated Crisp White Floating Card */}
        <div className="lg:col-span-5 w-full max-w-md mx-auto">
          {/* Mobile Brand Bar */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#090A10] font-black shadow-lg">
              <div className="w-5 h-5 flex flex-wrap gap-0.5 justify-center items-center">
                <span className="w-2 h-2 rounded-[3px] bg-[#090A10]" />
                <span className="w-2 h-2 rounded-[3px] bg-indigo-600" />
                <span className="w-2 h-2 rounded-[3px] bg-cyan-500" />
                <span className="w-2 h-2 rounded-[3px] bg-[#090A10]" />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xl font-black text-white tracking-tight">Finova</span>
              <span className="text-[9px] font-bold text-[#8F92A1] uppercase tracking-widest">
                Budget Tracker
              </span>
            </div>
          </div>

          <div className="bg-white rounded-[28px] p-7 sm:p-9 shadow-2xl border border-white/30 backdrop-blur-xl">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-[#090A10] tracking-tight">
                Create Your Account
              </h2>
              <p className="text-xs sm:text-sm text-[#6B7280] mt-1 font-medium">
                Start managing your monthly finances with precision.
              </p>
            </div>

            {errors.general && (
              <div className="p-3.5 mb-5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#374151] block">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Input your full name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  className="w-full h-11 px-4 rounded-xl text-xs font-medium bg-white border border-[#E5E7EB] text-[#090A10] placeholder:text-[#9CA3AF] outline-none focus:border-[#090A10] focus:ring-1 focus:ring-[#090A10] transition-all"
                  autoFocus
                />
                {errors.name && (
                  <span className="text-[10px] font-semibold text-rose-600 block mt-0.5">
                    {errors.name}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#374151] block">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Input your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className="w-full h-11 px-4 rounded-xl text-xs font-medium bg-white border border-[#E5E7EB] text-[#090A10] placeholder:text-[#9CA3AF] outline-none focus:border-[#090A10] focus:ring-1 focus:ring-[#090A10] transition-all"
                />
                {errors.email && (
                  <span className="text-[10px] font-semibold text-rose-600 block mt-0.5">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#374151] block">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    className="w-full h-11 pl-4 pr-11 rounded-xl text-xs font-medium bg-white border border-[#E5E7EB] text-[#090A10] placeholder:text-[#9CA3AF] outline-none focus:border-[#090A10] focus:ring-1 focus:ring-[#090A10] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 p-1 text-[#9CA3AF] hover:text-[#090A10] transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {password.length > 0 && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex gap-1.5 h-1">
                      <div className={`h-full flex-1 rounded-full transition-all ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 rounded-full transition-all ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`} />
                      <div className={`h-full flex-1 rounded-full transition-all ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`} />
                    </div>
                    <span className="text-[10px] text-[#6B7280] font-medium block">{strength.label}</span>
                  </div>
                )}

                {errors.password && (
                  <span className="text-[10px] font-semibold text-rose-600 block mt-0.5">
                    {errors.password}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#374151] block">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  className="w-full h-11 px-4 rounded-xl text-xs font-medium bg-white border border-[#E5E7EB] text-[#090A10] placeholder:text-[#9CA3AF] outline-none focus:border-[#090A10] focus:ring-1 focus:ring-[#090A10] transition-all"
                />
                {errors.confirmPassword && (
                  <span className="text-[10px] font-semibold text-rose-600 block mt-0.5">
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 mt-3 rounded-full font-bold text-xs text-white bg-[#090A10] hover:bg-black transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 disabled:opacity-60"
              >
                <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
                {!isLoading && <ArrowRight size={15} />}
              </button>
            </form>

            <p className="text-center text-xs text-[#6B7280] mt-6 font-medium">
              Already registered?{' '}
              <Link
                href="/login"
                className="font-bold text-[#090A10] hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
