/**
 * @fileoverview SongDetector — Premium full-screen detection overlay.
 *
 * Shows the real-time song detection pipeline with 6 stage progression,
 * animated waveforms, circular confidence gauge, streaming recognized text,
 * and alternative match cards.
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  Brain,
  Database,
  CheckCircle,
  Video,
  Music,
  XCircle,
  RefreshCw,
  Loader2,
  X,
  Zap,
  Clock,
} from 'lucide-react';

const Youtube = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" style={{ display: 'inline-block', verticalAlign: 'middle' }} {...props}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.051 0 12 0 12s0 3.949.502 5.837a3.002 3.002 0 0 0 2.11 2.107c1.883.511 9.388.511 9.388.511s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107c.502-1.888.502-5.837.502-5.837s0-3.949-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

/* ── Stage Definitions ───────────────────────────────────────── */

const STAGES = [
  { key: 'listening',      emoji: '🎤', label: 'Listening',  Icon: Mic },
  { key: 'detecting',      emoji: '🔍', label: 'Detecting',  Icon: Brain },
  { key: 'searching',      emoji: '🎵', label: 'Searching',  Icon: Database },
  { key: 'validating',     emoji: '✅', label: 'Validating', Icon: CheckCircle },
  { key: 'loading_youtube', emoji: '▶️', label: 'Loading',    Icon: Youtube },
  { key: 'complete',       emoji: '🎶', label: 'Complete',   Icon: Music },
];

const STAGE_ORDER = STAGES.map(s => s.key);

/* ── Helpers ─────────────────────────────────────────────────── */

const getStageIndex = (stage) => {
  const idx = STAGE_ORDER.indexOf(stage);
  return idx >= 0 ? idx : -1;
};

const getConfidenceColor = (confidence) => {
  if (confidence >= 70) return 'var(--success-400)';
  if (confidence >= 50) return 'var(--warning-400)';
  return 'var(--error-400)';
};

const getConfidenceTrailColor = (confidence) => {
  if (confidence >= 70) return 'rgba(52, 211, 153, 0.15)';
  if (confidence >= 50) return 'rgba(251, 191, 36, 0.15)';
  return 'rgba(248, 113, 113, 0.15)';
};

/* ── Circular Gauge (SVG) ────────────────────────────────────── */

const CircularGauge = ({ value = 0, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = getConfidenceColor(value);

  return (
    <svg width={size} height={size} className="sd-gauge">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
          filter: `drop-shadow(0 0 6px ${color})`,
        }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: size * 0.28,
          fontWeight: 800,
        }}
      >
        {value}%
      </text>
    </svg>
  );
};

/* ── Audio Waveform Bars ─────────────────────────────────────── */

const WaveformBars = ({ audioLevel = 0, barCount = 16 }) => (
  <div className="sd-waveform">
    {Array.from({ length: barCount }).map((_, i) => {
      const baseHeight = 15 + Math.sin((i / barCount) * Math.PI) * 35;
      const amplifiedHeight = baseHeight + audioLevel * 40;
      return (
        <motion.div
          key={i}
          className="sd-wave-bar"
          animate={{ height: amplifiedHeight }}
          transition={{
            duration: 0.3 + Math.random() * 0.3,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: i * 0.05,
          }}
        />
      );
    })}
  </div>
);

/* ── Stage Content Renderers ─────────────────────────────────── */

const ListeningStage = ({ audioLevel }) => (
  <div className="sd-stage-content">
    <motion.div
      className="sd-mic-ring"
      animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <motion.div
        className="sd-mic-ring-inner"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
      >
        <Mic size={40} />
      </motion.div>
    </motion.div>
    <WaveformBars audioLevel={audioLevel} />
    <p className="sd-stage-hint">Listening for audio input...</p>
  </div>
);

const DetectingStage = ({ recognizedText }) => (
  <div className="sd-stage-content">
    <motion.div
      className="sd-ai-icon"
      animate={{ rotate: 360 }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
    >
      <Brain size={44} />
    </motion.div>
    <div className="sd-recognized-text-box">
      <span className="sd-recognized-label">
        <Zap size={12} /> Recognized Text
      </span>
      <div className="sd-recognized-text">
        {recognizedText || (
          <span className="sd-text-placeholder">Awaiting speech...</span>
        )}
        <motion.span
          className="sd-text-cursor"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        >
          |
        </motion.span>
      </div>
    </div>
  </div>
);

const SearchingStage = () => (
  <div className="sd-stage-content">
    <div className="sd-search-rings">
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="sd-search-ring"
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeOut',
            delay: i * 0.6,
          }}
        />
      ))}
      <Database size={36} className="sd-search-icon" />
    </div>
    <p className="sd-stage-hint">Matching against 1000+ songs...</p>
  </div>
);

