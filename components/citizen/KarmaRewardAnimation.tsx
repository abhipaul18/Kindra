'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface KarmaRewardAnimationProps {
  show: boolean;
  karmaAwarded: number;
  previousKarma: number;
  newKarma: number;
  missionName: string;
  onDismiss: () => void;
}

/**
 * Full-screen animated overlay for Karma reward celebration.
 * Shows: verified badge, animated counter, XP bar fill, coin burst + confetti.
 * Auto-dismisses after 5 seconds.
 */
export default function KarmaRewardAnimation({
  show,
  karmaAwarded,
  previousKarma,
  newKarma,
  missionName,
  onDismiss,
}: KarmaRewardAnimationProps) {
  const [displayKarma, setDisplayKarma] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (!show) {
      setDisplayKarma(0);
      setShowDetails(false);
      return;
    }

    // Animate counter from 0 to karmaAwarded
    const duration = 1500;
    const steps = 30;
    const increment = karmaAwarded / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), karmaAwarded);
      setDisplayKarma(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayKarma(karmaAwarded);
        setTimeout(() => setShowDetails(true), 300);
      }
    }, duration / steps);

    // Auto-dismiss after 5 seconds
    const autoDismiss = setTimeout(onDismiss, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(autoDismiss);
    };
  }, [show, karmaAwarded, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md cursor-pointer"
          onClick={onDismiss}
        >
          {/* Confetti Particles */}
          <div className="karma-confetti-container">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="karma-confetti-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  backgroundColor: ['#10b981', '#f59e0b', '#6366f1', '#ef4444', '#3b82f6', '#ec4899'][i % 6],
                  width: `${4 + Math.random() * 6}px`,
                  height: `${4 + Math.random() * 6}px`,
                }}
              />
            ))}
          </div>

          {/* Main Content */}
          <motion.div
            initial={{ scale: 0.5, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className="relative flex flex-col items-center gap-4 text-center px-8 py-10 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Verified Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/50"
            >
              <span className="material-symbols-outlined text-4xl">verified</span>
            </motion.div>

            {/* Mission Verified Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-black text-white">Mission Verified!</h2>
              <p className="text-sm text-emerald-300 font-semibold mt-1">{missionName}</p>
            </motion.div>

            {/* Karma Counter */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: 'spring', damping: 12 }}
              className="flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-yellow-400 text-3xl karma-coin-spin">stars</span>
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-emerald-400 to-cyan-400">
                +{displayKarma}
              </span>
              <span className="text-lg font-bold text-yellow-300/80">Karma</span>
            </motion.div>

            {/* XP Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="w-full max-w-xs"
            >
              <div className="flex justify-between text-xs font-bold text-white/60 mb-1">
                <span>{previousKarma} XP</span>
                <span>{newKarma} XP</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 1.2, duration: 1, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-emerald-500 via-yellow-400 to-emerald-400 rounded-full shadow-lg shadow-emerald-500/40"
                />
              </div>
            </motion.div>

            {/* Details */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 mt-2"
                >
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 text-center">
                    <span className="text-[10px] text-white/50 font-bold block">Previous</span>
                    <span className="text-sm font-black text-white">{previousKarma}</span>
                  </div>
                  <div className="bg-emerald-500/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-emerald-500/30 text-center">
                    <span className="text-[10px] text-emerald-300 font-bold block">New Total</span>
                    <span className="text-sm font-black text-emerald-300">{newKarma}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dismiss hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="text-xs text-white/30 mt-2"
            >
              Tap anywhere to continue
            </motion.p>
          </motion.div>

          {/* Coin Burst Particles */}
          <div className="karma-coin-burst">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={`coin-${i}`}
                initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                animate={{
                  scale: [0, 1, 0.5],
                  x: Math.cos((i * 30 * Math.PI) / 180) * 120,
                  y: Math.sin((i * 30 * Math.PI) / 180) * 120 - 40,
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 1.5, delay: 0.8, ease: 'easeOut' }}
                className="absolute w-4 h-4 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50"
                style={{
                  top: '50%',
                  left: '50%',
                }}
              />
            ))}
          </div>

          {/* CSS Animations */}
          <style jsx>{`
            .karma-confetti-container {
              position: absolute;
              inset: 0;
              overflow: hidden;
              pointer-events: none;
            }
            .karma-confetti-particle {
              position: absolute;
              top: -10px;
              border-radius: 2px;
              animation: karma-confetti-fall linear forwards;
              opacity: 0.8;
            }
            @keyframes karma-confetti-fall {
              0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
              100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
            }
            .karma-coin-spin {
              animation: karma-spin 2s linear infinite;
            }
            @keyframes karma-spin {
              0% { transform: rotateY(0deg); }
              100% { transform: rotateY(360deg); }
            }
            .karma-coin-burst {
              position: absolute;
              pointer-events: none;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
