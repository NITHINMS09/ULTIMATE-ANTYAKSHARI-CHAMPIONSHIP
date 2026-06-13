/**
 * @fileoverview ConfidenceEngine — Smart multi-source confidence scoring
 * for the Ultimate Antyakshari Championship.
 *
 * Combines scores from:
 * - Speech recognition confidence (Google/Whisper)
 * - Local database match score
 * - Metadata completeness (artist, movie, language)
 * - YouTube validation
 * - Learning engine corrections
 *
 * Produces final song selection with alternatives and confidence breakdown.
 */

/* ── Weights ─────────────────────────────────────────────────── */

const WEIGHTS = {
  speechRecognition: 0.30,
  databaseMatch: 0.30,
  metadataMatch: 0.15,
  youtubeValidation: 0.15,
  musicBrainzValidation: 0.10,
};

/* ── Confidence Thresholds ───────────────────────────────────── */

const THRESHOLDS = {
  AUTO_ACCEPT: 85,       // Auto-approve above this
  HIGH_CONFIDENCE: 70,   // Good match
  MEDIUM_CONFIDENCE: 50, // Needs review
  LOW_CONFIDENCE: 30,    // Likely wrong
  REJECT: 15,            // Auto-reject below this
};

/* ── ConfidenceEngine ────────────────────────────────────────── */

export const ConfidenceEngine = {
  /**
   * Calculate comprehensive confidence score for a song detection.
   *
   * @param {Object} params
   * @param {string} params.recognizedText — Raw text from speech recognition
   * @param {number} params.speechConfidence — 0-100 confidence from speech engine
   * @param {Object|null} params.databaseMatch — Best match from songDatabase
   * @param {number} params.databaseScore — 0-100 match score from database search
   * @param {Object[]} params.alternatives — Alternative matches [{title, score}]
   * @param {Object} params.metadata — { artist, movie, language } from detection
   * @param {boolean} params.youtubeValidated — Whether YouTube found a matching video
   * @param {string} params.youtubeVideoTitle — Title of the YouTube video found
   * @param {Object|null} params.learningCorrection — Previous correction from LearningEngine
   * @returns {ConfidenceResult}
   */
  calculateConfidence({
    recognizedText = '',
    speechConfidence = 0,
    databaseMatch = null,
    databaseScore = 0,
    alternatives = [],
    metadata = {},
    youtubeValidated = false,
    youtubeVideoTitle = '',
    musicBrainzValidated = false,
    learningCorrection = null,
  }) {
    /* ── 1. Speech Recognition Score ──────────────────────── */
    const speechScore = Math.min(100, Math.max(0, speechConfidence));

    /* ── 2. Database Match Score ──────────────────────────── */
    let dbScore = Math.min(100, Math.max(0, databaseScore));

    // Boost if learning engine has a correction for this text
    if (learningCorrection) {
      dbScore = Math.max(dbScore, 90);
    }

    /* ── 3. Metadata Completeness Score ──────────────────── */
    let metaScore = 0;
    if (metadata.artist) metaScore += 35;
    if (metadata.movie) metaScore += 35;
    if (metadata.language) metaScore += 15;
    if (metadata.year) metaScore += 15;

    // Cross-validate metadata against database match
    if (databaseMatch) {
      if (metadata.artist && databaseMatch.artist) {
        const artistMatch = _fuzzyCompare(metadata.artist, databaseMatch.artist);
        metaScore += artistMatch > 0.7 ? 20 : 0;
      }
      if (metadata.movie && databaseMatch.movie) {
        const movieMatch = _fuzzyCompare(metadata.movie, databaseMatch.movie);
        metaScore += movieMatch > 0.7 ? 15 : 0;
      }
    }
    metaScore = Math.min(100, metaScore);

    /* ── 4. YouTube Validation Score ──────────────────────── */
    let ytScore = 0;
    if (youtubeValidated) {
      ytScore = 50;
      // Cross-check video title with song title
      if (youtubeVideoTitle && databaseMatch?.title) {
        const titleMatch = _fuzzyCompare(youtubeVideoTitle, databaseMatch.title);
        ytScore += Math.round(titleMatch * 50);
      }
    }
    ytScore = Math.min(100, ytScore);

    /* ── 4b. MusicBrainz Validation Score ─────────────────────── */
    const mbScore = musicBrainzValidated ? 100 : 0;

    /* ── 5. Calculate Weighted Final Score ────────────────── */
    const rawScore =
      speechScore * WEIGHTS.speechRecognition +
      dbScore * WEIGHTS.databaseMatch +
      metaScore * WEIGHTS.metadataMatch +
      ytScore * WEIGHTS.youtubeValidation +
      mbScore * WEIGHTS.musicBrainzValidation;

    const finalConfidence = Math.round(Math.min(100, Math.max(0, rawScore)));

    /* ── 6. Determine Status ─────────────────────────────── */
    let status;
    if (finalConfidence >= THRESHOLDS.AUTO_ACCEPT) {
      status = 'auto_approved';
    } else if (finalConfidence >= THRESHOLDS.HIGH_CONFIDENCE) {
      status = 'high_confidence';
    } else if (finalConfidence >= THRESHOLDS.MEDIUM_CONFIDENCE) {
      status = 'needs_review';
    } else if (finalConfidence >= THRESHOLDS.LOW_CONFIDENCE) {
      status = 'low_confidence';
    } else {
      status = 'rejected';
    }

    /* ── 7. Build Alternatives List ──────────────────────── */
    const alternativeMatches = alternatives
      .filter(a => a.title !== databaseMatch?.title)
      .slice(0, 5)
      .map(a => ({
        songName: a.title,
        artist: a.artist || '',
        movie: a.movie || '',
        language: a.language || '',
        confidence: Math.round(a.score || 0),
      }));

    /* ── 8. Build Confidence Breakdown ────────────────────── */
    const breakdown = {
      speechRecognition: { score: speechScore, weight: WEIGHTS.speechRecognition, weighted: Math.round(speechScore * WEIGHTS.speechRecognition) },
      databaseMatch: { score: dbScore, weight: WEIGHTS.databaseMatch, weighted: Math.round(dbScore * WEIGHTS.databaseMatch) },
      metadataMatch: { score: metaScore, weight: WEIGHTS.metadataMatch, weighted: Math.round(metaScore * WEIGHTS.metadataMatch) },
      youtubeValidation: { score: ytScore, weight: WEIGHTS.youtubeValidation, weighted: Math.round(ytScore * WEIGHTS.youtubeValidation) },
      musicBrainzValidation: { score: mbScore, weight: WEIGHTS.musicBrainzValidation, weighted: Math.round(mbScore * WEIGHTS.musicBrainzValidation) },
    };

    /* ── 9. Final Result ─────────────────────────────────── */
    return {
      songName: databaseMatch?.title || recognizedText,
      artist: databaseMatch?.artist || metadata.artist || '',
      movie: databaseMatch?.movie || metadata.movie || '',
      language: databaseMatch?.language || metadata.language || '',
      year: databaseMatch?.year || null,
      confidence: finalConfidence,
      status,
      alternatives: alternativeMatches,
      breakdown,
      source: learningCorrection ? 'learning_engine' : 'multi_engine',
      recognizedText,
      databaseMatch,
      youtubeVideoTitle,
      musicBrainzValidated,
      timestamp: Date.now(),
    };
  },

  /**
   * Determine if the detection should be auto-accepted (no host review needed).
   * @param {number} confidence
   * @returns {boolean}
   */
  shouldAutoAccept(confidence) {
    return confidence >= THRESHOLDS.AUTO_ACCEPT;
  },

  /**
   * Determine if multi-attempt retry should be triggered.
   * @param {number} confidence
   * @returns {boolean}
   */
  shouldRetry(confidence) {
    return confidence < THRESHOLDS.MEDIUM_CONFIDENCE;
  },

  /**
   * Get a human-readable confidence label.
   * @param {number} confidence
   * @returns {{ label: string, color: string, emoji: string }}
   */
  getConfidenceLabel(confidence) {
    if (confidence >= THRESHOLDS.AUTO_ACCEPT) {
      return { label: 'Excellent Match', color: 'var(--success-500)', emoji: '🎯' };
    }
    if (confidence >= THRESHOLDS.HIGH_CONFIDENCE) {
      return { label: 'Good Match', color: 'var(--success-400)', emoji: '✅' };
    }
    if (confidence >= THRESHOLDS.MEDIUM_CONFIDENCE) {
      return { label: 'Possible Match', color: 'var(--warning-500)', emoji: '🤔' };
    }
    if (confidence >= THRESHOLDS.LOW_CONFIDENCE) {
      return { label: 'Low Confidence', color: 'var(--warning-400)', emoji: '⚠️' };
    }
    return { label: 'No Match', color: 'var(--error-500)', emoji: '❌' };
  },

  /**
   * Get the confidence thresholds.
   * @returns {Object}
   */
  getThresholds() {
    return { ...THRESHOLDS };
  },

  /**
   * Get the scoring weights.
   * @returns {Object}
   */
  getWeights() {
    return { ...WEIGHTS };
  },
};

