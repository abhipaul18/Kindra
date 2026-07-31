'use client';

import React, { Children, useEffect, useState, ReactNode } from 'react';
import { motion, AnimatePresence, Transition, Variants } from 'framer-motion';

export interface TextLoopProps {
  children: ReactNode[];
  className?: string;
  interval?: number;
  transition?: Transition;
  variants?: Variants;
  onIndexChange?: (index: number) => void;
  trigger?: boolean;
}

export function TextLoop({
  children,
  className = '',
  interval = 3.5,
  transition = { duration: 0.45, ease: [0.32, 0.72, 0, 1] },
  variants,
  onIndexChange,
  trigger = true,
}: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Children.toArray(children);

  useEffect(() => {
    if (!trigger || items.length === 0) return;

    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % items.length;
        onIndexChange?.(nextIndex);
        return nextIndex;
      });
    }, interval * 1000);

    return () => clearInterval(intervalId);
  }, [items.length, interval, trigger, onIndexChange]);

  const defaultVariants: Variants = {
    initial: { y: 24, opacity: 0, filter: 'blur(6px)' },
    animate: { y: 0, opacity: 1, filter: 'blur(0px)' },
    exit: { y: -24, opacity: 0, filter: 'blur(6px)' },
  };

  return (
    <div className={`relative inline-block overflow-hidden ${className}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={currentIndex}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          variants={variants || defaultVariants}
        >
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
