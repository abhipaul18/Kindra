import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'amber' | 'neutral' | 'error';
  icon?: string;
  onRemove?: () => void;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'primary',
  icon,
  onRemove,
  className,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-primary-fixed text-on-primary-fixed-variant border border-primary-fixed-dim/40',
    secondary: 'bg-secondary-container/30 text-on-secondary-container border border-secondary/20',
    amber: 'bg-tertiary-fixed text-on-tertiary-fixed-variant border border-tertiary-fixed-dim/40',
    neutral: 'bg-surface-container-high text-on-surface-variant border border-outline-variant',
    error: 'bg-error-container text-on-error-container border border-error/20',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-colors',
          variantStyles[variant],
          className
        )
      )}
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-sm">{icon}</span>}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:opacity-75 focus:outline-none p-0.5 rounded-full"
        >
          <span className="material-symbols-outlined text-xs">close</span>
        </button>
      )}
    </span>
  );
};
