import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 1 | 2 | 3;
  accentBorder?: 'green' | 'blue' | 'amber' | 'none';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevation = 1,
  accentBorder = 'none',
  hoverable = false,
  className,
  ...props
}) => {
  const elevationStyles = {
    1: 'shadow-[0_2px_4px_rgba(0,82,204,0.08)] border border-outline-variant/30',
    2: 'shadow-[0_8px_16px_rgba(0,82,204,0.08)] border border-outline-variant/40',
    3: 'shadow-[0_24px_48px_rgba(0,82,204,0.12)] backdrop-blur-md border border-outline-variant/50',
  };

  const accentStyles = {
    none: '',
    green: 'border-l-4 border-l-secondary',
    blue: 'border-l-4 border-l-primary-container',
    amber: 'border-l-4 border-l-tertiary-fixed-dim',
  };

  const hoverStyles = hoverable
    ? 'transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,82,204,0.12)] cursor-pointer'
    : '';

  return (
    <div
      className={twMerge(
        clsx(
          'bg-surface-container-lowest text-on-surface rounded-xl p-md flex flex-col relative overflow-hidden',
          elevationStyles[elevation],
          accentStyles[accentBorder],
          hoverStyles,
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
