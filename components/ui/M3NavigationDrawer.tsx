'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: number;
}

export interface M3NavigationDrawerProps {
  navItems: NavItem[];
  currentPath: string;
  accentColor?: 'primary' | 'emerald' | 'blue' | 'amber' | 'red';
  onItemClick?: () => void;
  className?: string;
}

/**
 * Material Design 3 (M3) Standard Navigation Drawer Component.
 * Implements a single M3 active pill indicator (rounded-full), filled active icons,
 * M3 typography, and crisp theme colors without dark color overlays.
 */
export function M3NavigationDrawer({
  navItems,
  currentPath,
  accentColor = 'blue',
  onItemClick,
  className = '',
}: M3NavigationDrawerProps) {
  // Theme variants for role-based portals matching M3 design tokens
  const colorStyles = {
    primary: {
      activePill: 'bg-blue-500/15 border border-blue-500/25',
      textActive: 'text-blue-900 dark:text-blue-200 font-extrabold',
      iconActive: 'text-blue-700 dark:text-blue-400 font-bold',
      hoverBg: 'hover:bg-surface-container-high/60 hover:text-on-surface',
    },
    emerald: {
      activePill: 'bg-emerald-500/15 border border-emerald-500/20',
      textActive: 'text-emerald-800 dark:text-emerald-300 font-black',
      iconActive: 'text-emerald-700 dark:text-emerald-400 font-bold',
      hoverBg: 'hover:bg-surface-container-high/60 hover:text-on-surface',
    },
    blue: {
      activePill: 'bg-blue-500/15 border border-blue-500/25',
      textActive: 'text-blue-900 dark:text-blue-200 font-extrabold',
      iconActive: 'text-blue-700 dark:text-blue-400 font-bold',
      hoverBg: 'hover:bg-surface-container-high/60 hover:text-on-surface',
    },
    amber: {
      activePill: 'bg-amber-500/15 border border-amber-500/20',
      textActive: 'text-amber-700 dark:text-amber-300 font-black',
      iconActive: 'text-amber-600 dark:text-amber-400 font-bold',
      hoverBg: 'hover:bg-surface-container-high/60 hover:text-on-surface',
    },
    red: {
      activePill: 'bg-red-500/15 border border-red-500/20',
      textActive: 'text-red-700 dark:text-red-300 font-black',
      iconActive: 'text-red-600 dark:text-red-400 font-bold',
      hoverBg: 'hover:bg-surface-container-high/60 hover:text-on-surface',
    },
  }[accentColor];

  return (
    <nav className={`flex flex-col gap-1 w-full ${className}`}>
      {navItems.map((item) => {
        const isActive = currentPath === item.path;

        return (
          <Link
            key={item.path}
            href={item.path}
            onClick={onItemClick}
            className={`group relative flex items-center justify-between px-4 py-3 rounded-full text-sm transition-colors duration-150 cursor-pointer select-none ${
              isActive
                ? `${colorStyles.textActive}`
                : `text-on-surface-variant font-medium ${colorStyles.hoverBg}`
            }`}
          >
            {/* Single Active Pill Background */}
            {isActive && (
              <motion.div
                layoutId={`m3-active-pill-${accentColor}`}
                className={`absolute inset-0 rounded-full ${colorStyles.activePill} pointer-events-none z-0`}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}

            <div className="flex items-center gap-3.5 z-10 relative">
              <span
                className={`material-symbols-outlined text-xl transition-transform group-hover:scale-105 ${
                  isActive ? colorStyles.iconActive : 'text-on-surface-variant group-hover:text-on-surface'
                }`}
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400",
                }}
              >
                {item.icon}
              </span>
              <span className="truncate">{item.label}</span>
            </div>

            {/* M3 Badge */}
            {item.badge !== undefined && item.badge > 0 && (
              <span className="z-10 relative bg-error text-on-error px-2.5 py-0.5 rounded-full text-xs font-bold shadow-2xs">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default M3NavigationDrawer;
