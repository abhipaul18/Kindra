'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { getLevelFromKarma } from '@/src/lib/karmaProgression';
import { ProgressBar } from '@/src/components/ui/ProgressBar';
import { AnimatedNumber } from '@/components/core/animated-number';

interface LevelProgressCardProps {
  karma: number;
  className?: string;
  compact?: boolean;
}

/**
 * Reusable Level Progress Card component.
 * Automatically derives Level, Title, XP in current level, Required XP, Progress %,
 * and Remaining XP from profiles.karma_points using getLevelFromKarma().
 */
export function LevelProgressCard({ karma, className = '', compact = false }: LevelProgressCardProps) {
  const levelInfo = getLevelFromKarma(karma);

  if (compact) {
    return (
      <div className={`flex flex-col gap-1.5 bg-surface/90 p-3 rounded-xl border border-outline-variant/30 backdrop-blur-sm ${className}`}>
        <div className="flex items-center justify-between text-xs font-bold text-on-surface">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-secondary">{levelInfo.badgeIcon}</span>
            <span>Level {levelInfo.level} {levelInfo.title}</span>
          </div>
          {levelInfo.isMaxLevel ? (
            <span className="text-amber-400 font-extrabold text-[11px] flex items-center gap-1">
              🏆 MAX LEVEL
            </span>
          ) : (
            <span className="text-secondary font-extrabold">
              <AnimatedNumber value={levelInfo.currentXP} springOptions={{ bounce: 0, duration: 2000 }} /> / {levelInfo.requiredXP} XP
            </span>
          )}
        </div>

        {!levelInfo.isMaxLevel && (
          <ProgressBar value={levelInfo.progressPercentage} color="green" showPercentage={false} />
        )}

        <div className="flex justify-between items-center text-[10px] font-medium text-on-surface-variant">
          {levelInfo.isMaxLevel ? (
            <span className="text-amber-400 font-extrabold">🏆 Maximum Level Achieved</span>
          ) : (
            <>
              <span>Earn {levelInfo.remainingXP} more Karma to reach Level {levelInfo.level + 1}</span>
              <span className="font-bold text-secondary">{levelInfo.progressPercentage}%</span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden bg-gradient-to-br from-surface-container-lowest via-surface to-primary-container/10 border border-outline-variant/30 p-5 rounded-2xl shadow-sm ${className}`}
    >
      {/* Decorative background glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-secondary/10 blur-2xl pointer-events-none" />

      <div className="flex flex-col gap-3 relative z-10">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border font-bold shadow-sm ${levelInfo.color}`}>
              <span className="material-symbols-outlined text-2xl">{levelInfo.badgeIcon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-secondary bg-secondary-container/30 px-2 py-0.5 rounded-md border border-secondary/30">
                  Level {levelInfo.level}
                </span>
                <h3 className="font-black text-base text-on-surface">{levelInfo.title}</h3>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Total Karma: <span className="font-extrabold text-on-surface"><AnimatedNumber value={karma} springOptions={{ bounce: 0, duration: 2000 }} /></span> XP
              </p>
            </div>
          </div>

          {/* XP Fraction or Max Badge */}
          <div className="text-right sm:self-center">
            {levelInfo.isMaxLevel ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400/20 text-amber-500 border border-amber-400/40 shadow-sm">
                <span>🏆</span> MAX LEVEL
              </span>
            ) : (
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-secondary">
                  <AnimatedNumber value={levelInfo.currentXP} springOptions={{ bounce: 0, duration: 2000 }} /> <span className="text-xs font-bold text-on-surface-variant">/ {levelInfo.requiredXP} XP</span>
                </span>
                <span className="text-[10px] font-bold text-on-surface-variant">
                  {levelInfo.progressPercentage}% Complete
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar or Max Level Banner */}
        {levelInfo.isMaxLevel ? (
          <div className="mt-1 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center gap-2 text-xs font-black text-amber-600 dark:text-amber-300">
            <span className="material-symbols-outlined text-lg">workspace_premium</span>
            <span>🏆 Maximum Level Achieved! You are a KINDRA Ambassador.</span>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 mt-1">
            <div className="relative h-3 w-full bg-surface-container-high rounded-full overflow-hidden border border-outline-variant/20">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.progressPercentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 rounded-full shadow-md shadow-emerald-500/20"
              />
            </div>

            <div className="flex justify-between items-center text-xs font-medium text-on-surface-variant">
              <span>Earn <strong className="text-on-surface font-extrabold">{levelInfo.remainingXP}</strong> more Karma to reach Level {levelInfo.level + 1}</span>
              <span className="text-[11px] font-bold text-secondary">{levelInfo.progressPercentage}%</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default LevelProgressCard;
