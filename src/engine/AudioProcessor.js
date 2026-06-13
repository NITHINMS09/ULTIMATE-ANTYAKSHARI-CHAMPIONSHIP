/**
 * @fileoverview AudioProcessor — Web Audio API-based audio preprocessing
 * for the Ultimate Antyakshari Championship.
 *
 * Provides:
 * - Noise gate (suppress background below threshold)
 * - High-pass filter (remove low-frequency crowd rumble)
 * - Dynamic compressor (normalize volume levels)
 * - Voice Activity Detection (detect singing vs silence)
 * - Real-time audio level metering
 * - Echo cancellation hints
 */

/* ── Constants ──────────────────────────────────────────────── */

const NOISE_GATE_THRESHOLD = -50;       // dB — below this = silence
const HIGH_PASS_FREQUENCY = 100;        // Hz — cut rumble below 100Hz
const COMPRESSOR_THRESHOLD = -24;       // dB
const COMPRESSOR_RATIO = 4;             // 4:1 compression
const COMPRESSOR_ATTACK = 0.003;        // seconds
const COMPRESSOR_RELEASE = 0.25;        // seconds
const VAD_ENERGY_THRESHOLD = 0.015;     // RMS energy threshold for voice
const VAD_ZERO_CROSSING_RATE = 0.1;     // Zero-crossing rate threshold
const LEVEL_SMOOTHING = 0.8;            // Smoothing factor for level meter

/* ── AudioProcessor Class ────────────────────────────────────── */

export class AudioProcessor {
  constructor() {
    /** @type {AudioContext|null} */
    this.audioContext = null;
    /** @type {MediaStream|null} */
    this.stream = null;
    /** @type {MediaStreamAudioSourceNode|null} */
    this.sourceNode = null;
    /** @type {AnalyserNode|null} */
    this.analyserNode = null;
    /** @type {BiquadFilterNode|null} */
    this.highPassFilter = null;
    /** @type {DynamicsCompressorNode|null} */
    this.compressor = null;
    /** @type {GainNode|null} */
    this.noiseGate = null;
    /** @type {MediaStreamDestination|null} */
    this.destination = null;

    // State
    this._isActive = false;
    this._currentLevel = 0;
    this._peakLevel = 0;
    this._isVoiceActive = false;
    this._levelAnimationFrame = null;
    this._levelHistory = [];
    this._onLevelChange = null;
    this._onVoiceActivity = null;
    this._noiseFloor = -60;
    this._clippingCount = 0;
  }

  /* ── Public API ──────────────────────────────────────────── */

