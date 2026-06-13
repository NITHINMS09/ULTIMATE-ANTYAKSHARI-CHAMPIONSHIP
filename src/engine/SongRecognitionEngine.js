/**
 * @fileoverview SongRecognitionEngine — Multi-AI detection pipeline orchestrator
 * for the Ultimate Antyakshari Championship.
 *
 * Pipeline:
 * Microphone → AudioProcessor → Google Speech (primary) → Whisper (backup)
 * → Lyrics Extraction → Database Matching → YouTube Validation
 * → Confidence Scoring → Multi-attempt Retry → Final Selection
 *
 * Supports: Kannada, Malayalam, Tamil, Telugu, Hindi, English, Punjabi, Bengali
 */

import { AudioProcessor } from './AudioProcessor.js';
import { ConfidenceEngine } from './ConfidenceEngine.js';
import { LearningEngine } from './LearningEngine.js';
import { searchSongs, findSongMatch, findAlternativeMatches } from '../data/songDatabase.js';

/* ── Detection Stages ────────────────────────────────────────── */

export const DETECTION_STAGES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  DETECTING: 'detecting',
  SEARCHING: 'searching',
  VALIDATING: 'validating',
  LOADING_YOUTUBE: 'loading_youtube',
  COMPLETE: 'complete',
  FAILED: 'failed',
};

const STAGE_LABELS = {
  [DETECTION_STAGES.IDLE]: { text: 'Ready', emoji: '🎤', description: 'Tap to start listening' },
  [DETECTION_STAGES.LISTENING]: { text: 'Listening...', emoji: '🎤', description: 'Sing or hum your song!' },
  [DETECTION_STAGES.DETECTING]: { text: 'Detecting Lyrics...', emoji: '🔍', description: 'Analyzing audio patterns' },
  [DETECTION_STAGES.SEARCHING]: { text: 'Searching Songs...', emoji: '🎵', description: 'Matching against database' },
  [DETECTION_STAGES.VALIDATING]: { text: 'Validating Song...', emoji: '✅', description: 'Cross-checking results' },
  [DETECTION_STAGES.LOADING_YOUTUBE]: { text: 'Loading YouTube...', emoji: '▶️', description: 'Finding the perfect video' },
  [DETECTION_STAGES.COMPLETE]: { text: 'Song Found!', emoji: '🎶', description: 'Detection complete' },
  [DETECTION_STAGES.FAILED]: { text: 'Detection Failed', emoji: '❌', description: 'Please try again' },
};

/* ── Language Codes for Google Speech API ─────────────────────── */

const LANGUAGE_CODES = {
  kannada: 'kn-IN',
  malayalam: 'ml-IN',
  tamil: 'ta-IN',
  telugu: 'te-IN',
  hindi: 'hi-IN',
  english: 'en-IN',
  punjabi: 'pa-IN',
  bengali: 'bn-IN',
  all: 'hi-IN', // Default to Hindi when "all languages" mode
};

/* ── Max Attempts Configuration ──────────────────────────────── */

const MAX_ATTEMPTS = 5;
const ATTEMPT_CONFIGS = [
  { engine: 'google_speech', label: 'Google Speech Recognition', timeout: 8000 },
  { engine: 'whisper', label: 'Whisper AI Recognition', timeout: 15000 },
  { engine: 'extended_lyrics', label: 'Extended Lyrics Analysis', timeout: 12000 },
  { engine: 'database_similarity', label: 'Database Similarity Search', timeout: 5000 },
  { engine: 'host_confirmation', label: 'Host Confirmation', timeout: 0 },
];

/* ── SongRecognitionEngine ───────────────────────────────────── */

class SongRecognitionEngine {
  constructor() {
    this.audioProcessor = new AudioProcessor();
    this.stage = DETECTION_STAGES.IDLE;
    this.currentAttempt = 0;
    this.recognizedTexts = [];
    this.detectionResult = null;
    this.isActive = false;

    // Google Speech Recognition instance
    this._speechRecognition = null;
    this._speechResults = [];

    // MediaRecorder for Whisper backup
    this._mediaRecorder = null;
    this._audioChunks = [];

    // Callbacks
    this._onStageChange = null;
    this._onTextDetected = null;
    this._onResultReady = null;
    this._onLevelChange = null;
    this._onError = null;

    // Configuration
    this._requiredLetter = null;
    this._preferredLanguage = 'all';
    this._autoMode = true;
    this._serverUrl = 'http://localhost:3001';
  }