const ValidatingStage = ({ confidence }) => (
  <div className="sd-stage-content">
    <CircularGauge value={confidence} size={140} strokeWidth={10} />
    <p className="sd-stage-hint">Validating match confidence...</p>
  </div>
);

const LoadingYoutubeStage = () => (
  <div className="sd-stage-content">
    <motion.div
      className="sd-yt-icon"
      animate={{ scale: [1, 1.08, 1] }}
      transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Youtube size={44} />
    </motion.div>
    <div className="sd-yt-bar-track">
      <motion.div
        className="sd-yt-bar-fill"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity }}
      />
    </div>
    <p className="sd-stage-hint">Loading YouTube playback...</p>
  </div>
);

const CompleteStage = ({ detectionResult, confidence, confidenceLabel, onApprove, onReject, onSelectAlternative }) => (
  <div className="sd-stage-content sd-complete">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <CheckCircle size={48} className="sd-complete-icon" />
    </motion.div>

    {detectionResult && (
      <>
        <motion.div
          className="sd-result-song"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {detectionResult.songName || 'Unknown Song'}
        </motion.div>

        <div className="sd-result-meta">
          <CircularGauge value={confidence} size={80} strokeWidth={6} />
          {confidenceLabel && (
            <span
              className="badge sd-result-badge"
              style={{
                color: confidenceLabel.color,
                borderColor: confidenceLabel.color,
                background: `${confidenceLabel.color}22`,
              }}
            >
              {confidenceLabel.emoji} {confidenceLabel.label}
            </span>
          )}
        </div>

        {/* Host Override Actions */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px', zIndex: 10 }}>
          <button 
            onClick={onApprove} 
            className="btn btn-success" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}
          >
            <CheckCircle size={14} /> Approve Match
          </button>
          <button 
            onClick={onReject} 
            className="btn btn-danger" 
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-sm)', cursor: 'pointer' }}
          >
            <XCircle size={14} /> Reject Match
          </button>
        </div>

        {detectionResult.alternatives?.length > 0 && (
          <motion.div
            className="sd-alternatives"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ marginTop: '20px', width: '100%', maxWidth: '400px' }}
          >
            <span className="sd-alt-title" style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Select Correct Song Candidate:
            </span>
            <div className="sd-alt-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {detectionResult.alternatives.slice(0, 5).map((alt, idx) => (
                <motion.div
                  key={idx}
                  className="sd-alt-card"
                  onClick={() => onSelectAlternative?.(alt)}
                  style={{ 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '8px 12px', 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    borderRadius: '6px',
                    transition: 'all 0.2s'
                  }}
                  whileHover={{ background: 'rgba(255,255,255,0.08)', scale: 1.02 }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + idx * 0.08 }}
                >
                  <Music size={14} className="sd-alt-icon" style={{ marginRight: '8px', color: 'var(--primary-400)' }} />
                  <span className="sd-alt-name" style={{ flex: 1, textAlign: 'left', fontSize: 'var(--text-xs)' }}>
                    {alt.songName || alt.title} <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>— {alt.artist}</span>
                  </span>
                  <span
                    className="sd-alt-conf"
                    style={{ color: getConfidenceColor(alt.confidence), fontWeight: 'bold', fontSize: 'var(--text-xs)' }}
                  >
                    {alt.confidence}%
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </>
    )}
  </div>
);

const FailedStage = () => (
  <div className="sd-stage-content sd-failed">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      <XCircle size={48} className="sd-failed-icon" />
    </motion.div>
    <p className="sd-failed-title">Detection Failed</p>
    <p className="sd-failed-hint">
      <RefreshCw size={14} /> Try again or use manual search
    </p>
  </div>
);

/* ── Main Component ──────────────────────────────────────────── */

