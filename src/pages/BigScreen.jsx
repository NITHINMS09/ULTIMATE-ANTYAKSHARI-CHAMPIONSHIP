import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize, Settings, BarChart3, Clock as ClockIcon, List } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { syncEngine } from '../engine/SyncEngine';

function BigScoreBar({ teams, currentTeamIndex }) {
  return (
    <div className="flex items-center justify-center gap-8" style={{ padding: 'var(--space-6)' }}>
      {teams.map((team, i) => (
        <motion.div key={team.id} layout className="flex items-center gap-3" style={{
          padding: 'var(--space-3) var(--space-6)', borderRadius: 'var(--radius-xl)',
          background: i === currentTeamIndex ? `${team.color}20` : 'var(--glass-bg)',
          border: i === currentTeamIndex ? `2px solid ${team.color}` : 'var(--glass-border)',
          boxShadow: i === currentTeamIndex ? `0 0 30px ${team.color}30` : 'none',
        }}>
          <span style={{ fontSize: 'var(--text-4xl)' }}>{team.emoji}</span>
          <div>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', fontFamily: 'var(--font-display)' }}>{team.name}</div>
            <motion.div key={team.score} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
              style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-black)', fontFamily: 'var(--font-display)', background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {team.score}
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function BigLeaderboard({ teams }) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const maxScore = sorted[0]?.score || 1;
  return (
    <div style={{ padding: 'var(--space-8)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-5xl)', fontWeight: 'var(--font-black)', textAlign: 'center', marginBottom: 'var(--space-8)', background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>LEADERBOARD</h2>
      <div className="flex flex-col gap-4" style={{ maxWidth: 800, margin: '0 auto', width: '100%' }}>
        {sorted.map((team, i) => (
          <motion.div key={team.id} initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
            className="flex items-center gap-6" style={{ padding: 'var(--space-4)' }}>
            <span style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-black)', fontFamily: 'var(--font-display)', width: 60, textAlign: 'center',
              color: i === 0 ? 'var(--gold-400)' : i === 1 ? 'var(--text-secondary)' : i === 2 ? '#cd7f32' : 'var(--text-muted)' }}>
              #{i + 1}
            </span>
            <span style={{ fontSize: 'var(--text-4xl)' }}>{team.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-2)' }}>{team.name}</div>
              <div className="progress-bar" style={{ height: 12 }}>
                <div className="progress-fill" style={{ width: `${(team.score / maxScore) * 100}%`, background: team.color }} />
              </div>
            </div>
            <span style={{ fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-black)', fontFamily: 'var(--font-display)', minWidth: 80, textAlign: 'right' }}>{team.score}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function BigScreen() {
  const { status, teams, currentTeamIndex, currentLetter, currentRound, totalRounds, timer, songHistory, matchId } = useGameStore();
  const [view, setView] = useState('game');
  const [celebration, setCelebration] = useState(null);
  const [customMsg, setCustomMsg] = useState(null);
  const [showControls, setShowControls] = useState(false);

  const currentTeam = teams[currentTeamIndex];
  const timerPercent = timer.total > 0 ? timer.remaining / timer.total : 0;
  const circumference = 2 * Math.PI * 130;
  const dashOffset = circumference * (1 - timerPercent);
  const timerColor = timer.remaining > 15 ? 'var(--success-500)' : timer.remaining > 5 ? 'var(--warning-500)' : 'var(--error-500)';

  // Sync engine listeners
  useEffect(() => {
    const unsub1 = syncEngine.on('command', (payload) => {
      if (payload.commandType === 'show-celebration') {
        setCelebration(payload.text || '🎉');
        setTimeout(() => setCelebration(null), 5000);
      }
      if (payload.commandType === 'show-message') {
        setCustomMsg(payload.text);
        setTimeout(() => setCustomMsg(null), 5000);
      }
      if (payload.commandType === 'show-leaderboard') setView('leaderboard');
    });
    return () => { unsub1(); };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        else document.exitFullscreen().catch(() => {});
      }
      if (e.key === 'l' || e.key === 'L') setView('leaderboard');
      if (e.key === 'h' || e.key === 'H') setView('history');
      if (e.key === 'g' || e.key === 'G') setView('game');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="bigscreen" style={{ position: 'relative', cursor: 'none' }} onMouseMove={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
      {/* Celebration Overlay */}
      <AnimatePresence>
        {celebration && (
          <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="celebration-overlay" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div className="celebration-text">{celebration}</div>
          </motion.div>
        )}
        {customMsg && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className="celebration-overlay" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: 'var(--text-6xl)', fontFamily: 'var(--font-display)', fontWeight: 'var(--font-bold)', textAlign: 'center', padding: 'var(--space-8)' }}>{customMsg}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-black)', background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          ULTIMATE ANTYAKSHARI CHAMPIONSHIP
        </h1>
        <div className="flex items-center justify-center gap-3" style={{ marginTop: 'var(--space-2)' }}>
          <span className="badge badge-primary">Round {currentRound}/{totalRounds}</span>
          <span className={`badge ${status === 'playing' ? 'badge-success badge-dot' : 'badge-warning badge-dot'}`}>{status.toUpperCase()}</span>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        {view === 'game' && status !== 'idle' && (
          <>
            {/* Current Team */}
            {currentTeam && (
              <motion.div key={currentTeam.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                <span style={{ fontSize: '5rem' }}>{currentTeam.emoji}</span>
                <h2 style={{ fontSize: 'var(--text-5xl)', fontFamily: 'var(--font-display)', fontWeight: 'var(--font-black)', color: currentTeam.color }}>{currentTeam.name}</h2>
              </motion.div>
            )}

            {/* Letter + Timer row */}
            <div className="flex items-center justify-center gap-16" style={{ marginBottom: 'var(--space-8)' }}>
              <AnimatePresence mode="wait">
                <motion.div key={currentLetter} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} className="letter-display" style={{ width: 200, height: 200 }}>
                  <span className="letter-display-char" style={{ fontSize: '8rem' }}>{currentLetter || '?'}</span>
                </motion.div>
              </AnimatePresence>

              <div className="timer-display" style={{ width: 200, height: 200 }}>
                <svg className="timer-circle" viewBox="0 0 300 300">
                  <circle className="timer-bg" cx="150" cy="150" r="130" />
                  <circle className="timer-fill" cx="150" cy="150" r="130" stroke={timerColor} strokeWidth="10" fill="none" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={dashOffset} style={{ transition: 'stroke-dashoffset 1s linear' }} />
                </svg>
                <div className="timer-text">
                  <span className="timer-value" style={{ fontSize: 'var(--text-7xl)', color: timerColor }}>{timer.remaining}</span>
                </div>
              </div>
            </div>

            {/* Score Bar */}
            <BigScoreBar teams={teams} currentTeamIndex={currentTeamIndex} />
          </>
        )}

        {view === 'leaderboard' && <BigLeaderboard teams={teams} />}

        {view === 'history' && (
          <div style={{ padding: 'var(--space-8)', flex: 1, maxWidth: 800, width: '100%', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 'var(--font-black)', textAlign: 'center', marginBottom: 'var(--space-6)', background: 'var(--gradient-hero)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SONG HISTORY</h2>
            {songHistory.slice(-10).reverse().map((song, i) => {
              const team = teams.find(t => t.id === song.teamId);
              return (
                <div key={i} className="flex items-center gap-4" style={{ padding: 'var(--space-3) 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: 'var(--text-xl)' }}>
                  <span style={{ fontSize: 'var(--text-2xl)' }}>{team?.emoji}</span>
                  <div style={{ flex: 1, fontWeight: 'var(--font-medium)' }}>{song.songTitle}</div>
                  <span className={`badge ${song.isValid ? 'badge-success' : 'badge-error'}`}>{song.isValid ? '✓' : '✗'}</span>
                </div>
              );
            })}
          </div>
        )}

        {(status === 'idle' || !teams.length) && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '6rem', marginBottom: 'var(--space-6)' }}>🎵</div>
            <h2 style={{ fontSize: 'var(--text-4xl)', fontFamily: 'var(--font-display)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-4)' }}>Waiting for Game...</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xl)', animation: 'pulse 2s ease-in-out infinite' }}>The host will start the match shortly</p>
          </div>
        )}
      </div>

      {/* Controls (hidden, shown on hover) */}
      <AnimatePresence>
        {showControls && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', bottom: 'var(--space-4)', right: 'var(--space-4)', zIndex: 50, cursor: 'pointer' }}>
            <div className="flex gap-2">
              <button onClick={() => setView('game')} className={`btn ${view === 'game' ? 'btn-primary' : 'btn-ghost'} btn-sm`}>Game</button>
              <button onClick={() => setView('leaderboard')} className={`btn ${view === 'leaderboard' ? 'btn-primary' : 'btn-ghost'} btn-sm`}><BarChart3 size={14} /></button>
              <button onClick={() => setView('history')} className={`btn ${view === 'history' ? 'btn-primary' : 'btn-ghost'} btn-sm`}><List size={14} /></button>
              <button onClick={() => { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{}); else document.exitFullscreen().catch(()=>{}); }} className="btn btn-ghost btn-sm"><Maximize size={14} /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