  /* ── Public API ──────────────────────────────────────────── */

  /**
   * Start the full recognition pipeline.
   *
   * @param {Object} options
   * @param {string|null} options.requiredLetter — Letter the song must start with
   * @param {string} options.language — Preferred language ('all', 'kannada', etc.)
   * @param {boolean} options.autoMode — Auto-accept high confidence matches
   * @param {Function} options.onStageChange — callback(stage, stageInfo)
   * @param {Function} options.onTextDetected — callback(text, confidence, engine)
   * @param {Function} options.onResultReady — callback(result)
   * @param {Function} options.onLevelChange — callback(level, dB)
   * @param {Function} options.onError — callback(error)
   * @returns {Promise<void>}
   */
  async startRecognition({
    requiredLetter = null,
    language = 'all',
    autoMode = true,
    onStageChange = null,
    onTextDetected = null,
    onResultReady = null,
    onLevelChange = null,
    onError = null,
  } = {}) {
    if (this.isActive) {
      console.warn('[SongRecognitionEngine] Already active. Stopping first.');
      await this.stopRecognition();
    }

    this._requiredLetter = requiredLetter;
    this._preferredLanguage = language;
    this._autoMode = autoMode;
    this._onStageChange = onStageChange;
    this._onTextDetected = onTextDetected;
    this._onResultReady = onResultReady;
    this._onLevelChange = onLevelChange;
    this._onError = onError;

    this.isActive = true;
    this.currentAttempt = 0;
    this.recognizedTexts = [];
    this.detectionResult = null;
    this._speechResults = [];

    try {
      // Stage 1: Initialize audio and start listening
      this._setStage(DETECTION_STAGES.LISTENING);

      // Initialize audio processor
      const processedStream = await this.audioProcessor.initialize({
        onLevelChange: (level, dB) => {
          this._onLevelChange?.(level, dB);
        },
        onVoiceActivity: (isActive) => {
          if (isActive && this.stage === DETECTION_STAGES.LISTENING) {
            this._setStage(DETECTION_STAGES.DETECTING);
          }
        },
      });

      // Start Google Speech Recognition (primary engine)
      this._startGoogleSpeech(processedStream);

      // Simultaneously start recording for Whisper backup
      this._startWhisperRecording(processedStream);

    } catch (error) {
      console.error('[SongRecognitionEngine] Start failed:', error);
      this._onError?.(error);
      this._setStage(DETECTION_STAGES.FAILED);
    }
  }

  /**
   * Stop recognition and clean up.
   * @returns {Promise<void>}
   */
  async stopRecognition() {
    this.isActive = false;

    // Stop Google Speech
    if (this._speechRecognition) {
      try {
        this._speechRecognition.abort();
      } catch (e) { /* ignore */ }
      this._speechRecognition = null;
    }

    // Stop MediaRecorder
    if (this._mediaRecorder && this._mediaRecorder.state !== 'inactive') {
      try {
        this._mediaRecorder.stop();
      } catch (e) { /* ignore */ }
    }
    this._mediaRecorder = null;

    // Destroy audio processor
    this.audioProcessor.destroy();

    this._setStage(DETECTION_STAGES.IDLE);
  }

  /**
   * Force submit the current best result (for host confirmation).
   * @param {string} songTitle — Manual override title
   * @returns {Promise<Object>} Detection result
   */
  async forceSubmit(songTitle) {
    if (songTitle) {
      const result = await this._processRecognizedText(songTitle, 100, 'manual');
      return result;
    }
    return this.detectionResult;
  }

  /**
   * Get current detection state.
   * @returns {Object}
   */
  getState() {
    return {
      stage: this.stage,
      stageInfo: STAGE_LABELS[this.stage],
      currentAttempt: this.currentAttempt,
      maxAttempts: MAX_ATTEMPTS,
      recognizedTexts: [...this.recognizedTexts],
      detectionResult: this.detectionResult,
      isActive: this.isActive,
      audioMetrics: this.audioProcessor.getMetrics(),
    };
  }

