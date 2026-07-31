'use client';

import React, { useState, useId } from 'react';
import { motion, AnimatePresence, Transition } from 'framer-motion';

export interface AnimatedBackgroundProps {
  children: React.ReactNode;
  defaultValue?: string;
  onValueChange?: (newVal: string | null) => void;
  className?: string;
  transition?: Transition;
  enableHover?: boolean;
}

export function AnimatedBackground({
  children,
  defaultValue,
  onValueChange,
  className = '',
  transition = {
    type: 'spring',
    bounce: 0.2,
    duration: 0.6,
  },
  enableHover = false,
}: AnimatedBackgroundProps) {
  const [activeId, setActiveId] = useState<string | null>(defaultValue || null);
  const uniqueId = useId();

  const handleSetActive = (id: string | null) => {
    setActiveId(id);
    onValueChange?.(id);
  };

  return (
    <AnimatePresence>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        const element = child as React.ReactElement<any>;
        const id = element.props['data-id'] || String(element.key);

        return React.cloneElement(element, {
          className: `relative ${element.props.className || ''}`,
          onMouseEnter: () => {
            if (enableHover) handleSetActive(id);
            element.props.onMouseEnter?.();
          },
          onMouseLeave: () => {
            if (enableHover) handleSetActive(null);
            element.props.onMouseLeave?.();
          },
          children: (
            <>
              {activeId === id && (
                <motion.div
                  layoutId={`background-${uniqueId}`}
                  className={`absolute -inset-1 rounded-3xl -z-10 ${className}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={transition}
                />
              )}
              {element.props.children}
            </>
          ),
        });
      })}
    </AnimatePresence>
  );
}
