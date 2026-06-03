/**
 * @fileoverview TrophyEngine — Trophy tiers, unlocking, and progress tracking
 */

export const TROPHY_TIERS = [
  {
    id: 'bronze',
    name: 'Bronze Champion',
    emoji: '🥉',
    color: '#cd7f32',
    gradient: 'linear-gradient(135deg, #cd7f32, #e8a854)',
    requirement: 'Win 1 match',
    requiredWins: 1,
    check: (stats) => stats.wins >= 1,
    glowColor: 'rgba(205, 127, 50, 0.3)',
  },
  {
    id: 'silver',
    name: 'Silver Champion',
    emoji: '🥈',
    color: '#c0c0d2',
    gradient: 'linear-gradient(135deg, #a8a8c0, #d4d4e8)',
    requirement: 'Win 3 matches',
    requiredWins: 3,
    check: (stats) => stats.wins >= 3,
    glowColor: 'rgba(192, 192, 210, 0.3)',
  },
  {
    id: 'gold',
    name: 'Gold Champion',
    emoji: '🥇',
    color: '#ffd700',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    requirement: 'Win 5 matches with 80%+ accuracy',
    requiredWins: 5,
    check: (stats) => stats.wins >= 5 && (stats.accuracy || 0) >= 80,
    glowColor: 'rgba(255, 215, 0, 0.4)',
  },
  {
    id: 'platinum',
    name: 'Platinum Champion',
    emoji: '💎',
    color: '#7c3aed',
    gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
    requirement: 'Win 10 matches with no violations',
    requiredWins: 10,
    check: (stats) => stats.wins >= 10 && (stats.totalViolations || 0) === 0,
    glowColor: 'rgba(124, 58, 237, 0.4)',
  },
  {
    id: 'diamond',
    name: 'Diamond Champion',
    emoji: '💠',
    color: '#06b6d4',
    gradient: 'linear-gradient(135deg, #06b6d4, #22d3ee)',
    requirement: 'Win 20 matches with fast responses',
    requiredWins: 20,
    check: (stats) => stats.wins >= 20 && (stats.avgResponseTime || 30) <= 15,
    glowColor: 'rgba(6, 182, 212, 0.4)',
  },
  {
    id: 'legendary',
    name: 'Legendary Champion',
    emoji: '🏆',
    color: '#f43f5e',
    gradient: 'linear-gradient(135deg, #f43f5e, #fb7185)',
    requirement: 'Win 50 matches — ultimate legend',
    requiredWins: 50,
    check: (stats) => stats.wins >= 50,
    glowColor: 'rgba(244, 63, 94, 0.5)',
  },
];

/**
 * Get all unlocked trophies for given stats
 */
export function getUnlockedTrophies(stats) {
  return TROPHY_TIERS.filter(t => t.check(stats));
}

/**
 * Get the next trophy to unlock
 */
export function getNextTrophy(stats) {
  return TROPHY_TIERS.find(t => !t.check(stats)) || null;
}

/**
 * Get progress percentage toward a specific trophy
 */
export function getTrophyProgress(stats, trophyId) {
  const trophy = TROPHY_TIERS.find(t => t.id === trophyId);
  if (!trophy) return 0;
  const progress = Math.min(100, Math.round((stats.wins / trophy.requiredWins) * 100));
  return progress;
}

/**
 * Get all trophy definitions
 */
export function getAllTrophies() {
  return TROPHY_TIERS;
}

/**
 * Determine trophy tier for a match result
 */
export function getMatchTrophy(score, accuracy, responseTime) {
  if (score >= 100 && accuracy >= 95) return TROPHY_TIERS[2]; // Gold
  if (score >= 50 && accuracy >= 80) return TROPHY_TIERS[1]; // Silver
  if (score > 0) return TROPHY_TIERS[0]; // Bronze
  return null;
}

export default {
  TROPHY_TIERS,
  getUnlockedTrophies,
  getNextTrophy,
  getTrophyProgress,
  getAllTrophies,
  getMatchTrophy,
};
