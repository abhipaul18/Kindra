'use client';

import React from 'react';
import { handleGemmaApiError, UserFriendlyApiError } from '@/src/lib/gemma/gemmaApiErrorHandler';

interface Props {
  errorInput: any;
  rawResponseBody?: any;
  onRetry?: () => void;
  onClose?: () => void;
  onLearnMore?: () => void;
  className?: string;
}

export default function GemmaApiErrorCard({
  errorInput,
  rawResponseBody,
  onRetry,
  onClose,
  onLearnMore,
  className = '',
}: Props) {
  const mappedError: UserFriendlyApiError = handleGemmaApiError(errorInput, rawResponseBody);

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 md:p-8 text-center bg-surface-container-high/60 backdrop-blur-md rounded-2xl border border-outline-variant/40 shadow-xl max-w-md mx-auto my-4 transition-all duration-300 animate-fade-in ${className}`}
    >
      {/* Icon Badge */}
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 dark:bg-amber-400/20 dark:text-amber-300 flex items-center justify-center mb-4 border border-amber-500/30 shadow-inner">
        <span className="material-symbols-outlined text-3xl">
          {mappedError.iconName || 'warning'}
        </span>
      </div>

      {/* Friendly Title & Message */}
      <h3 className="font-extrabold text-lg md:text-xl text-on-surface tracking-tight mb-2">
        {mappedError.title}
      </h3>
      <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed max-w-sm mb-6">
        {mappedError.message}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 min-w-[120px] px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm bg-primary text-on-primary hover:opacity-90 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            {mappedError.primaryActionLabel || 'Retry'}
          </button>
        )}

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm bg-surface-container-highest/80 text-on-surface-variant hover:bg-surface-container-highest active:scale-95 transition-all border border-outline-variant/30 flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">close</span>
            {mappedError.secondaryActionLabel || 'Close'}
          </button>
        )}

        {onLearnMore && (
          <button
            type="button"
            onClick={onLearnMore}
            className="w-full text-[11px] font-bold text-primary hover:underline pt-1 text-center"
          >
            Learn More
          </button>
        )}
      </div>
    </div>
  );
}