  /**
   * Initialize the audio processing pipeline from a microphone stream.
   * @param {Object} [options]
   * @param {Function} [options.onLevelChange] — callback(level: 0-1, dB: number)
   * @param {Function} [options.onVoiceActivity] — callback(isActive: boolean)
   * @param {boolean} [options.echoCancellation=true]
   * @param {boolean} [options.noiseSuppression=true]
   * @returns {Promise<MediaStream>} Processed audio stream
   */
  async initialize(options = {}) {
    const {
      onLevelChange = null,
      onVoiceActivity = null,
      echoCancellation = true,
      noiseSuppression = true,
    } = options;

    this._onLevelChange = onLevelChange;
    this._onVoiceActivity = onVoiceActivity;

    try {
      // Request microphone with browser-level processing hints
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation,
          noiseSuppression,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 44100,
        },
      });

      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 44100,
      });

      // Source from microphone
      this.sourceNode = this.audioContext.createMediaStreamSource(this.stream);

      // High-pass filter — removes low rumble (crowd, AC hum, etc.)
      this.highPassFilter = this.audioContext.createBiquadFilter();
      this.highPassFilter.type = 'highpass';
      this.highPassFilter.frequency.value = HIGH_PASS_FREQUENCY;
      this.highPassFilter.Q.value = 0.7;

      // Dynamic compressor — normalizes volume for quiet/loud singers
      this.compressor = this.audioContext.createDynamicsCompressor();
      this.compressor.threshold.value = COMPRESSOR_THRESHOLD;
      this.compressor.ratio.value = COMPRESSOR_RATIO;
      this.compressor.attack.value = COMPRESSOR_ATTACK;
      this.compressor.release.value = COMPRESSOR_RELEASE;
      this.compressor.knee.value = 10;

      // Noise gate via gain node
      this.noiseGate = this.audioContext.createGain();
      this.noiseGate.gain.value = 1.0;

      // Analyser for level metering and VAD
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 2048;
      this.analyserNode.smoothingTimeConstant = LEVEL_SMOOTHING;

      // Create destination for processed output
      this.destination = this.audioContext.createMediaStreamDestination();

      // Build the processing chain:
      // Mic → HighPass → Compressor → NoiseGate → Analyser → Destination
      this.sourceNode.connect(this.highPassFilter);
      this.highPassFilter.connect(this.compressor);
      this.compressor.connect(this.noiseGate);
      this.noiseGate.connect(this.analyserNode);
      this.analyserNode.connect(this.destination);

      this._isActive = true;
      this._startLevelMonitoring();

      return this.destination.stream;
    } catch (error) {
      console.error('[AudioProcessor] Initialization failed:', error);
      this.destroy();
      throw error;
    }
  }

  /**
   * Get the processed output stream (for MediaRecorder).
   * @returns {MediaStream|null}
   */
  getProcessedStream() {
    return this.destination?.stream || this.stream;
  }

  /**
   * Get the raw input stream.
   * @returns {MediaStream|null}
   */
  getRawStream() {
    return this.stream;
  }

  /**
   * Get current audio metrics.
   * @returns {{ level: number, dB: number, peak: number, isVoiceActive: boolean, noiseFloor: number, isClipping: boolean, quality: string }}
   */
  getMetrics() {
    return {
      level: this._currentLevel,
      dB: this._levelTodB(this._currentLevel),
      peak: this._peakLevel,
      isVoiceActive: this._isVoiceActive,
      noiseFloor: this._noiseFloor,
      isClipping: this._currentLevel > 0.95,
      quality: this._getQualityLabel(),
    };
  }

  /**
   * Get frequency data for visualization.
   * @returns {Uint8Array}
   */
  getFrequencyData() {
    if (!this.analyserNode) return new Uint8Array(0);
    const data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(data);
    return data;
  }

  /**
   * Get time-domain waveform data.
   * @returns {Uint8Array}
   */
  getWaveformData() {
    if (!this.analyserNode) return new Uint8Array(0);
    const data = new Uint8Array(this.analyserNode.fftSize);
    this.analyserNode.getByteTimeDomainData(data);
    return data;
  }

  /**
   * Dynamically adjust noise gate threshold.
   * @param {number} thresholdDb
   */
  setNoiseGateThreshold(thresholdDb) {
    // The noise gate is simulated by monitoring level and muting gain
    // This value is checked in the level monitoring loop
    this._noiseGateThreshold = thresholdDb;
  }

  /**
   * Check if audio processor is active.
   * @returns {boolean}
   */
  isActive() {
    return this._isActive;
  }

  /**
   * Get microphone device info.
   * @returns {{ deviceId: string, label: string }|null}
   */
  getDeviceInfo() {
    if (!this.stream) return null;
    const track = this.stream.getAudioTracks()[0];
    if (!track) return null;
    const settings = track.getSettings();
    return {
      deviceId: settings.deviceId || 'unknown',
      label: track.label || 'Microphone',
      sampleRate: settings.sampleRate || 44100,
      channelCount: settings.channelCount || 1,
      echoCancellation: settings.echoCancellation,
      noiseSuppression: settings.noiseSuppression,
    };
  }

  /**
   * Destroy all audio processing resources.
   */
  destroy() {
    this._isActive = false;

    // Cancel level monitoring
    if (this._levelAnimationFrame) {
      cancelAnimationFrame(this._levelAnimationFrame);
      this._levelAnimationFrame = null;
    }

    // Disconnect nodes
    try {
      this.sourceNode?.disconnect();
      this.highPassFilter?.disconnect();
      this.compressor?.disconnect();
      this.noiseGate?.disconnect();
      this.analyserNode?.disconnect();
    } catch (e) { /* ignore disconnect errors */ }

    // Stop all tracks
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
    }

    this.audioContext = null;
    this.sourceNode = null;
    this.analyserNode = null;
    this.highPassFilter = null;
    this.compressor = null;
    this.noiseGate = null;
    this.destination = null;
    this._currentLevel = 0;
    this._peakLevel = 0;
    this._isVoiceActive = false;
    this._levelHistory = [];
  }

  /* ── Private Methods ─────────────────────────────────────── */

  /**
   * Start the level monitoring loop (runs via requestAnimationFrame).
   * @private
   */
  _startLevelMonitoring() {
    const monitor = () => {
      if (!this._isActive || !this.analyserNode) return;

      const bufferLength = this.analyserNode.fftSize;
      const dataArray = new Float32Array(bufferLength);
      this.analyserNode.getFloatTimeDomainData(dataArray);

      // Calculate RMS level
      let sumSquares = 0;
      let zeroCrossings = 0;
      for (let i = 0; i < bufferLength; i++) {
        sumSquares += dataArray[i] * dataArray[i];
        if (i > 0 && ((dataArray[i] >= 0 && dataArray[i - 1] < 0) ||
                       (dataArray[i] < 0 && dataArray[i - 1] >= 0))) {
          zeroCrossings++;
        }
      }
      const rms = Math.sqrt(sumSquares / bufferLength);
      const zeroCrossingRate = zeroCrossings / bufferLength;

      // Smooth level
      this._currentLevel = this._currentLevel * 0.7 + rms * 0.3;

      // Track peak
      if (this._currentLevel > this._peakLevel) {
        this._peakLevel = this._currentLevel;
      } else {
        this._peakLevel *= 0.999; // slow decay
      }

      // Clipping detection
      if (this._currentLevel > 0.95) {
        this._clippingCount++;
      }

      // Voice Activity Detection
      const prevVoiceActive = this._isVoiceActive;
      this._isVoiceActive = rms > VAD_ENERGY_THRESHOLD && zeroCrossingRate > VAD_ZERO_CROSSING_RATE;

      // Update noise floor estimate (running minimum when no voice)
      if (!this._isVoiceActive) {
        const currentdB = this._levelTodB(rms);
        this._noiseFloor = this._noiseFloor * 0.99 + currentdB * 0.01;
      }

      // Apply noise gate
      if (this.noiseGate) {
        const currentdB = this._levelTodB(rms);
        const threshold = this._noiseGateThreshold || NOISE_GATE_THRESHOLD;
        if (currentdB < threshold) {
          this.noiseGate.gain.setTargetAtTime(0.01, this.audioContext.currentTime, 0.01);
        } else {
          this.noiseGate.gain.setTargetAtTime(1.0, this.audioContext.currentTime, 0.01);
        }
      }

      // Store level history for trend analysis
      this._levelHistory.push(this._currentLevel);
      if (this._levelHistory.length > 100) {
        this._levelHistory.shift();
      }

      // Emit callbacks
      if (this._onLevelChange) {
        this._onLevelChange(this._currentLevel, this._levelTodB(this._currentLevel));
      }

      if (this._onVoiceActivity && prevVoiceActive !== this._isVoiceActive) {
        this._onVoiceActivity(this._isVoiceActive);
      }

      this._levelAnimationFrame = requestAnimationFrame(monitor);
    };

    this._levelAnimationFrame = requestAnimationFrame(monitor);
  }

  /**
   * Convert linear amplitude to decibels.
   * @param {number} level — 0 to 1
   * @returns {number} dB value
   * @private
   */
  _levelTodB(level) {
    if (level <= 0) return -Infinity;
    return 20 * Math.log10(level);
  }

  /**
   * Get a human-readable audio quality label.
   * @returns {'excellent'|'good'|'fair'|'poor'|'silent'}
   * @private
   */
  _getQualityLabel() {
    const dB = this._levelTodB(this._currentLevel);
    if (dB < -60) return 'silent';
    if (dB < -40) return 'poor';
    if (dB < -20) return 'fair';
    if (dB < -6) return 'good';
    return 'excellent';
  }
}

/* ── Singleton Instance ──────────────────────────────────────── */

export const audioProcessor = new AudioProcessor();
export default AudioProcessor;
