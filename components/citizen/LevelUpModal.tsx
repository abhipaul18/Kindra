'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLevelFromKarma, type KarmaLevelInfo } from '@/src/lib/karmaProgression';
import { supabase } from '@/src/lib/supabase';

interface LevelUpModalProps {
  karma: number;
  userId?: string;
  onDismiss?: () => void;
}

/**
 * Level Up Celebration Modal.
 * Detects when current level > last_level_seen (stored in localStorage per user).
 * Displays celebratory modal with badge glow, confetti, and animated XP fill.
 * Persists last_level_seen and updates profiles.rank_title in database.
 * Never re-shows for the same level after page refresh.
 */
export function LevelUpModal({ karma, userId, onDismiss }: LevelUpModalProps) {
  const [levelInfo, setLevelInfo] = useState<KarmaLevelInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!karma || karma <= 0) return;

    const currentInfo = getLevelFromKarma(karma);
    const storageKey = userId ? `kindra_last_level_seen_${userId}` : 'kindra_last_level_seen_guest';
    const storedLevelStr = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    const lastLevelSeen = storedLevelStr ? parseInt(storedLevelStr, 10) : 1;

    // Check if user has leveled up (current level > last level seen)
    if (currentInfo.level > lastLevelSeen) {
      setLevelInfo(currentInfo);
      setIsOpen(true);

      // Persist last_level_seen immediately so it never shows again on refresh
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, currentInfo.level.toString());
      }

      // Sync rank_title in DB profiles table for leaderboard consistency
      if (userId) {
        supabase
          .from('profiles')
          .update({ rank_title: currentInfo.title })
          .eq('id', userId)
          .then(({ error }) => {
            if (error) {
              console.warn('[LevelUpModal] Error syncing rank_title to profiles:', error);
            }
          });
      }
    }
  }, [karma, userId]);

  const handleClose = () => {
    setIsOpen(false);
    if (onDismiss) onDismiss();
  };

  return (
    <AnimatePresence>
      {isOpen && levelInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 cursor-pointer"
          onClick={handleClose}
        >
          {/* Confetti Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-[-10px] rounded-full animate-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  backgroundColor: ['#10b981', '#f59e0b', '#6366f1', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6'][i % 7],
                  width: `${6 + Math.random() * 6}px`,
                  height: `${6 + Math.random() * 6}px`,
                }}
              />
            ))}
          </div>

          {/* Main Card */}
          <motion.div
            initial={{ scale: 0.5, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 14, stiffness: 250 }}
            className="relative flex flex-col items-center gap-4 text-center p-8 bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl max-w-sm w-full cursor-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Glowing Badge Icon */}
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl animate-pulse" />
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.2 }}
                className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/50 border-4 border-slate-900"
              >
                <span className="material-symbols-outlined text-5xl">{levelInfo.badgeIcon}</span>
              </motion.div>
            </div>

            {/* Header Text */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-1"
            >
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                🎉 LEVEL UP!
              </span>
              <h2 className="text-3xl font-black text-white">Level {levelInfo.level}</h2>
              <p className="text-base font-bold text-emerald-300">{levelInfo.title}</p>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs text-slate-300 leading-relaxed"
            >
              Congratulations! Your civic contributions have unlocked a new rank. Keep making kindness count!
            </motion.p>

            {/* Action Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={handleClose}
              className="mt-2 w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              Claim & Continue
            </motion.button>
          </motion.div>

          <style jsx>{`
            @keyframes fall {
              0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
            .animate-fall {
              animation: fall linear forwards;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LevelUpModal;
