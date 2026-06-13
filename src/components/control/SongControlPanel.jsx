/**
 * @fileoverview SongControlPanel — Admin song control center component.
 *
 * Provides: Play/Pause/Stop/Replay/Skip, Approve/Reject detection,
 * manual search, auto-play toggle, detection mode, playback duration,
 * volume, and all-languages mode toggle.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, Square, RotateCcw, SkipForward, CheckCircle, XCircle,
  Search, Volume2, VolumeX, Music, Settings, Globe, Zap, Radio,
} from 'lucide-react';
import { searchSongs } from '../../data/songDatabase';

export default function SongControlPanel({
  playbackState = 'idle',
  playbackMode = 'auto',
  currentDetection = null,
  autoPlayEnabled = true,
  allLanguagesMode = true,
  playbackDuration = 15,
  volume = 80,
  onPlay,
  onPause,
  onResume,
  onStop,
  onReplay,
  onSkip,
  onApprove,
  onReject,
  onManualSearch,
  onToggleAutoPlay,
  onToggleAllLanguages,
  onSetPlaybackMode,
  onSetPlaybackDuration,
  onSetVolume,
  onCorrectSong,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      setSearchResults(searchSongs(searchQuery, 6));
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSelectSong = (song) => {
    onManualSearch?.(song.title);
    setSearchQuery('');
    setShowSearch(false);
    setSearchResults([]);
  };

  const isPlaying = playbackState === 'playing';
  const isPaused = playbackState === 'paused';
  const isLoading = playbackState === 'loading';
  const isIdle = playbackState === 'idle' || playbackState === 'stopped';

  const DURATIONS = [
    { label: '10s', value: 10 },
    { label: '15s', value: 15 },
    { label: '20s', value: 20 },
    { label: '30s', value: 30 },
    { label: 'Full', value: 0 },
  ];

  return (
    <div className="song-control-panel">
      {/* Header */}
      <div className="song-control-panel-title">
        <Music size={13} /> Song Control Center
      </div>

      {/* Current Detection Card */}
      {currentDetection && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-3)',
            marginBottom: 'var(--space-3)',
          }}
        >
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap size={10} /> Detected Song
          </div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>
            {currentDetection.songName || 'Unknown'}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
            {currentDetection.artist || ''} {currentDetection.movie ? `• ${currentDetection.movie}` : ''}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span className={`language-badge language-badge--${currentDetection.language || 'all'}`}>
              {currentDetection.language || 'unknown'}
            </span>
            <span style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-bold)',
              color: currentDetection.confidence >= 70 ? 'var(--success-400)' :
                     currentDetection.confidence >= 50 ? 'var(--warning-400)' : 'var(--error-400)',
            }}>
              {currentDetection.confidence}% confidence
            </span>
          </div>

          {/* Approve / Reject */}
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button className="song-control-btn song-control-btn--success" onClick={onApprove}
              style={{ flex: 1, width: 'auto', gap: 4, fontSize: 11, borderRadius: 6 }} title="Approve">
              <CheckCircle size={14} /> Approve
            </button>
            <button className="song-control-btn song-control-btn--danger" onClick={onReject}
              style={{ flex: 1, width: 'auto', gap: 4, fontSize: 11, borderRadius: 6 }} title="Reject">
              <XCircle size={14} /> Reject
            </button>
          </div>
        </motion.div>
      )}

      {/* Playback Controls */}
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
          Playback
        </div>
        <div className="song-control-buttons">
          {isIdle || isLoading ? (
            <button className="song-control-btn song-control-btn--primary" onClick={onPlay}
              disabled={isLoading} title="Play">
              {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Radio size={16} /></motion.div> : <Play size={16} />}
            </button>
          ) : isPaused ? (
            <button className="song-control-btn song-control-btn--primary" onClick={onResume} title="Resume">
              <Play size={16} />
            </button>
          ) : (
            <button className="song-control-btn" onClick={onPause} title="Pause">
              <Pause size={16} />
            </button>
          )}
          <button className="song-control-btn" onClick={onStop} disabled={isIdle} title="Stop">
            <Square size={16} />
          </button>
          <button className="song-control-btn" onClick={onReplay} disabled={isIdle} title="Replay">
            <RotateCcw size={16} />
          </button>
          <button className="song-control-btn" onClick={onSkip} title="Skip Song">
            <SkipForward size={16} />
          </button>
        </div>
      </div>

      {/* Volume */}
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          {volume === 0 ? <VolumeX size={12} style={{ color: 'var(--text-muted)' }} /> : <Volume2 size={12} style={{ color: 'var(--text-muted)' }} />}
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{volume}%</span>
        </div>
        <input
          type="range"
          className="volume-slider"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => onSetVolume?.(Number(e.target.value))}
        />
      </div>

      {/* Auto-Play Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)', padding: 'var(--space-2) 0' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Auto-Play</span>
        <div
          className={`autoplay-toggle ${autoPlayEnabled ? 'autoplay-toggle--active' : ''}`}
          onClick={onToggleAutoPlay}
        >
          <div className="autoplay-toggle-knob" />
        </div>
      </div>

      {/* All Languages Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)', padding: 'var(--space-2) 0' }}>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Globe size={12} /> All Languages
        </span>
        <div
          className={`autoplay-toggle ${allLanguagesMode ? 'autoplay-toggle--active' : ''}`}
          onClick={onToggleAllLanguages}
        >
          <div className="autoplay-toggle-knob" />
        </div>
      </div>

      {/* Detection Mode */}
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
          Detection Mode
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['auto', 'manual'].map(mode => (
            <button
              key={mode}
              onClick={() => onSetPlaybackMode?.(mode)}
              className={`duration-pill ${playbackMode === mode ? 'duration-pill--active' : ''}`}
              style={{ flex: 1, textAlign: 'center', textTransform: 'capitalize' }}
            >
              {mode === 'auto' ? '⚡ Auto' : '✋ Manual'}
            </button>
          ))}
        </div>
      </div>

      {/* Playback Duration */}
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
          Playback Duration
        </div>
        <div className="duration-pills">
          {DURATIONS.map(d => (
            <button
              key={d.value}
              onClick={() => onSetPlaybackDuration?.(d.value)}
              className={`duration-pill ${playbackDuration === d.value ? 'duration-pill--active' : ''}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Song Search */}
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
          Manual Search
        </div>
        <div style={{ position: 'relative' }}>
          <input
            className="input"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            placeholder="Search songs..."
            style={{ fontSize: 'var(--text-xs)', paddingRight: 32 }}
          />
          <Search size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {showSearch && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 20,
                background: 'var(--bg-secondary)',
                border: 'var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-xl)',
                maxHeight: 200,
                overflowY: 'auto',
                marginTop: 4,
              }}
            >
              {searchResults.map(song => (
                <div
                  key={song.id}
                  onClick={() => handleSelectSong(song)}
                  style={{
                    padding: '6px 10px',
                    cursor: 'pointer',
                    fontSize: 'var(--text-xs)',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ fontWeight: 'var(--font-semibold)', color: 'var(--text-primary)' }}>{song.title}</div>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>{song.artist} • {song.movie}</div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
