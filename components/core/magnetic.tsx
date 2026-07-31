'use client';

import React, { useRef, useState, ReactNode } from 'react';
import { motion, SpringOptions } from 'framer-motion';

export interface MagneticProps {
  children: ReactNode;
  intensity?: number;
  range?: number;
  springOptions?: SpringOptions;
  className?: string;
}

export function Magnetic({
  children,
  intensity = 0.4,
  range = 100,
  springOptions = { stiffness: 150, damping: 15, mass: 0.1 },
  className = '',
}: MagneticProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    if (Math.hypot(distanceX, distanceY) < range) {
      setPosition({ x: distanceX * intensity, y: distanceY * intensity });
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', ...springOptions }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}
