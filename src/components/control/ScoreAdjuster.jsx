/**
 * @fileoverview ScoreAdjuster — Standalone score adjustment component.
 *
 * Displays a team's current score with interactive controls to modify it.
 * Features quick-adjust preset buttons, a custom amount input, and a
 * timestamped change log showing the last N adjustments.
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, TrendingUp, TrendingDown, History } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

/** Quick-adjust presets */
const QUICK_ADJUSTMENTS = [-10, -5, +5, +10];

/**
 * ScoreAdjuster — Full-featured score control for a single team.
 *
 * @param {object}  props
 * @param {object}  props.team       — Team object { id, name, emoji, score, color }
 * @param {number}  [props.maxLog=8] — Max change-log entries to display
 */
const ScoreAdjuster = ({ team, maxLog = 8 }) => {
  const adjustScore = useGameStore((s) => s.adjustScore);
  const [amount, setAmount] = useState(5);
  const [changeLog, setChangeLog] = useState([]);
  const [animatingScore, setAnimatingScore] = useState(false);

  /** Apply a score delta and log it */
  const handleAdjust = useCallback(
    (delta) => {
      adjustScore(team.id, delta);
      setChangeLog((prev) => [
        { delta, timestamp: Date.now() },
        ...prev.slice(0, maxLog - 1),
      ]);
      setAnimatingScore(true);
      setTimeout(() => setAnimatingScore(false), 500);
    },
    [adjustScore, team.id, maxLog]
  );

  /** Format a timestamp to HH:MM:SS */
  const formatTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="score-adjuster" style={{ '--team-color': team.color }}>
      {/* ── Team Header ─────────────────────────────────────── */}
      <div className="score-adjuster__header">
        <span className="score-adjuster__emoji">{team.emoji}</span>
        <span className="score-adjuster__name">{team.name}</span>
      </div>

      {/* ── Current Score ───────────────────────────────────── */}
      <motion.div
        className="score-adjuster__score"
        animate={animatingScore ? { scale: [1, 1.15, 1] } : {}}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        {team.score}
      </motion.div>

      {/* ── Main +/- Controls ───────────────────────────────── */}
      <div className="score-adjuster__controls">
        <button
          className="btn btn-danger btn-icon"
          onClick={() => handleAdjust(-amount)}
          aria-label={`Subtract ${amount}`}
        >
          <Minus size={18} />
        </button>

        <input
          type="number"
          className="input score-adjuster__amount-input"
          value={amount}
          min={1}
          max={100}
          onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
          aria-label="Score adjustment amount"
        />

        <button
          className="btn btn-success btn-icon"
          onClick={() => handleAdjust(+amount)}
          aria-label={`Add ${amount}`}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* ── Quick-Adjust Buttons ────────────────────────────── */}
      <div className="score-adjuster__quick">
        {QUICK_ADJUSTMENTS.map((val) => (
          <button
            key={val}
            className={`btn btn-sm ${val > 0 ? 'btn-ghost score-adjuster__quick-btn--pos' : 'btn-ghost score-adjuster__quick-btn--neg'}`}
            onClick={() => handleAdjust(val)}
          >
            {val > 0 ? `+${val}` : val}
          </button>
        ))}
      </div>

      {/* ── Change Log ──────────────────────────────────────── */}
      <AnimatePresence>
        {changeLog.length > 0 && (
          <motion.div
            className="score-adjuster__log"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="score-adjuster__log-title">
              <History size={12} />
              <span>Recent Changes</span>
            </div>
            <div className="score-adjuster__log-list">
              {changeLog.map((entry, idx) => (
                <motion.div
                  key={entry.timestamp + '-' + idx}
                  className="score-adjuster__log-entry"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <span className="score-adjuster__log-time">{formatTime(entry.timestamp)}</span>
                  <span
                    className={`score-adjuster__log-delta ${
                      entry.delta > 0 ? 'score-adjuster__log-delta--pos' : 'score-adjuster__log-delta--neg'
                    }`}
                  >
                    {entry.delta > 0 ? (
                      <TrendingUp size={12} />
                    ) : (
                      <TrendingDown size={12} />
                    )}
                    {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scoped Styles ───────────────────────────────────── */}
      <style>{`
        .score-adjuster {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-5);
          background: var(--glass-bg);
          border: var(--glass-border);
          border-radius: var(--radius-xl);
          border-top: 3px solid var(--team-color, var(--primary-500));
          transition: all var(--duration-normal) var(--ease-out);
        }
        .score-adjuster:hover {
          background: var(--glass-bg-hover);
        }

        .score-adjuster__header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .score-adjuster__emoji {
          font-size: var(--text-2xl);
        }
        .score-adjuster__name {
          font-family: var(--font-display);
          font-weight: var(--font-bold);
          font-size: var(--text-lg);
          color: var(--text-primary);
        }

        .score-adjuster__score {
          font-family: var(--font-display);
          font-weight: var(--font-black);
          font-size: var(--text-5xl);
          background: var(--gradient-gold);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
        }

        .score-adjuster__controls {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .score-adjuster__amount-input {
          width: 72px;
          text-align: center;
          font-family: var(--font-display);
          font-weight: var(--font-bold);
          font-size: var(--text-lg);
          padding: var(--space-2) var(--space-3);
        }

        .score-adjuster__quick {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
          justify-content: center;
        }
        .score-adjuster__quick-btn--pos {
          color: var(--success-400) !important;
          border-color: rgba(16, 185, 129, 0.2) !important;
        }
        .score-adjuster__quick-btn--neg {
          color: var(--error-400) !important;
          border-color: rgba(239, 68, 68, 0.2) !important;
        }

        .score-adjuster__log {
          width: 100%;
          overflow: hidden;
        }
        .score-adjuster__log-title {
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
        .score-adjuster__log-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          max-height: 140px;
          overflow-y: auto;
        }
        .score-adjuster__log-entry {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-1) var(--space-2);
          background: rgba(255,255,255, 0.02);
          border-radius: var(--radius-sm);
          font-size: var(--text-xs);
        }
        .score-adjuster__log-time {
          color: var(--text-muted);
          font-family: var(--font-mono);
        }
        .score-adjuster__log-delta {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: var(--font-semibold);
          font-family: var(--font-mono);
        }
        .score-adjuster__log-delta--pos { color: var(--success-400); }
        .score-adjuster__log-delta--neg { color: var(--error-400); }
      `}</style>
    </div>
  );
};

export default ScoreAdjuster;
