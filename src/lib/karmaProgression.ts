export interface LevelDefinition {
  level: number;
  title: string;
  minKarma: number;
  maxKarma: number | null; // null for max level (15000+)
  badgeIcon: string;
  color: string;
}

export const LEVEL_CONFIG: readonly LevelDefinition[] = [
  { level: 1, title: 'Civic Beginner', minKarma: 0, maxKarma: 250, badgeIcon: 'eco', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  { level: 2, title: 'Civic Advocate', minKarma: 250, maxKarma: 500, badgeIcon: 'volunteer_activism', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
  { level: 3, title: 'Community Hero', minKarma: 500, maxKarma: 1000, badgeIcon: 'stars', color: 'text-teal-500 bg-teal-500/10 border-teal-500/20' },
  { level: 4, title: 'Civic Champion', minKarma: 1000, maxKarma: 2000, badgeIcon: 'military_tech', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
  { level: 5, title: 'Impact Leader', minKarma: 2000, maxKarma: 3500, badgeIcon: 'shield', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  { level: 6, title: 'Change Maker', minKarma: 3500, maxKarma: 5000, badgeIcon: 'workspace_premium', color: 'text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20' },
  { level: 7, title: 'Guardian of Good', minKarma: 5000, maxKarma: 7500, badgeIcon: 'health_and_safety', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
  { level: 8, title: 'Civic Legend', minKarma: 7500, maxKarma: 10000, badgeIcon: 'crown', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
  { level: 9, title: 'National Hero', minKarma: 10000, maxKarma: 15000, badgeIcon: 'local_fire_department', color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' },
  { level: 10, title: 'KINDRA Ambassador', minKarma: 15000, maxKarma: null, badgeIcon: 'trophy', color: 'text-yellow-400 bg-yellow-400/20 border-yellow-400/40' },
];

export interface KarmaLevelInfo {
  level: number;
  title: string;
  minimum: number;
  maximum: number | null;
  currentXP: number;
  requiredXP: number;
  remainingXP: number;
  progressPercentage: number;
  isMaxLevel: boolean;
  badgeIcon: string;
  color: string;
}

/**
 * Calculates current level, intra-level XP progress, percentage, and remaining XP
 * dynamically from total Karma points (profiles.karma_points).
 * 
 * Source of truth: Total Karma stored in database.
 */
export function getLevelFromKarma(karmaPoints: number | null | undefined): KarmaLevelInfo {
  const safeKarma = Math.max(0, Math.floor(karmaPoints || 0));

  // Find matching level config (highest minKarma <= safeKarma)
  let matchedIndex = LEVEL_CONFIG.length - 1;
  for (let i = 0; i < LEVEL_CONFIG.length; i++) {
    const config = LEVEL_CONFIG[i];
    if (config.maxKarma === null) {
      if (safeKarma >= config.minKarma) {
        matchedIndex = i;
        break;
      }
    } else if (safeKarma >= config.minKarma && safeKarma < config.maxKarma) {
      matchedIndex = i;
      break;
    }
  }

  const currentConfig = LEVEL_CONFIG[matchedIndex];
  const isMaxLevel = currentConfig.maxKarma === null;

  if (isMaxLevel) {
    const currentXP = safeKarma - currentConfig.minKarma;
    return {
      level: currentConfig.level,
      title: currentConfig.title,
      minimum: currentConfig.minKarma,
      maximum: null,
      currentXP,
      requiredXP: 0,
      remainingXP: 0,
      progressPercentage: 100,
      isMaxLevel: true,
      badgeIcon: currentConfig.badgeIcon,
      color: currentConfig.color,
    };
  }

  const minimum = currentConfig.minKarma;
  const maximum = currentConfig.maxKarma!;
  const currentXP = safeKarma - minimum;
  const requiredXP = maximum - minimum;
  const remainingXP = Math.max(0, maximum - safeKarma);
  const rawPercentage = (currentXP / requiredXP) * 100;
  const progressPercentage = Math.min(100, Math.max(0, Math.round(rawPercentage)));

  return {
    level: currentConfig.level,
    title: currentConfig.title,
    minimum,
    maximum,
    currentXP,
    requiredXP,
    remainingXP,
    progressPercentage,
    isMaxLevel: false,
    badgeIcon: currentConfig.badgeIcon,
    color: currentConfig.color,
  };
}