/* ── Private Helpers ─────────────────────────────────────────── */

/**
 * Simple fuzzy comparison between two strings.
 * @param {string} a
 * @param {string} b
 * @returns {number} 0 to 1 similarity
 */
function _fuzzyCompare(a, b) {
  if (!a || !b) return 0;
  const na = a.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  const nb = b.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
  if (na === nb) return 1.0;
  if (na.includes(nb) || nb.includes(na)) {
    return 0.8;
  }
  // Token overlap
  const tokensA = na.split(/\s+/);
  const tokensB = nb.split(/\s+/);
  let matches = 0;
  for (const t of tokensA) {
    if (tokensB.some(tb => tb.includes(t) || t.includes(tb))) matches++;
  }
  return tokensA.length > 0 ? matches / Math.max(tokensA.length, tokensB.length) : 0;
}

/**
 * @typedef {Object} ConfidenceResult
 * @property {string} songName — Best song name
 * @property {string} artist
 * @property {string} movie
 * @property {string} language
 * @property {number|null} year
 * @property {number} confidence — 0 to 100
 * @property {'auto_approved'|'high_confidence'|'needs_review'|'low_confidence'|'rejected'} status
 * @property {Array<{songName:string, artist:string, confidence:number}>} alternatives
 * @property {Object} breakdown — Score breakdown by source
 * @property {string} source
 * @property {string} recognizedText
 * @property {Object|null} databaseMatch
 * @property {string} youtubeVideoTitle
 * @property {number} timestamp
 */

export default ConfidenceEngine;
