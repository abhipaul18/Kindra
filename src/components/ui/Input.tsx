import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-sm font-medium text-on-surface-variant flex items-center justify-between">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-xl pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={twMerge(
              clsx(
                'w-full bg-surface-container-lowest text-on-surface placeholder:text-outline border border-outline-variant rounded-lg px-4 py-2.5 text-base transition-all duration-200 focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 disabled:bg-surface-container-low disabled:cursor-not-allowed',
                icon && 'pl-11',
                error && 'border-error focus:border-error focus:ring-error/20',
                className
              )
            )}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-error font-medium">{error}</span>}
        {helperText && !error && <span className="text-xs text-on-surface-variant">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
