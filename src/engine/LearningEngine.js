/**
 * @fileoverview LearningEngine — Continuously improving song recognition
 * for the Ultimate Antyakshari Championship.
 *
 * Uses IndexedDB (via Dexie) to persist:
 * - Host corrections (wrong detection → correct song)
 * - Recognition accuracy stats per language
 * - Commonly confused song pairs
 * - Song popularity based on play frequency
 *
 * The engine learns from corrections to improve future matching.
 */

import Dexie from 'dexie';

/* ── Database Schema ─────────────────────────────────────────── */

const db = new Dexie('UACLearningDB');

db.version(1).stores({
  corrections: '++id, wrongText, correctTitle, language, timestamp',
  recognitionStats: '++id, songTitle, language, recognized, timestamp',
  confusionPairs: '++id, songA, songB, count',
  playHistory: '++id, songTitle, language, timestamp',
});

/* ── LearningEngine ──────────────────────────────────────────── */

export const LearningEngine = {
  /**
   * Store a host correction: the system detected wrongText but the correct
   * song was correctSong.
   *
   * @param {string} wrongText — What the system recognized/detected
   * @param {Object} correctSong — The actual correct song { title, artist, movie, language }
   * @returns {Promise<void>}
   */
  async addCorrection(wrongText, correctSong) {
    if (!wrongText || !correctSong?.title) return;

    const normalized = wrongText.toLowerCase().trim();
    const correctTitle = correctSong.title.trim();

    // Store correction
    await db.corrections.add({
      wrongText: normalized,
      correctTitle,
      correctArtist: correctSong.artist || '',
      correctMovie: correctSong.movie || '',
      language: correctSong.language || '',
      timestamp: Date.now(),
    });

    // Update confusion pair tracking
    await this._updateConfusionPair(normalized, correctTitle);

    console.log(`[LearningEngine] Correction stored: "${wrongText}" → "${correctTitle}"`);
  },

  /**
   * Look up if we have a correction for a given recognized text.
   * Returns the correct song info if a previous correction exists.
   *
   * @param {string} recognizedText
   * @returns {Promise<Object|null>} { correctTitle, correctArtist, correctMovie, language } or null
   */
  async findCorrection(recognizedText) {
    if (!recognizedText) return null;

    const normalized = recognizedText.toLowerCase().trim();

    // Exact match first
    const exact = await db.corrections
      .where('wrongText')
      .equals(normalized)
      .last();

    if (exact) {
      return {
        correctTitle: exact.correctTitle,
        correctArtist: exact.correctArtist,
        correctMovie: exact.correctMovie,
        language: exact.language,
        correctionCount: await db.corrections
          .where('wrongText')
          .equals(normalized)
          .count(),
      };
    }

    // Partial match — check if recognized text contains a corrected phrase
    const allCorrections = await db.corrections.toArray();
    for (const correction of allCorrections) {
      if (normalized.includes(correction.wrongText) || correction.wrongText.includes(normalized)) {
        const similarity = _jaccardSimilarity(normalized, correction.wrongText);
        if (similarity > 0.6) {
          return {
            correctTitle: correction.correctTitle,
            correctArtist: correction.correctArtist,
            correctMovie: correction.correctMovie,
            language: correction.language,
            correctionCount: 1,
          };
        }
      }
    }

    return null;
  },

  /**
   * Record a successful recognition event.
   *
   * @param {string} songTitle
   * @param {string} language
   * @param {boolean} wasCorrect — Whether the detection was correct
   */
  async recordRecognition(songTitle, language, wasCorrect) {
    await db.recognitionStats.add({
      songTitle: songTitle.trim(),
      language: language || 'unknown',
      recognized: wasCorrect,
      timestamp: Date.now(),
    });
  },

  /**
   * Record a song play event (for popularity tracking).
   *
   * @param {string} songTitle
   * @param {string} language
   */
  async recordPlay(songTitle, language) {
    await db.playHistory.add({
      songTitle: songTitle.trim(),
      language: language || 'unknown',
      timestamp: Date.now(),
    });
  },

  /**
   * Get recognition accuracy statistics.
   *
   * @returns {Promise<Object>} { overall, byLanguage, totalRecognitions, totalCorrections }
   */
  async getAccuracyStats() {
    const allStats = await db.recognitionStats.toArray();
    const totalCorrections = await db.corrections.count();

    if (allStats.length === 0) {
      return {
        overall: 100,
        byLanguage: {},
        totalRecognitions: 0,
        totalCorrections,
      };
    }

    // Overall accuracy
    const correct = allStats.filter(s => s.recognized).length;
    const overall = Math.round((correct / allStats.length) * 100);

    // By language
    const byLanguage = {};
    const languages = [...new Set(allStats.map(s => s.language))];
    for (const lang of languages) {
      const langStats = allStats.filter(s => s.language === lang);
      const langCorrect = langStats.filter(s => s.recognized).length;
      byLanguage[lang] = {
        accuracy: Math.round((langCorrect / langStats.length) * 100),
        total: langStats.length,
        correct: langCorrect,
      };
    }

    return {
      overall,
      byLanguage,
      totalRecognitions: allStats.length,
      totalCorrections,
    };
  },

  /**
   * Get the most commonly confused song pairs.
   *
   * @param {number} limit
   * @returns {Promise<Array<{songA: string, songB: string, count: number}>>}
   */
  async getConfusionPairs(limit = 10) {
    return db.confusionPairs
      .orderBy('count')
      .reverse()
      .limit(limit)
      .toArray();
  },

  /**
   * Get most frequently played songs (for popularity scoring).
   *
   * @param {number} limit
   * @returns {Promise<Array<{songTitle: string, playCount: number}>>}
   */
  async getMostPlayedSongs(limit = 20) {
    const plays = await db.playHistory.toArray();
    const counts = {};
    for (const play of plays) {
      counts[play.songTitle] = (counts[play.songTitle] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([songTitle, playCount]) => ({ songTitle, playCount }))
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);
  },

  /**
   * Get all stored corrections.
   *
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getAllCorrections(limit = 100) {
    return db.corrections
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray();
  },

  /**
   * Get correction count.
   *
   * @returns {Promise<number>}
   */
  async getCorrectionCount() {
    return db.corrections.count();
  },

  /**
   * Clear all learning data (reset).
   *
   * @returns {Promise<void>}
   */
  async clearAll() {
    await db.corrections.clear();
    await db.recognitionStats.clear();
    await db.confusionPairs.clear();
    await db.playHistory.clear();
    console.log('[LearningEngine] All learning data cleared.');
  },

  /**
   * Export all learning data for backup.
   *
   * @returns {Promise<Object>}
   */
  async exportData() {
    return {
      corrections: await db.corrections.toArray(),
      recognitionStats: await db.recognitionStats.toArray(),
      confusionPairs: await db.confusionPairs.toArray(),
      playHistory: await db.playHistory.toArray(),
      exportedAt: new Date().toISOString(),
    };
  },

  /* ── Private ───────────────────────────────────────────── */

  /**
   * Track confusion pairs between two songs.
   * @private
   */
  async _updateConfusionPair(wrongText, correctTitle) {
    const normalizedA = wrongText.toLowerCase().trim();
    const normalizedB = correctTitle.toLowerCase().trim();

    // Check if pair exists
    const existing = await db.confusionPairs
      .filter(p =>
        (p.songA === normalizedA && p.songB === normalizedB) ||
        (p.songA === normalizedB && p.songB === normalizedA)
      )
      .first();

    if (existing) {
      await db.confusionPairs.update(existing.id, { count: existing.count + 1 });
    } else {
      await db.confusionPairs.add({
        songA: normalizedA,
        songB: normalizedB,
        count: 1,
      });
    }
  },
};

/* ── Private Helpers ─────────────────────────────────────────── */

/**
 * Jaccard similarity between two strings (tokenized).
 * @param {string} a
 * @param {string} b
 * @returns {number} 0 to 1
 */
function _jaccardSimilarity(a, b) {
  const tokensA = new Set(a.toLowerCase().split(/\s+/));
  const tokensB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = new Set([...tokensA].filter(x => tokensB.has(x)));
  const union = new Set([...tokensA, ...tokensB]);
  return union.size > 0 ? intersection.size / union.size : 0;
}

export default LearningEngine;
