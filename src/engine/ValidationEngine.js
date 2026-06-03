/**
 * @fileoverview ValidationEngine — Song submission validation for the
 * Ultimate Antyakshari Championship.
 *
 * Validates that:
 * 1. The song title is not empty
 * 2. The song starts with the required letter
 * 3. The song has not been used before in this match
 *
 * Returns a validation result with status, confidence, and reason.
 */

import { isValidStartingLetter } from './LetterEngine.js';

/**
 * @typedef {Object} ValidationResult
 * @property {'approved'|'rejected'|'pending_review'} status
 * @property {number} confidence  — 0 to 100
 * @property {string} reason      — Human-readable reason
 */

/**
 * Validate a submitted song against the current game state.
 *
 * @param {{ songTitle: string, artist?: string, movie?: string, language?: string }} songData
 * @param {string|null} requiredLetter  — The letter the song must start with
 * @param {string[]} usedSongs         — Lowercase titles already used in this match
 * @returns {ValidationResult}
 */
export function validateSong(songData, requiredLetter, usedSongs = []) {
  const title = songData?.songTitle?.trim();

  /* ── 1. Empty title ─────────────────────────────────────── */
  if (!title) {
    return {
      status: 'rejected',
      confidence: 100,
      reason: 'Song title cannot be empty.',
    };
  }

  /* ── 2. Too short ───────────────────────────────────────── */
  if (title.length < 2) {
    return {
      status: 'rejected',
      confidence: 95,
      reason: 'Song title is too short. Please enter a valid song name.',
    };
  }

  /* ── 3. Starting letter check ───────────────────────────── */
  if (requiredLetter && !isValidStartingLetter(title, requiredLetter)) {
    return {
      status: 'rejected',
      confidence: 100,
      reason: `Song must start with the letter "${requiredLetter}". "${title}" starts with "${title[0].toUpperCase()}".`,
    };
  }

  /* ── 4. Duplicate check ─────────────────────────────────── */
  const titleLower = title.toLowerCase();
  if (usedSongs.includes(titleLower)) {
    return {
      status: 'rejected',
      confidence: 100,
      reason: `"${title}" has already been played in this match.`,
    };
  }

  /* ── 5. Fuzzy duplicate check (near-duplicates) ─────────── */
  const similar = usedSongs.find((s) => {
    // Simple Levenshtein-like comparison: same if removing spaces matches
    const a = titleLower.replace(/\s+/g, '');
    const b = s.replace(/\s+/g, '');
    return a === b;
  });

  if (similar) {
    return {
      status: 'rejected',
      confidence: 90,
      reason: `"${title}" appears to be a duplicate of a previously played song.`,
    };
  }

  /* ── 6. Confidence heuristic based on metadata ──────────── */
  let confidence = 75;
  if (songData.artist) confidence += 10;
  if (songData.movie) confidence += 10;
  if (songData.language) confidence += 5;

  /* ── 7. All checks passed ───────────────────────────────── */
  return {
    status: 'approved',
    confidence: Math.min(confidence, 100),
    reason: 'Song accepted! Great choice! 🎵',
  };
}

export default validateSong;