const SongDetector = ({
  stage = 'idle',
  stageInfo,
  recognizedText = '',
  confidence = 0,
  confidenceLabel,
  detectionResult = null,
  audioLevel = 0,
  currentAttempt = 1,
  maxAttempts = 5,
  elapsed = 0,
  onClose,
  onApprove,
  onReject,
  onSelectAlternative,
}) => {
  const currentIdx = getStageIndex(stage);

  const stageContent = useMemo(() => {
    switch (stage) {
      case 'listening':
        return <ListeningStage audioLevel={audioLevel} />;
      case 'detecting':
        return <DetectingStage recognizedText={recognizedText} />;
      case 'searching':
        return <SearchingStage />;
      case 'validating':
        return <ValidatingStage confidence={confidence} />;
      case 'loading_youtube':
        return <LoadingYoutubeStage />;
      case 'complete':
        return (
          <CompleteStage
            detectionResult={detectionResult}
            confidence={confidence}
            confidenceLabel={confidenceLabel}
            onApprove={onApprove}
            onReject={onReject}
            onSelectAlternative={onSelectAlternative}
          />
        );
      case 'failed':
        return <FailedStage />;
      default:
        return null;
    }
  }, [stage, audioLevel, recognizedText, confidence, detectionResult, confidenceLabel, onApprove, onReject, onSelectAlternative]);

  if (stage === 'idle') return null;

  return (
    <AnimatePresence>
      <motion.div
        className="sd-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Close button */}
        <button className="sd-close" onClick={onClose} title="Close">
          <X size={20} />
        </button>

        {/* Header info */}
        <div className="sd-header">
          {stageInfo && (
            <motion.div
              className="sd-header-info"
              key={stageInfo.text}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="sd-header-emoji">{stageInfo.emoji}</span>
              <span className="sd-header-text">{stageInfo.text}</span>
            </motion.div>
          )}
          {stageInfo?.description && (
            <p className="sd-header-desc">{stageInfo.description}</p>
          )}
        </div>

        {/* Stage progression pills */}
        <div className="sd-stages">
          {STAGES.map((s, idx) => {
            const isActive = s.key === stage;
            const isPast = idx < currentIdx;
            const isFuture = idx > currentIdx;
            return (
              <motion.div
                key={s.key}
                className={`sd-stage-pill ${isActive ? 'sd-stage-pill--active' : ''} ${isPast ? 'sd-stage-pill--done' : ''} ${isFuture ? 'sd-stage-pill--future' : ''}`}
                layout
              >
                <span className="sd-pill-emoji">{s.emoji}</span>
                <span className="sd-pill-label">{s.label}</span>
                {isActive && (
                  <motion.div
                    className="sd-pill-glow"
                    layoutId="pill-glow"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Center content */}
        <div className="sd-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={stage}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {stageContent}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom bar — Attempts + Timer */}
        <div className="sd-bottom">
          <div className="sd-timer">
            <Clock size={13} />
            <span>{elapsed}s</span>
          </div>
          <div className="sd-attempts">
            {Array.from({ length: maxAttempts }).map((_, i) => (
              <div
                key={i}
                className={`sd-attempt-dot ${i < currentAttempt ? 'sd-attempt-dot--filled' : ''} ${i === currentAttempt - 1 ? 'sd-attempt-dot--current' : ''}`}
              />
            ))}
            <span className="sd-attempt-label">
              Attempt {currentAttempt}/{maxAttempts}
            </span>
          </div>
        </div>

        {/* ── Scoped Styles ─────────────────────────────────── */}
        <style>{`
          .sd-overlay {
            position: fixed;
            inset: 0;
            z-index: var(--z-modal);
            background: rgba(5, 5, 20, 0.92);
            backdrop-filter: blur(30px);
            -webkit-backdrop-filter: blur(30px);
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: var(--space-6);
            overflow-y: auto;
          }

          .sd-close {
            position: absolute;
            top: var(--space-4);
            right: var(--space-4);
            width: 40px;
            height: 40px;
            border-radius: var(--radius-full);
            background: var(--glass-bg);
            border: var(--glass-border);
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all var(--duration-fast);
            z-index: 10;
          }
          .sd-close:hover {
            background: var(--glass-bg-hover);
            color: var(--text-primary);
            transform: scale(1.05);
          }

          /* ── Header ──────────────────────────────────────── */
          .sd-header {
            text-align: center;
            margin-bottom: var(--space-6);
          }
          .sd-header-info {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-2);
          }
          .sd-header-emoji {
            font-size: var(--text-2xl);
          }
          .sd-header-text {
            font-family: var(--font-display);
            font-size: var(--text-2xl);
            font-weight: var(--font-bold);
            color: var(--text-primary);
          }
          .sd-header-desc {
            margin-top: var(--space-1);
            font-size: var(--text-sm);
            color: var(--text-secondary);
          }

          /* ── Stage Pills ────────────────────────────────── */
          .sd-stages {
            display: flex;
            gap: var(--space-2);
            flex-wrap: wrap;
            justify-content: center;
            margin-bottom: var(--space-8);
          }
          .sd-stage-pill {
            position: relative;
            display: flex;
            align-items: center;
            gap: var(--space-1);
            padding: var(--space-1) var(--space-3);
            border-radius: var(--radius-full);
            font-size: var(--text-xs);
            font-weight: var(--font-semibold);
            background: var(--glass-bg);
            border: 1px solid rgba(255,255,255,0.06);
            color: var(--text-muted);
            transition: all var(--duration-normal);
            overflow: hidden;
          }
          .sd-pill-emoji { font-size: var(--text-sm); }
          .sd-pill-label { position: relative; z-index: 1; }
          .sd-pill-glow {
            position: absolute;
            inset: 0;
            border-radius: var(--radius-full);
            background: rgba(124, 58, 237, 0.2);
            border: 1px solid rgba(124, 58, 237, 0.5);
          }
          .sd-stage-pill--active {
            color: var(--primary-300);
            animation: pulse 2s ease-in-out infinite;
          }
          .sd-stage-pill--done {
            color: var(--success-400);
            border-color: rgba(52, 211, 153, 0.25);
            background: rgba(52, 211, 153, 0.08);
          }
          .sd-stage-pill--future {
            opacity: 0.4;
          }

          /* ── Center Content ─────────────────────────────── */
          .sd-center {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            max-width: 600px;
          }
          .sd-stage-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: var(--space-6);
            width: 100%;
          }
          .sd-stage-hint {
            font-size: var(--text-sm);
            color: var(--text-secondary);
            text-align: center;
          }

          /* ── Listening ──────────────────────────────────── */
          .sd-mic-ring {
            width: 110px;
            height: 110px;
            border-radius: 50%;
            background: rgba(124, 58, 237, 0.12);
            border: 2px solid rgba(124, 58, 237, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .sd-mic-ring-inner {
            width: 78px;
            height: 78px;
            border-radius: 50%;
            background: rgba(124, 58, 237, 0.18);
            border: 1px solid rgba(124, 58, 237, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary-400);
          }

          /* ── Waveform ───────────────────────────────────── */
          .sd-waveform {
            display: flex;
            align-items: flex-end;
            gap: 3px;
            height: 60px;
          }
          .sd-wave-bar {
            width: 4px;
            border-radius: 2px;
            background: var(--gradient-primary);
            min-height: 4px;
          }

          /* ── Detecting ──────────────────────────────────── */
          .sd-ai-icon {
            width: 90px;
            height: 90px;
            border-radius: 50%;
            background: rgba(6, 182, 212, 0.12);
            border: 2px solid rgba(6, 182, 212, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--secondary-400);
          }
          .sd-recognized-text-box {
            width: 100%;
            max-width: 480px;
            background: var(--glass-bg);
            border: var(--glass-border);
            border-radius: var(--radius-lg);
            padding: var(--space-4);
          }
          .sd-recognized-label {
            display: flex;
            align-items: center;
            gap: var(--space-1);
            font-size: var(--text-xs);
            font-weight: var(--font-semibold);
            text-transform: uppercase;
            letter-spacing: var(--tracking-widest);
            color: var(--text-muted);
            margin-bottom: var(--space-2);
          }
          .sd-recognized-text {
            font-family: var(--font-mono);
            font-size: var(--text-base);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 1.6em;
          }
          .sd-text-placeholder {
            color: var(--text-muted);
            font-style: italic;
          }
          .sd-text-cursor {
            color: var(--primary-400);
            font-weight: var(--font-bold);
          }

          /* ── Searching ──────────────────────────────────── */
          .sd-search-rings {
            position: relative;
            width: 100px;
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .sd-search-ring {
            position: absolute;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 2px solid var(--primary-400);
          }
          .sd-search-icon {
            position: relative;
            z-index: 1;
            color: var(--primary-400);
          }

          /* ── Gauge ──────────────────────────────────────── */
          .sd-gauge {
            display: block;
          }

          /* ── YouTube Loading ────────────────────────────── */
          .sd-yt-icon {
            width: 90px;
            height: 90px;
            border-radius: var(--radius-xl);
            background: rgba(239, 68, 68, 0.12);
            border: 2px solid rgba(239, 68, 68, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--error-400);
          }
          .sd-yt-bar-track {
            width: 100%;
            max-width: 320px;
            height: 6px;
            background: var(--surface-3);
            border-radius: var(--radius-full);
            overflow: hidden;
          }
          .sd-yt-bar-fill {
            height: 100%;
            border-radius: var(--radius-full);
            background: linear-gradient(90deg, var(--error-500), var(--accent-400));
          }

          /* ── Complete ───────────────────────────────────── */
          .sd-complete {
            gap: var(--space-4);
          }
          .sd-complete-icon {
            color: var(--success-400);
            filter: drop-shadow(0 0 12px rgba(52, 211, 153, 0.4));
          }
          .sd-result-song {
            font-family: var(--font-display);
            font-size: var(--text-3xl);
            font-weight: var(--font-extrabold);
            color: var(--text-primary);
            text-align: center;
            line-height: var(--leading-tight);
          }
          .sd-result-meta {
            display: flex;
            align-items: center;
            gap: var(--space-4);
          }
          .sd-result-badge {
            font-size: var(--text-sm);
            padding: var(--space-2) var(--space-3);
            border: 1px solid;
            border-radius: var(--radius-full);
          }

          /* ── Alternatives ───────────────────────────────── */
          .sd-alternatives {
            width: 100%;
            max-width: 420px;
          }
          .sd-alt-title {
            display: block;
            font-size: var(--text-xs);
            font-weight: var(--font-semibold);
            text-transform: uppercase;
            letter-spacing: var(--tracking-widest);
            color: var(--text-muted);
            margin-bottom: var(--space-2);
          }
          .sd-alt-list {
            display: flex;
            flex-direction: column;
            gap: var(--space-1);
          }
          .sd-alt-card {
            display: flex;
            align-items: center;
            gap: var(--space-2);
            padding: var(--space-2) var(--space-3);
            background: rgba(255,255,255,0.03);
            border: 1px solid rgba(255,255,255,0.05);
            border-radius: var(--radius-md);
            transition: background var(--duration-fast);
          }
          .sd-alt-card:hover {
            background: rgba(255,255,255,0.06);
          }
          .sd-alt-icon {
            color: var(--text-muted);
            flex-shrink: 0;
          }
          .sd-alt-name {
            flex: 1;
            font-size: var(--text-sm);
            font-weight: var(--font-medium);
            color: var(--text-primary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .sd-alt-conf {
            font-family: var(--font-mono);
            font-size: var(--text-xs);
            font-weight: var(--font-bold);
            flex-shrink: 0;
          }

          /* ── Failed ─────────────────────────────────────── */
          .sd-failed {
            gap: var(--space-4);
          }
          .sd-failed-icon {
            color: var(--error-400);
            filter: drop-shadow(0 0 12px rgba(248, 113, 113, 0.4));
          }
          .sd-failed-title {
            font-family: var(--font-display);
            font-size: var(--text-2xl);
            font-weight: var(--font-bold);
            color: var(--error-400);
          }
          .sd-failed-hint {
            display: flex;
            align-items: center;
            gap: var(--space-2);
            font-size: var(--text-sm);
            color: var(--text-secondary);
          }

          /* ── Bottom ─────────────────────────────────────── */
          .sd-bottom {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            max-width: 500px;
            margin-top: var(--space-6);
          }
          .sd-timer {
            display: flex;
            align-items: center;
            gap: var(--space-1);
            font-family: var(--font-mono);
            font-size: var(--text-sm);
            color: var(--text-tertiary);
          }
          .sd-attempts {
            display: flex;
            align-items: center;
            gap: var(--space-2);
          }
          .sd-attempt-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--surface-3);
            transition: all var(--duration-normal);
          }
          .sd-attempt-dot--filled {
            background: var(--primary-500);
          }
          .sd-attempt-dot--current {
            background: var(--primary-400);
            box-shadow: 0 0 8px rgba(124, 58, 237, 0.5);
            animation: pulse 1.5s ease-in-out infinite;
          }
          .sd-attempt-label {
            font-size: var(--text-xs);
            color: var(--text-muted);
            margin-left: var(--space-1);
          }

          /* ── Responsive ─────────────────────────────────── */
          @media (max-width: 640px) {
            .sd-stages {
              gap: var(--space-1);
            }
            .sd-pill-label {
              display: none;
            }
            .sd-stage-pill {
              padding: var(--space-1) var(--space-2);
            }
            .sd-result-song {
              font-size: var(--text-2xl);
            }
            .sd-mic-ring {
              width: 90px;
              height: 90px;
            }
            .sd-mic-ring-inner {
              width: 62px;
              height: 62px;
            }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};

export default SongDetector;
