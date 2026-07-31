'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface InfiniteSliderProps {
  children: React.ReactNode;
  gap?: number;
  duration?: number;
  durationOnHover?: number;
  direction?: 'horizontal' | 'vertical';
  reverse?: boolean;
  className?: string;
}

export function InfiniteSlider({
  children,
  gap = 24,
  duration = 30,
  durationOnHover,
  direction = 'horizontal',
  reverse = false,
  className = '',
}: InfiniteSliderProps) {
  const [isHovered, setIsHovered] = useState(false);

  const currentDuration = isHovered && durationOnHover ? durationOnHover : duration;

  return (
    <div
      className={`overflow-hidden select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className={`flex ${direction === 'vertical' ? 'flex-col' : 'flex-row'} w-max`}
        style={{ gap: `${gap}px` }}
        animate={{
          x: direction === 'horizontal' ? (reverse ? [0, -1000] : [-1000, 0]) : 0,
          y: direction === 'vertical' ? (reverse ? [0, -1000] : [-1000, 0]) : 0,
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: currentDuration,
            ease: 'linear',
          },
          y: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: currentDuration,
            ease: 'linear',
          },
        }}
      >
        {children}
        {children}
        {children}
        {children}
      </motion.div>
    </div>
  );
}
