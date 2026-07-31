'use client';
import { motion, useSpring, useTransform, type SpringOptions } from 'framer-motion';
import { useEffect } from 'react';

export type AnimatedNumberProps = {
  value: number;
  className?: string;
  springOptions?: SpringOptions;
};

export function AnimatedNumber({
  value,
  className,
  springOptions,
}: AnimatedNumberProps) {
  // Initialize spring at 0 so it animates from 0 up to target value over duration
  const spring = useSpring(0, springOptions || { duration: 2000, bounce: 0 });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className={className}>{display}</motion.span>;
}
