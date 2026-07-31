'use client';

import React from 'react';
import { motion, Transition } from 'framer-motion';

export interface GlowEffectProps {
  className?: string;
  colors?: string[];
  mode?: 'rotate' | 'pulse' | 'static' | 'colorShift' | 'flow' | 'breathe';
  blur?: 'soft' | 'medium' | 'strong' | number;
  duration?: number;
  scale?: number;
}

export function GlowEffect({
  className = '',
  colors = ['#0894FF', '#C959DD', '#FF2E54', '#FF9004'],
  mode = 'rotate',
  blur = 'medium',
  duration = 5,
  scale = 1.05,
}: GlowEffectProps) {
  const getBlurClass = () => {
    if (typeof blur === 'number') return `blur-[${blur}px]`;
    switch (blur) {
      case 'soft':
        return 'blur-md';
      case 'strong':
        return 'blur-2xl';
      case 'medium':
      default:
        return 'blur-xl';
    }
  };

  const gradientString = `linear-gradient(90deg, ${colors.join(', ')})`;

  const transition: Transition = {
    repeat: Infinity,
    duration: duration,
    ease: 'linear',
  };

  return (
    <div className={`pointer-events-none absolute -inset-1 rounded-[inherit] overflow-hidden ${getBlurClass()} ${className}`}>
      <motion.div
        className="h-full w-full rounded-[inherit] opacity-75"
        style={{
          background: gradientString,
          backgroundSize: mode === 'rotate' || mode === 'flow' ? '300% 300%' : '100% 100%',
        }}
        animate={
          mode === 'pulse'
            ? { opacity: [0.3, 0.8, 0.3], scale: [0.98, scale, 0.98] }
            : mode === 'rotate' || mode === 'flow'
            ? { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }
            : { opacity: [0.5, 0.7, 0.5] }
        }
        transition={transition}
      />
    </div>
  );
}
