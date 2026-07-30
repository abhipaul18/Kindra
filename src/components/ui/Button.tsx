import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string; // Material symbols icon name
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px]';

  const variantStyles = {
    primary: 'bg-primary-container text-on-primary hover:bg-primary hover:shadow-md focus:ring-primary-container active:scale-[0.98]',
    secondary: 'bg-secondary text-on-secondary hover:bg-secondary/90 hover:shadow-md focus:ring-secondary active:scale-[0.98]',
    outline: 'border border-outline text-primary hover:bg-surface-container-low focus:ring-primary',
    ghost: 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface focus:ring-outline',
    danger: 'bg-error text-on-error hover:bg-error/90 focus:ring-error',
  };

  const sizeStyles = {
    sm: 'text-sm px-3 py-1.5 rounded-md gap-1.5',
    md: 'text-base px-5 py-2.5 rounded-lg gap-2',
    lg: 'text-lg px-6 py-3 rounded-xl gap-2.5 font-semibold',
  };

  return (
    <button
      className={twMerge(clsx(baseStyles, variantStyles[variant], sizeStyles[size], className))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="material-symbols-outlined text-xl">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="material-symbols-outlined text-xl">{icon}</span>
          )}
        </>
      )}
    </button>
  );
};
