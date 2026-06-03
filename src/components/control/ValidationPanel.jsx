/**
 * @fileoverview ValidationPanel — Dual validation display for song submissions.
 *
 * Shows the song currently being validated, the AI confidence level with a
 * color-coded progress bar, host decision buttons (approve / reject), a
 * notes/reason field, and a scrollable history of recent validations.
 *
 * Confidence thresholds:
 *   • 80–100 %  → Green  (auto-approved)
 *   • 50–79 %   → Yellow (needs host review)
 *   •  0–49 %   → Red    (likely invalid)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Music,
  MessageSquare,
  Clock,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

/* ── Confidence Helpers ──────────────────────────────────────── */

/**
 * Return { label, color, gradient, icon } for a confidence value.
 * @param {number} confidence  0–100
 */
const getConfidenceMeta = (confidence) => {
  if (confidence >= 80)
    return {
      label: 'Auto-Approved',
      color: 'var(--success-400)',
      gradient: 'linear-gradient(135deg, var(--success-500), var(--success-400))',
      Icon: CheckCircle,
    };
  if (confidence >= 50)
    return {
      label: 'Needs Review',
      color: 'var(--warning-400)',
      gradient: 'linear-gradient(135deg, var(--warning-500), var(--warning-400))',
      Icon: AlertTriangle,
    };
  return {
    label: 'Likely Invalid',
    color: 'var(--error-400)',
    gradient: 'linear-gradient(135deg, var(--error-500), var(--error-400))',
    Icon: XCircle,
  };
};

/* ── Component ───────────────────────────────────────────────── */

/**
 * ValidationPanel
 *
 * @param {object}  props
 * @param {object|null}  props.pendingSong   — Current song awaiting validation
 *   { id, songTitle, artist?, teamName?, letter? }
 * @param {number}       [props.aiConfidence=0]  — AI confidence 0–100
 * @param {Function}     props.onApprove     — Called with (songId, notes)
 * @param {Function}     props.onReject      — Called with (songId, notes)
 * @param {Array}        [props.history=[]]  — Recent validation entries
 *   [{ id, songTitle, isValid, validatedBy, timestamp }]
 */
