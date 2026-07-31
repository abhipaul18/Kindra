'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';

export interface TextEffectProps {
  children: string;
  per?: 'char' | 'word' | 'line';
  as?: React.ElementType;
  preset?: 'fade' | 'slide' | 'scale' | 'blur' | 'bounce';
  className?: string;
  segmentClassName?: string;
  delay?: number;
  variants?: Variants;
}

const defaultPresets: Record<string, { container: Variants; item: Variants }> = {
  slide: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
      },
    },
    item: {
      hidden: { opacity: 0, y: 24 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 },
      },
    },
  },
  fade: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.1 },
      },
    },
    item: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
  },
  blur: {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.06, delayChildren: 0.1 },
      },
    },
    item: {
      hidden: { opacity: 0, filter: 'blur(10px)', y: 10 },
      visible: { opacity: 1, filter: 'blur(0px)', y: 0 },
    },
  },
};

export function TextEffect({
  children,
  per = 'word',
  as: Component = 'span',
  preset = 'slide',
  className = '',
  segmentClassName = '',
  delay = 0.1,
  variants,
}: TextEffectProps) {
  const selectedPreset = defaultPresets[preset] || defaultPresets.slide;
  const baseContainer = variants || selectedPreset.container;
  const itemVariants = selectedPreset.item;

  const containerVariants: Variants = {
    ...baseContainer,
    visible: {
      ...(baseContainer.visible as any),
      transition: {
        ...((baseContainer.visible as any)?.transition || {}),
        delayChildren: delay,
      },
    },
  };

  const text = String(children);
  const units = per === 'char' ? text.split('') : per === 'word' ? text.split(' ') : [text];

  const MotionTag = motion.create(Component as any);

  return (
    <MotionTag
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`inline-flex flex-wrap gap-[0.25em] ${className}`}
    >
      {units.map((unit, index) => (
        <motion.span
          key={index}
          variants={itemVariants}
          className={`inline-block ${segmentClassName}`}
        >
          {unit === ' ' ? '\u00A0' : unit}
        </motion.span>
      ))}
    </MotionTag>
  );
}
