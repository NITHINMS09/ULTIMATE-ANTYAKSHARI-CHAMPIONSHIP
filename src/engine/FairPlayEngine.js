/**
 * @fileoverview FairPlayEngine — Prevents cheating, duplicates, and delays
 */

/**
 * Normalize a string for comparison
 */
function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9\u0900-\u097F]/g, '').trim();
}

/**
 * Simple similarity score between two strings (0-100)
 */
function similarity(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 100;
  if (na.includes(nb) || nb.includes(na)) return 85;
  
  let matches = 0;
  const shorter = na.length < nb.length ? na : nb;
  const longer = na.length < nb.length ? nb : na;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) matches++;
  }
  return Math.round((matches / longer.length) * 100);
}

/**
 * Check if a song is a duplicate of any previously used song
 * @param {string} songTitle
 * @param {string[]} usedSongs - Array of lowercase song titles
 * @returns {{ isDuplicate: boolean, matchedSong: string|null, confidence: number }}
 */
export function checkForDuplicate(songTitle, usedSongs = []) {
  const normalized = normalize(songTitle);
  
  for (const used of usedSongs) {
    const score = similarity(songTitle, used);
    if (score >= 80) {
      return { isDuplicate: true, matchedSong: used, confidence: score };
    }
  }
  
  return { isDuplicate: false, matchedSong: null, confidence: 0 };
}

/**
 * Check if a team is intentionally delaying (using most of the timer consistently)
 * @param {string} teamId
 * @param {Array} songHistory
 * @param {number} timePerTurn
 * @returns {{ isDelaying: boolean, averageTime: number, reason: string }}
 */
export function checkForDelay(teamId, songHistory, timePerTurn = 30) {
  const teamSongs = songHistory.filter(s => s.teamId === teamId && s.responseTime);
  if (teamSongs.length < 3) return { isDelaying: false, averageTime: 0, reason: '' };
  
  const recentSongs = teamSongs.slice(-3);
  const avgTime = recentSongs.reduce((sum, s) => sum + s.responseTime, 0) / recentSongs.length;
  const threshold = timePerTurn * 0.85;
  
  if (avgTime >= threshold) {
    return {
      isDelaying: true,
      averageTime: Math.round(avgTime),
      reason: `Team has been consistently using ${Math.round((avgTime / timePerTurn) * 100)}% of the allowed time in recent turns.`,
    };
  }
  
  return { isDelaying: false, averageTime: Math.round(avgTime), reason: '' };
}

/**
 * Check if an entry is invalid (doesn't start with the required letter)
 * @param {string} songTitle
 * @param {string} requiredLetter
 * @returns {{ isInvalid: boolean, reason: string }}
 */
export function checkForInvalidEntry(songTitle, requiredLetter) {
  if (!songTitle || !songTitle.trim()) {
    return { isInvalid: true, reason: 'Empty song title submitted.' };
  }
  if (!requiredLetter) {
    return { isInvalid: false, reason: '' };
  }
  
  const firstChar = songTitle.trim()[0].toUpperCase();
  const required = requiredLetter.toUpperCase();
  
  if (firstChar !== required) {
    return {
      isInvalid: true,
      reason: `Song must start with "${required}" but starts with "${firstChar}".`,
    };
  }
  
  return { isInvalid: false, reason: '' };
}

/**
 * Get a human-readable explanation for a violation type
 * @param {string} type
 * @returns {string}
 */
export function getViolationExplanation(type) {
  const explanations = {
    duplicate: '⚠️ This song has already been played in this match. Each song can only be used once.',
    delay: '⏰ This team has been consistently using most of the allowed time. This may indicate stalling.',
    invalid_letter: '❌ The song does not start with the required letter. Please choose a song that starts with the correct letter.',
    invalid_entry: '🚫 The submitted entry is not valid. Please enter a recognizable song title.',
    empty: '📝 No song was submitted. Please enter a song title before the timer runs out.',
  };
  return explanations[type] || 'A fair play violation was detected.';
}

/**
 * Record a violation
 * @param {string} teamId
 * @param {string} type
 * @param {string} details
 * @returns {{ teamId: string, type: string, details: string, timestamp: number }}
 */
export function createViolation(teamId, type, details) {
  return {
    teamId,
    type,
    details,
    explanation: getViolationExplanation(type),
    timestamp: Date.now(),
  };
}

export default {
  checkForDuplicate,
  checkForDelay,
  checkForInvalidEntry,
  getViolationExplanation,
  createViolation,
};
