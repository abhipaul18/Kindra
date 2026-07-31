'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';

export interface AnimatedGroupVariants {
  container?: Variants;
  item?: Variants;
}

export interface AnimatedGroupProps {
  children: React.ReactNode;
  className?: string;
  variants?: AnimatedGroupVariants;
  preset?: 'scale' | 'fade' | 'slide' | 'blur';
  delay?: number;
  stagger?: number;
}

const presetsMap: Record<string, { container: Variants; item: Variants }> = {
  scale: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12, delayChildren: 0.2 },
      },
    },
    item: {
      hidden: { opacity: 0, scale: 0.7 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 260, damping: 20 },
      },
    },
  },
  fade: {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
    },
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.5 } },
    },
  },
  slide: {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
    },
    item: {
      hidden: { opacity: 0, y: 40 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 },
      },
    },
  },
  blur: {
    container: {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
    },
    item: {
      hidden: { opacity: 0, filter: 'blur(12px)', y: -60, rotateX: 90 },
      visible: {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        rotateX: 0,
        transition: { type: 'spring', bounce: 0.3, duration: 1 },
      },
    },
  },
};

export function AnimatedGroup({
  children,
  className = '',
  variants,
  preset,
  delay,
  stagger,
}: AnimatedGroupProps) {
  const selectedPreset = preset ? presetsMap[preset] : null;
  const baseContainerVariants = variants?.container || selectedPreset?.container || presetsMap.blur.container;
  const itemVariants = variants?.item || selectedPreset?.item || presetsMap.blur.item;

  const containerVariants: Variants = {
    ...baseContainerVariants,
    visible: {
      ...(baseContainerVariants.visible as any),
      transition: {
        ...((baseContainerVariants.visible as any)?.transition || {}),
        ...(delay !== undefined ? { delayChildren: delay } : {}),
        ...(stagger !== undefined ? { staggerChildren: stagger } : {}),
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={containerVariants}
      className={className}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;
        return (
          <motion.div key={child.key || index} variants={itemVariants}>
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
