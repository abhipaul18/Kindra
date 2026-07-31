'use client';

import React from 'react';
import { motion, Transition } from 'framer-motion';

export interface BorderTrailProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  style?: React.CSSProperties;
  transition?: Transition;
}

export function BorderTrail({
  className = '',
  size = 80,
  duration = 6,
  delay = 0,
  style,
  transition,
}: BorderTrailProps) {
  const defaultTransition: Transition = {
    repeat: Infinity,
    duration: duration,
    delay: delay,
    ease: 'linear',
  };

  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
      <motion.div
        className={`absolute aspect-square bg-gradient-to-r from-primary via-secondary to-amber-500 rounded-full ${className}`}
        style={{
          width: `${size}px`,
          offsetPath: `rect(0 auto auto 0 round 16px)`,
          ...style,
        }}
        animate={{
          offsetDistance: ['0%', '100%'],
        }}
        transition={transition || defaultTransition}
      />
    </div>
  );
}