const ValidationPanel = ({
  pendingSong = null,
  aiConfidence = 0,
  onApprove,
  onReject,
  history = [],
}) => {
  const [notes, setNotes] = useState('');

  const meta = getConfidenceMeta(aiConfidence);

  const handleApprove = () => {
    if (!pendingSong) return;
    onApprove?.(pendingSong.id, notes);
    setNotes('');
  };

  const handleReject = () => {
    if (!pendingSong) return;
    onReject?.(pendingSong.id, notes);
    setNotes('');
  };

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
    <div className="validation-panel">
      {/* ── Pending Song ────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {pendingSong ? (
          <motion.div
            key={pendingSong.id}
            className="vp-pending"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {/* Song info */}
            <div className="vp-song-info">
              <div className="vp-song-icon">
                <Music size={20} />
              </div>
              <div className="vp-song-details">
                <div className="vp-song-title">{pendingSong.songTitle}</div>
                {pendingSong.artist && (
                  <div className="vp-song-artist">{pendingSong.artist}</div>
                )}
                <div className="vp-song-meta">
                  {pendingSong.teamName && (
                    <span className="badge badge-primary">{pendingSong.teamName}</span>
                  )}
                  {pendingSong.letter && (
                    <span className="badge badge-secondary">Letter: {pendingSong.letter}</span>
                  )}
                </div>
              </div>
            </div>

            {/* AI Confidence */}
            <div className="vp-confidence">
              <div className="vp-confidence-header">
                <div className="vp-confidence-label">
                  <ShieldCheck size={14} />
                  <span>AI Confidence</span>
                </div>
                <div className="vp-confidence-badge" style={{ color: meta.color }}>
                  <meta.Icon size={14} />
                  <span>{meta.label}</span>
                </div>
              </div>

              <div className="vp-confidence-bar-track">
                <motion.div
                  className="vp-confidence-bar-fill"
                  style={{ background: meta.gradient }}
                  initial={{ width: 0 }}
                  animate={{ width: `${aiConfidence}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                />
              </div>

              <div className="vp-confidence-value" style={{ color: meta.color }}>
                {aiConfidence}%
              </div>
            </div>

            {/* Notes / Reason */}
            <div className="vp-notes">
              <div className="vp-notes-label">
                <MessageSquare size={13} />
                <span>Notes / Rejection Reason</span>
              </div>
              <textarea
                className="input vp-notes-input"
                placeholder="Optional: Add notes or rejection reason…"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="vp-actions">
              <button className="btn btn-success btn-lg vp-action-btn" onClick={handleApprove}>
                <ThumbsUp size={18} />
                Approve
              </button>
              <button className="btn btn-danger btn-lg vp-action-btn" onClick={handleReject}>
                <ThumbsDown size={18} />
                Reject
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            className="vp-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ShieldCheck size={32} className="vp-empty-icon" />
            <span>No song pending validation</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Validation History ──────────────────────────────── */}
      {history.length > 0 && (
        <div className="vp-history">
          <div className="vp-history-title">
            <Clock size={13} />
            <span>Recent Validations</span>
          </div>
          <div className="vp-history-list">
            {history.map((entry, idx) => (
              <motion.div
                key={entry.id || idx}
                className={`vp-history-item ${
                  entry.isValid ? 'vp-history-item--approved' : 'vp-history-item--rejected'
                }`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <div className="vp-history-status">
                  {entry.isValid ? (
                    <CheckCircle size={14} className="vp-icon--success" />
                  ) : (
                    <XCircle size={14} className="vp-icon--error" />
                  )}
                </div>
                <div className="vp-history-details">
                  <span className="vp-history-song">{entry.songTitle}</span>
                  <span className="vp-history-by">
                    {entry.validatedBy === 'ai' ? 'AI' : 'Host'} · {formatTime(entry.timestamp)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Scoped Styles ───────────────────────────────────── */}
      <style>{`
        .validation-panel {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        /* Pending Song */
        .vp-pending {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .vp-song-info {
          display: flex;
          gap: var(--space-3);
          align-items: flex-start;
        }
        .vp-song-icon {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-lg);
          background: rgba(124, 58, 237, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary-400);
          flex-shrink: 0;
        }
        .vp-song-details {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          min-width: 0;
        }
        .vp-song-title {
          font-family: var(--font-display);
          font-weight: var(--font-bold);
          font-size: var(--text-lg);
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .vp-song-artist {
          font-size: var(--text-sm);
          color: var(--text-secondary);
        }
        .vp-song-meta {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
          margin-top: var(--space-1);
        }

        /* Confidence */
        .vp-confidence {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .vp-confidence-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .vp-confidence-label {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--text-xs);
          font-weight: var(--font-semibold);
          text-transform: uppercase;
          letter-spacing: var(--tracking-widest);
          color: var(--text-muted);
        }
        .vp-confidence-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: var(--text-xs);
          font-weight: var(--font-semibold);
        }
        .vp-confidence-bar-track {
          width: 100%;
          height: 10px;
          background: var(--surface-3);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .vp-confidence-bar-fill {
          height: 100%;
          border-radius: var(--radius-full);
          position: relative;
        }
        .vp-confidence-bar-fill::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }
        .vp-confidence-value {
          font-family: var(--font-display);
          font-weight: var(--font-extrabold);
          font-size: var(--text-2xl);
          text-align: center;
        }

        /* Notes */
        .vp-notes {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .vp-notes-label {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--text-xs);
          font-weight: var(--font-semibold);
          text-transform: uppercase;
          letter-spacing: var(--tracking-widest);
          color: var(--text-muted);
        }
        .vp-notes-input {
          resize: vertical;
          min-height: 52px;
          font-size: var(--text-sm);
        }

        /* Actions */
        .vp-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-3);
        }
        .vp-action-btn {
          width: 100%;
        }

        /* Empty */
        .vp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-8) var(--space-4);
          color: var(--text-muted);
          font-size: var(--text-sm);
        }
        .vp-empty-icon {
          opacity: 0.3;
        }

        /* History */
        .vp-history {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: var(--space-4);
        }
        .vp-history-title {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--text-xs);
          font-weight: var(--font-semibold);
          text-transform: uppercase;
          letter-spacing: var(--tracking-widest);
          color: var(--text-muted);
          margin-bottom: var(--space-1);
        }
        .vp-history-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
          max-height: 180px;
          overflow-y: auto;
        }
        .vp-history-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-md);
          background: rgba(255,255,255,0.02);
          transition: background var(--duration-fast);
        }
        .vp-history-item:hover {
          background: rgba(255,255,255,0.04);
        }
        .vp-history-item--approved {
          border-left: 2px solid var(--success-500);
        }
        .vp-history-item--rejected {
          border-left: 2px solid var(--error-500);
        }
        .vp-history-status {
          flex-shrink: 0;
        }
        .vp-history-details {
          display: flex;
          flex-direction: column;
          gap: 1px;
          min-width: 0;
        }
        .vp-history-song {
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .vp-history-by {
          font-size: var(--text-xs);
          color: var(--text-muted);
        }
        .vp-icon--success { color: var(--success-400); }
        .vp-icon--error { color: var(--error-400); }
      `}</style>
    </div>
  );
};

export default ValidationPanel;
