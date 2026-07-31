'use client';

import React from 'react';
import { motion, useScroll, useSpring, SpringOptions } from 'framer-motion';

export interface ScrollProgressProps {
  className?: string;
  containerRef?: React.RefObject<HTMLElement | null>;
  springOptions?: SpringOptions;
}

export function ScrollProgress({
  className = '',
  containerRef,
  springOptions = {
    stiffness: 280,
    damping: 18,
    mass: 0.3,
  },
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll(
    containerRef ? { container: containerRef } : {}
  );

  const scaleX = useSpring(scrollYProgress, springOptions);

  return (
    <motion.div
      className={`origin-left ${className}`}
      style={{ scaleX }}
    />
  );
}