  /**
   * Get audio frequency data for visualization.
   * @returns {Uint8Array}
   */
  getFrequencyData() {
    return this.audioProcessor.getFrequencyData();
  }

  /**
   * Get audio waveform data for visualization.
   * @returns {Uint8Array}
   */
  getWaveformData() {
    return this.audioProcessor.getWaveformData();
  }

  /**
   * Get microphone device info.
   * @returns {Object|null}
   */
  getDeviceInfo() {
    return this.audioProcessor.getDeviceInfo();
  }

  /* ── Private: Google Speech Recognition ────────────────── */

  /**
   * Start Google Web Speech API for real-time recognition.
   * @private
   */
  _startGoogleSpeech(stream) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('[SongRecognitionEngine] Google Speech API not available. Using Whisper only.');
      return;
    }

    const recognition = new SpeechRecognition();
    this._speechRecognition = recognition;

    // Configure for song recognition
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 5;
    recognition.lang = LANGUAGE_CODES[this._preferredLanguage] || LANGUAGE_CODES.all;

    recognition.onresult = (event) => {
      let interimText = '';
      let finalText = '';
      let bestConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        const confidence = result[0].confidence || 0.5;

        if (result.isFinal) {
          finalText += transcript;
          bestConfidence = Math.max(bestConfidence, confidence);

          // Store all alternatives
          for (let j = 0; j < result.length; j++) {
            this._speechResults.push({
              text: result[j].transcript,
              confidence: result[j].confidence || 0,
            });
          }
        } else {
          interimText += transcript;
        }
      }

      // Report interim results
      if (interimText) {
        this._onTextDetected?.(interimText, 0, 'google_interim');
      }

      // Process final results
      if (finalText) {
        this.recognizedTexts.push({
          text: finalText,
          confidence: bestConfidence * 100,
          engine: 'google_speech',
        });

        this._onTextDetected?.(finalText, bestConfidence * 100, 'google_speech');
        this._processRecognizedText(finalText, bestConfidence * 100, 'google_speech');
      }
    };

    recognition.onerror = (event) => {
      console.warn('[SongRecognitionEngine] Google Speech error:', event.error);
      this._onError?.(new Error(`Google Speech error: ${event.error}`));
      if (this.isActive && !this.detectionResult && this.currentAttempt === 0) {
        console.log('[SongRecognitionEngine] Immediate Whisper failover triggered due to Google Speech error.');
        this._tryNextAttempt();
      }
    };

    recognition.onend = () => {
      // Restart if still active and no result yet
      if (this.isActive && !this.detectionResult) {
        try {
          recognition.start();
        } catch (e) { /* ignore */ }
      }
    };

    try {
      recognition.start();
      console.log('[SongRecognitionEngine] Google Speech started with lang:', recognition.lang);
    } catch (e) {
      console.warn('[SongRecognitionEngine] Could not start Google Speech:', e);
    }
  }

  /* ── Private: Whisper Recording ────────────────────────── */

  /**
   * Start recording audio for Whisper backup transcription.
   * @private
   */
  _startWhisperRecording(stream) {
    this._audioChunks = [];

    const mimeType = MediaRecorder.isTypeSupported('audio/webm')
      ? 'audio/webm'
      : 'audio/ogg';

    try {
      this._mediaRecorder = new MediaRecorder(stream, { mimeType });

      this._mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this._audioChunks.push(e.data);
        }
      };

      this._mediaRecorder.start(1000); // Collect chunks every second

      // Auto-trigger Whisper after 8 seconds if no Google result
      setTimeout(() => {
        if (this.isActive && !this.detectionResult && this.currentAttempt < 2) {
          this._triggerWhisperTranscription();
        }
      }, 8000);

    } catch (e) {
      console.warn('[SongRecognitionEngine] Could not start Whisper recording:', e);
    }
  }

  /**
   * Send recorded audio to Whisper API for backup transcription.
   * @private
   */
  async _triggerWhisperTranscription() {
    if (this._audioChunks.length === 0) return;

    this.currentAttempt = Math.max(this.currentAttempt, 2);
    console.log('[SongRecognitionEngine] Triggering Whisper backup transcription...');

    try {
      const audioBlob = new Blob(this._audioChunks, {
        type: this._mediaRecorder?.mimeType || 'audio/webm'
      });

      const formData = new FormData();
      formData.append('audio', audioBlob);

      const letterParam = this._requiredLetter ? `?letter=${this._requiredLetter}` : '';
      const response = await fetch(`${this._serverUrl}/api/transcribe${letterParam}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Whisper API returned ${response.status}`);
      }

      const data = await response.json();
      const text = data.text || '';

      if (text.trim()) {
        this.recognizedTexts.push({
          text,
          confidence: 70, // Whisper doesn't return confidence, assume moderate
          engine: 'whisper',
        });

        this._onTextDetected?.(text, 70, 'whisper');
        await this._processRecognizedText(text, 70, 'whisper');
      }
    } catch (error) {
      console.error('[SongRecognitionEngine] Whisper transcription failed:', error);
      // Continue to next attempt
      this._tryNextAttempt();
    }
  }

  /* ── Private: Processing Pipeline ──────────────────────── */

  /**
   * Process recognized text through the full matching pipeline.
   * @private
   */
  async _processRecognizedText(text, speechConfidence, engine) {
    if (!this.isActive) return null;

    this._setStage(DETECTION_STAGES.SEARCHING);

    // Step 1: Check learning engine for corrections
    const correction = await LearningEngine.findCorrection(text);
    let searchText = text;
    if (correction) {
      console.log(`[SongRecognitionEngine] Learning correction found: "${text}" → "${correction.correctTitle}"`);
      searchText = correction.correctTitle;
    }

    // Step 2: Search local database
    const dbResult = findSongMatch(searchText);
    const alternatives = findAlternativeMatches ? findAlternativeMatches(searchText, 5) : [];

    // Step 3: Extract metadata from best match
    const metadata = {};
    if (dbResult.match) {
      metadata.artist = dbResult.match.artist;
      metadata.movie = dbResult.match.movie;
      metadata.language = dbResult.match.language;
      metadata.year = dbResult.match.year;
    }

    this._setStage(DETECTION_STAGES.VALIDATING);

    // Step 4: YouTube validation (optional, non-blocking)
    let youtubeValidated = false;
    let youtubeVideoTitle = '';

    if (dbResult.match) {
      try {
        const ytResult = await this._validateWithYouTube(dbResult.match.title, dbResult.match.artist);
        youtubeValidated = ytResult.validated;
        youtubeVideoTitle = ytResult.videoTitle;
      } catch (e) {
        // Non-fatal — YouTube validation is optional
      }
    }

    // Step 4b: MusicBrainz validation (optional, non-blocking)
    let musicBrainzValidated = false;
    if (dbResult.match) {
      try {
        const mbResult = await this._validateWithMusicBrainz(dbResult.match.title, dbResult.match.artist);
        musicBrainzValidated = mbResult.validated;
      } catch (e) {
        // Non-fatal — MusicBrainz validation is optional
      }
    }

    // Step 5: Calculate confidence
    const confidenceResult = ConfidenceEngine.calculateConfidence({
      recognizedText: text,
      speechConfidence,
      databaseMatch: dbResult.match,
      databaseScore: dbResult.confidence,
      alternatives,
      metadata,
      youtubeValidated,
      youtubeVideoTitle,
      musicBrainzValidated,
      learningCorrection: correction,
    });

    // Step 6: Check if confidence is sufficient
    if (confidenceResult.confidence >= 50 || engine === 'manual' || engine === 'best_of_all' || this.currentAttempt >= MAX_ATTEMPTS - 1) {
      // Good enough — accept
      this.detectionResult = confidenceResult;

      // Record in learning engine
      if (confidenceResult.confidence >= 50) {
        await LearningEngine.recordRecognition(
          confidenceResult.songName,
          confidenceResult.language,
          true
        );
      }

      this._setStage(DETECTION_STAGES.COMPLETE);
      this._onResultReady?.(confidenceResult);

      // Stop recognition
      if (this._speechRecognition) {
        try { this._speechRecognition.abort(); } catch (e) { /* ignore */ }
      }

      return confidenceResult;
    }

    // Step 7: Low confidence — try next attempt
    this._tryNextAttempt();
    return null;
  }

  /**
   * Try the next detection attempt.
   * @private
   */
  _tryNextAttempt() {
    this.currentAttempt++;

    if (this.currentAttempt >= MAX_ATTEMPTS) {
      // All attempts exhausted — present best result or fail
      if (this.recognizedTexts.length > 0) {
        // Use the best recognized text
        const best = this.recognizedTexts.reduce((a, b) =>
          (a.confidence > b.confidence) ? a : b
        );
        this._processRecognizedText(best.text, best.confidence, 'best_of_all');
      } else {
        this._setStage(DETECTION_STAGES.FAILED);
        this._onError?.(new Error('All detection attempts exhausted'));
      }
      return;
    }

    const attemptConfig = ATTEMPT_CONFIGS[this.currentAttempt];
    console.log(`[SongRecognitionEngine] Attempt ${this.currentAttempt + 1}/${MAX_ATTEMPTS}: ${attemptConfig.label}`);

    switch (attemptConfig.engine) {
      case 'whisper':
        this._triggerWhisperTranscription();
        break;
      case 'extended_lyrics':
        this._extendedLyricsAnalysis();
        break;
      case 'database_similarity':
        this._databaseSimilaritySearch();
        break;
      case 'host_confirmation':
        // Signal that host input is needed
        this._setStage(DETECTION_STAGES.FAILED);
        this._onError?.(new Error('Host confirmation required'));
        break;
      default:
        break;
    }
  }

  /**
   * Extended lyrics analysis — combine all recognized fragments and re-search.
   * @private
   */
  async _extendedLyricsAnalysis() {
    // Combine all recognized text fragments
    const allTexts = this.recognizedTexts.map(r => r.text).join(' ');
    const keywords = allTexts.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    if (keywords.length === 0) {
      this._tryNextAttempt();
      return;
    }

    // Search by lyrics keywords
    let results = [];
    try {
      const { searchByLyrics } = await import('../data/songDatabase.js');
      if (searchByLyrics) {
        results = searchByLyrics(keywords);
      }
    } catch (e) {
      // searchByLyrics may not exist yet, fall back to regular search
      results = searchSongs(allTexts, 5);
    }

    if (results.length > 0) {
      const best = results[0];
      await this._processRecognizedText(best.title, best.score || 60, 'extended_lyrics');
    } else {
      this._tryNextAttempt();
    }
  }

  /**
   * Database similarity search — broader fuzzy matching.
   * @private
   */
  async _databaseSimilaritySearch() {
    const allTexts = this.recognizedTexts.map(r => r.text);

    for (const text of allTexts) {
      // Try splitting the text into words and searching each
      const words = text.split(/\s+/);
      for (let len = words.length; len >= 2; len--) {
        for (let start = 0; start <= words.length - len; start++) {
          const phrase = words.slice(start, start + len).join(' ');
          const result = findSongMatch(phrase);
          if (result.found && result.confidence > 60) {
            await this._processRecognizedText(result.match.title, result.confidence, 'database_similarity');
            return;
          }
        }
      }
    }

    this._tryNextAttempt();
  }

  /**
   * Validate song against YouTube search.
   * @private
   */
  async _validateWithYouTube(songTitle, artist) {
    try {
      const query = `${songTitle} ${artist || ''} official audio`.trim();
      const response = await fetch(`${this._serverUrl}/api/youtube-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      return {
        validated: !!data.videoId && data.mode !== 'rickroll_mock',
        videoId: data.videoId || '',
        videoTitle: data.videoTitle || '',
      };
    } catch (e) {
      return { validated: false, videoId: '', videoTitle: '' };
    }
  }

  /**
   * Validate song against MusicBrainz API.
   * @private
   */
  async _validateWithMusicBrainz(songTitle, artist) {
    try {
      const response = await fetch(`${this._serverUrl}/api/musicbrainz-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: songTitle, artist }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const recordings = data.recordings || [];
      const validated = recordings.length > 0 && recordings[0].score >= 80;
      return { validated };
    } catch (e) {
      return { validated: false };
    }
  }

  /**
   * Update the current stage and notify listeners.
   * @private
   */
  _setStage(stage) {
    this.stage = stage;
    this._onStageChange?.(stage, STAGE_LABELS[stage]);
  }
}

/* ── Singleton Export ─────────────────────────────────────────── */

export const songRecognitionEngine = new SongRecognitionEngine();
export { STAGE_LABELS };
export default SongRecognitionEngine;
