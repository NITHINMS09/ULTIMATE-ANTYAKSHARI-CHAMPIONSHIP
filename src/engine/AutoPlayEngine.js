/**
 * @fileoverview AutoPlayEngine — Manages automatic and manual song playback
 * for the Ultimate Antyakshari Championship.
 *
 * Two modes:
 * - AUTO: Song detected → validated → YouTube loads & plays automatically
 * - MANUAL: Song detected → validated → Admin reviews → Admin triggers play
 *
 * Features:
 * - Auto/Manual toggle
 * - Configurable playback duration (10s, 15s, 20s, 30s, full)
 * - Skip-to-chorus (starts at ~30s mark)
 * - YouTube IFrame API integration
 * - Playback state management
 */

/* ── Playback Modes ──────────────────────────────────────────── */

export const PLAYBACK_MODES = {
  AUTO: 'auto',
  MANUAL: 'manual',
};

export const PLAYBACK_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  PLAYING: 'playing',
  PAUSED: 'paused',
  STOPPED: 'stopped',
  ERROR: 'error',
};

/* ── AutoPlayEngine Class ────────────────────────────────────── */

class AutoPlayEngine {
  constructor() {
    /** @type {YT.Player|null} */
    this.player = null;
    this.mode = PLAYBACK_MODES.AUTO;
    this.state = PLAYBACK_STATES.IDLE;
    this.currentVideoId = '';
    this.currentSongTitle = '';
    this.playbackDuration = 15; // seconds
    this.startOffset = 30; // skip to chorus mark
    this.isInitialized = false;

    // Playback timer
    this._playbackTimer = null;
    this._playStartTime = 0;
    this._elapsedTime = 0;

    // Callbacks
    this._onStateChange = null;
    this._onPlaybackEnd = null;
    this._onError = null;

    // YouTube API readiness
    this._ytApiReady = false;
    this._pendingVideoId = null;
  }

  /* ── Initialization ────────────────────────────────────── */

  /**
   * Initialize the YouTube player.
   *
   * @param {string} elementId — DOM element ID for the player
   * @param {Object} options
   * @param {Function} options.onStateChange — callback(state, details)
   * @param {Function} options.onPlaybackEnd — callback()
   * @param {Function} options.onError — callback(error)
   * @returns {Promise<void>}
   */
  async initialize(elementId, options = {}) {
    this._onStateChange = options.onStateChange || null;
    this._onPlaybackEnd = options.onPlaybackEnd || null;
    this._onError = options.onError || null;

    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      await this._loadYouTubeAPI();
    }

    // Wait for API to be ready
    await this._waitForYTReady();

