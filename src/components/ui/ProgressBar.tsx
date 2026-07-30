import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ProgressBarProps {
  value: number; // 0 - 100
  color?: 'green' | 'blue' | 'amber';
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'green',
  label,
  showPercentage = true,
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, value));

  const colorStyles = {
    green: 'bg-secondary',
    blue: 'bg-primary-container',
    amber: 'bg-tertiary-fixed-dim',
  };

  return (
    <div className={twMerge('flex flex-col gap-1.5 w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-semibold text-on-surface-variant">
          {label && <span>{label}</span>}
          {showPercentage && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
        <div
          className={clsx('h-full transition-all duration-500 rounded-full', colorStyles[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
