'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  isPassword?: boolean;
  leftIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isPassword = false,
  leftIcon,
  className,
  containerClassName,
  id,
  type = 'text',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={twMerge('w-full flex flex-col gap-1.5', containerClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          className={twMerge(
            clsx(
              'w-full h-12 px-4 rounded-2xl text-sm font-medium transition-all duration-200 outline-none',
              'bg-slate-900/70 border text-white placeholder:text-slate-400',
              error
                ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/30'
                : 'border-white/[0.1] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 focus:bg-slate-900/90',
              leftIcon && 'pl-11',
              isPassword && 'pr-11',
              className
            )
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 p-1 text-slate-400 hover:text-white transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>

      {error && (
        <span className="text-[11px] font-bold text-rose-400 animate-fadeIn mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
};