    // Create player
    return new Promise((resolve) => {
      this.player = new window.YT.Player(elementId, {
        height: '200',
        width: '100%',
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          fs: 0,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            this.isInitialized = true;
            console.log('[AutoPlayEngine] YouTube Player initialized.');

            // If there's a pending video, load it now
            if (this._pendingVideoId) {
              this._loadAndPlay(this._pendingVideoId);
              this._pendingVideoId = null;
            }

            resolve();
          },
          onStateChange: (event) => this._handleYTStateChange(event),
          onError: (event) => this._handleYTError(event),
        },
      });
    });
  }

  /* ── Public API ──────────────────────────────────────────── */

  /**
   * Load and play a YouTube video.
   *
   * @param {string} videoId
   * @param {string} songTitle — For display purposes
   * @returns {Promise<void>}
   */
  async playSong(videoId, songTitle = '') {
    if (!videoId) return;

    this.currentVideoId = videoId;
    this.currentSongTitle = songTitle;

    if (!this.isInitialized || !this.player) {
      this._pendingVideoId = videoId;
      return;
    }

    this._loadAndPlay(videoId);
  }

  /**
   * Pause the current playback.
   */
  pause() {
    if (this.player && this.state === PLAYBACK_STATES.PLAYING) {
      this.player.pauseVideo();
      this._clearPlaybackTimer();
      this._setState(PLAYBACK_STATES.PAUSED);
    }
  }

  /**
   * Resume paused playback.
   */
  resume() {
    if (this.player && this.state === PLAYBACK_STATES.PAUSED) {
      this.player.playVideo();
      this._startPlaybackTimer();
      this._setState(PLAYBACK_STATES.PLAYING);
    }
  }

  /**
   * Stop the current playback.
   */
  stop() {
    if (this.player) {
      try {
        this.player.stopVideo();
      } catch (e) { /* ignore */ }
    }
    this._clearPlaybackTimer();
    this._setState(PLAYBACK_STATES.STOPPED);
  }

  /**
   * Replay the current song from the beginning.
   */
  replay() {
    if (this.currentVideoId) {
      this._loadAndPlay(this.currentVideoId);
    }
  }

  /**
   * Skip the current song (stop and signal completion).
   */
  skip() {
    this.stop();
    this._onPlaybackEnd?.();
  }

  /**
   * Set the playback mode.
   * @param {'auto'|'manual'} mode
   */
  setMode(mode) {
    this.mode = mode;
    console.log(`[AutoPlayEngine] Mode set to: ${mode}`);
  }

  /**
   * Set the playback duration (in seconds, 0 = full song).
   * @param {number} seconds
   */
  setPlaybackDuration(seconds) {
    this.playbackDuration = seconds;
    console.log(`[AutoPlayEngine] Playback duration set to: ${seconds}s`);
  }

  /**
   * Set the start offset for skip-to-chorus.
   * @param {number} seconds
   */
  setStartOffset(seconds) {
    this.startOffset = seconds;
  }

  /**
   * Check if auto-play is enabled.
   * @returns {boolean}
   */
  isAutoMode() {
    return this.mode === PLAYBACK_MODES.AUTO;
  }

  /**
   * Get the current playback state and info.
   * @returns {Object}
   */
  getPlaybackInfo() {
    let currentTime = 0;
    let duration = 0;
    let volume = 100;

    if (this.player && this.isInitialized) {
      try {
        currentTime = this.player.getCurrentTime?.() || 0;
        duration = this.player.getDuration?.() || 0;
        volume = this.player.getVolume?.() || 100;
      } catch (e) { /* player may not be ready */ }
    }

    return {
      state: this.state,
      mode: this.mode,
      videoId: this.currentVideoId,
      songTitle: this.currentSongTitle,
      currentTime: Math.round(currentTime),
      duration: Math.round(duration),
      volume,
      playbackDuration: this.playbackDuration,
      startOffset: this.startOffset,
      elapsed: this._elapsedTime,
    };
  }

  /**
   * Set volume (0–100).
   * @param {number} volume
   */
  setVolume(volume) {
    if (this.player && this.isInitialized) {
      try {
        this.player.setVolume(Math.max(0, Math.min(100, volume)));
      } catch (e) { /* ignore */ }
    }
  }

  /**
   * Mute/unmute.
   * @param {boolean} muted
   */
  setMuted(muted) {
    if (this.player && this.isInitialized) {
      try {
        if (muted) this.player.mute();
        else this.player.unMute();
      } catch (e) { /* ignore */ }
    }
  }

  /**
   * Destroy the player and clean up.
   */
  destroy() {
    this._clearPlaybackTimer();
    if (this.player) {
      try { this.player.destroy(); } catch (e) { /* ignore */ }
    }
    this.player = null;
    this.isInitialized = false;
    this._setState(PLAYBACK_STATES.IDLE);
  }

  /* ── Private Methods ─────────────────────────────────────── */

  /**
   * Load and play a video.
   * @private
   */
  _loadAndPlay(videoId) {
    this._setState(PLAYBACK_STATES.LOADING);
    this._clearPlaybackTimer();

    try {
      this.player.loadVideoById({
        videoId,
        startSeconds: this.startOffset,
      });
    } catch (e) {
      console.error('[AutoPlayEngine] Failed to load video:', e);
      this._setState(PLAYBACK_STATES.ERROR);
      this._onError?.(e);
    }
  }

  /**
   * Handle YouTube player state changes.
   * @private
   */
  _handleYTStateChange(event) {
    const stateMap = {
      [-1]: 'unstarted',
      0: 'ended',
      1: 'playing',
      2: 'paused',
      3: 'buffering',
      5: 'cued',
    };

    const stateName = stateMap[event.data] || 'unknown';

    if (event.data === window.YT.PlayerState.PLAYING) {
      this._setState(PLAYBACK_STATES.PLAYING);
      this._startPlaybackTimer();
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      this._setState(PLAYBACK_STATES.PAUSED);
    } else if (event.data === window.YT.PlayerState.ENDED) {
      this._clearPlaybackTimer();
      this._setState(PLAYBACK_STATES.STOPPED);
      this._onPlaybackEnd?.();
    } else if (event.data === window.YT.PlayerState.BUFFERING) {
      this._setState(PLAYBACK_STATES.LOADING);
    }
  }

  /**
   * Handle YouTube player errors.
   * @private
   */
  _handleYTError(event) {
    const errorMessages = {
      2: 'Invalid video ID',
      5: 'HTML5 player error',
      100: 'Video not found',
      101: 'Video not embeddable',
      150: 'Video not embeddable',
    };

    const message = errorMessages[event.data] || `Unknown error (${event.data})`;
    console.error(`[AutoPlayEngine] YouTube error: ${message}`);
    this._setState(PLAYBACK_STATES.ERROR);
    this._onError?.(new Error(message));
  }

  /**
   * Start the playback duration timer.
   * @private
   */
  _startPlaybackTimer() {
    if (this.playbackDuration <= 0) return; // 0 = full song, no timer

    this._playStartTime = Date.now();

    this._playbackTimer = setInterval(() => {
      this._elapsedTime = Math.round((Date.now() - this._playStartTime) / 1000);

      if (this._elapsedTime >= this.playbackDuration) {
        console.log(`[AutoPlayEngine] Playback duration (${this.playbackDuration}s) reached. Stopping.`);
        this.stop();
        this._onPlaybackEnd?.();
      }
    }, 500);
  }

  /**
   * Clear the playback timer.
   * @private
   */
  _clearPlaybackTimer() {
    if (this._playbackTimer) {
      clearInterval(this._playbackTimer);
      this._playbackTimer = null;
    }
    this._elapsedTime = 0;
  }

  /**
   * Update state and notify listeners.
   * @private
   */
  _setState(state) {
    this.state = state;
    this._onStateChange?.(state, this.getPlaybackInfo());
  }

  /**
   * Load the YouTube IFrame API script.
   * @private
   */
  _loadYouTubeAPI() {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve();
        return;
      }

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(tag, firstScript);

      window.onYouTubeIframeAPIReady = () => {
        this._ytApiReady = true;
        resolve();
      };
    });
  }

  /**
   * Wait for YouTube API to be ready.
   * @private
   */
  _waitForYTReady() {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        resolve();
        return;
      }

      const check = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(check);
          resolve();
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(check);
        resolve();
      }, 10000);
    });
  }
}

/* ── Singleton Export ─────────────────────────────────────────── */

export const autoPlayEngine = new AutoPlayEngine();
export default AutoPlayEngine;
