import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square, SkipForward, AlertTriangle, Calculator, Type, CheckCircle, XCircle, Radio, Activity, Plus, Minus, RotateCcw, Monitor, Zap, Send, Crown } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { syncEngine } from '../engine/SyncEngine';

function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3><AlertTriangle size={20} style={{ color: 'var(--warning-500)', marginRight: 8 }} />{title}</h3></div>
        <div className="modal-body"><p style={{ color: 'var(--text-secondary)' }}>{message}</p></div>
        <div className="modal-footer">
          <button onClick={onCancel} className="btn btn-ghost">Cancel</button>
          <button onClick={onConfirm} className="btn btn-danger">Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default function ControlCenter() {
  const store = useGameStore();
  const { status, teams, currentTeamIndex, currentLetter, currentRound, totalRounds, timer, songHistory, settings } = store;
  const currentTeam = teams[currentTeamIndex];

  const [confirm, setConfirm] = useState(null);
  const [adjustAmount, setAdjustAmount] = useState(5);
  const [customMessage, setCustomMessage] = useState('');
  const [scoreLog, setScoreLog] = useState([]);

  const doAdjust = (teamId, delta) => {
    store.adjustScore(teamId, delta);
    const team = teams.find(t => t.id === teamId);
    setScoreLog(prev => [{ team: team?.name, delta, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
  };

  const openBigScreen = () => window.open('/bigscreen', '_blank', 'width=1920,height=1080');

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-8)' }}>
          <div>
            <h1 className="heading-2">🎛️ Control Center</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Match: {store.matchId || 'No active match'}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge ${status === 'playing' ? 'badge-success badge-dot' : status === 'paused' ? 'badge-warning badge-dot' : 'badge-primary badge-dot'}`}>
              {status.toUpperCase().replace('_', ' ')}
            </span>
            <button onClick={openBigScreen} className="btn btn-ghost btn-sm"><Monitor size={16} /> Big Screen</button>
          </div>
        </div>

        <div className="control-grid">
          {/* Game Controls */}
          <div className="control-section">
            <div className="control-section-title"><Play size={16} /> GAME CONTROLS</div>
            <div className="flex flex-col gap-3">
              {status === 'setup' && <button onClick={() => store.startMatch()} className="btn btn-success btn-lg" style={{ width: '100%' }}><Play size={20} /> Start Game</button>}
              {status === 'playing' && <button onClick={() => store.pauseMatch()} className="btn btn-warning btn-lg" style={{ width: '100%' }}><Pause size={20} /> Pause Game</button>}
              {(status === 'paused' || status === 'emergency_paused') && <button onClick={() => store.resumeMatch()} className="btn btn-primary btn-lg" style={{ width: '100%' }}><Play size={20} /> Resume Game</button>}
              <button onClick={() => setConfirm({ title: 'End Match', message: 'Are you sure you want to end this match? Final scores will be calculated.', action: () => { store.endMatch(); setConfirm(null); } })} className="btn btn-danger" style={{ width: '100%' }} disabled={status === 'idle' || status === 'finished'}><Square size={16} /> End Game</button>
              <button onClick={() => setConfirm({ title: '⚠️ Emergency Pause', message: 'This will immediately pause the match. Use only for emergencies.', action: () => { store.emergencyPause(); setConfirm(null); } })} className="emergency-btn" disabled={status !== 'playing' && status !== 'paused'}>
                ⚠️ EMERGENCY PAUSE
              </button>
            </div>
          </div>

          {/* Turn Controls */}
          <div className="control-section">
            <div className="control-section-title"><SkipForward size={16} /> TURN CONTROLS</div>
            {currentTeam && (
              <div className="card" style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-4)', borderLeft: `3px solid ${currentTeam.color}` }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 'var(--text-xl)' }}>{currentTeam.emoji}</span>
                  <div><strong>{currentTeam.name}</strong><div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Current Turn</div></div>
                </div>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <button onClick={() => store.skipTurn()} className="btn btn-ghost" style={{ width: '100%' }} disabled={status !== 'playing'}><SkipForward size={16} /> Skip Turn</button>
              <button onClick={() => store.nextTurn()} className="btn btn-ghost" style={{ width: '100%' }} disabled={status !== 'playing'}><Zap size={16} /> Force Next Team</button>
              <div className="flex gap-2">
                <button onClick={() => { const s = useGameStore.getState(); useGameStore.setState({ timer: { ...s.timer, remaining: Math.min(s.timer.remaining + 10, 120) } }); }} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>+10s</button>
                <button onClick={() => { const s = useGameStore.getState(); useGameStore.setState({ timer: { ...s.timer, remaining: Math.min(s.timer.remaining + 30, 120) } }); }} className="btn btn-ghost btn-sm" style={{ flex: 1 }}>+30s</button>
                <button onClick={() => store.resetTimer()} className="btn btn-ghost btn-sm" style={{ flex: 1 }}><RotateCcw size={14} /></button>
              </div>
            </div>
          </div>

          {/* Score Management */}
          <div className="control-section">
            <div className="control-section-title"><Calculator size={16} /> SCORE MANAGEMENT</div>
            <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-4)' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Adjust:</span>
              <input type="number" className="input" value={adjustAmount} onChange={e => setAdjustAmount(+e.target.value)} style={{ width: 70 }} />
            </div>
            <div className="flex flex-col gap-2">
              {teams.map(team => (
                <div key={team.id} className="flex items-center gap-2" style={{ padding: 'var(--space-2)', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)' }}>
                  <span>{team.emoji}</span>
                  <span style={{ flex: 1, fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>{team.name}</span>
                  <span style={{ fontWeight: 'var(--font-bold)', minWidth: 40, textAlign: 'right' }}>{team.score}</span>
                  <button onClick={() => doAdjust(team.id, -adjustAmount)} className="btn btn-ghost btn-xs"><Minus size={14} /></button>
                  <button onClick={() => doAdjust(team.id, adjustAmount)} className="btn btn-ghost btn-xs"><Plus size={14} /></button>
                </div>
              ))}
            </div>
            {scoreLog.length > 0 && (
              <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', maxHeight: 80, overflowY: 'auto' }}>
                {scoreLog.map((log, i) => <div key={i}>{log.time}: {log.team} {log.delta > 0 ? '+' : ''}{log.delta}</div>)}
              </div>
            )}
          </div>

          {/* Letter Control */}
          <div className="control-section">
            <div className="control-section-title"><Type size={16} /> LETTER CONTROL</div>
            <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-4)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Current:</span>
              <div className="letter-display" style={{ width: 60, height: 60 }}>
                <span className="letter-display-char" style={{ fontSize: 'var(--text-3xl)' }}>{currentLetter || '?'}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => (
                <button key={l} onClick={() => store.setLetter(l)} style={{
                  width: 32, height: 32, borderRadius: 'var(--radius-sm)', fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', cursor: 'pointer',
                  background: currentLetter === l ? 'var(--primary-600)' : 'var(--glass-bg)', color: currentLetter === l ? 'white' : 'var(--text-secondary)',
                  border: currentLetter === l ? '2px solid var(--primary-400)' : 'var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{l}</button>
              ))}
            </div>
          </div>

          {/* Song Validation */}
          <div className="control-section">
            <div className="control-section-title"><CheckCircle size={16} /> SONG VALIDATION</div>
            {songHistory.length > 0 ? (
              <div className="flex flex-col gap-2">
                {songHistory.slice(-5).reverse().map((song, i) => {
                  const team = teams.find(t => t.id === song.teamId);
                  return (
                    <div key={i} className="flex items-center gap-2" style={{ padding: 'var(--space-2)', background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)' }}>
                      <span>{team?.emoji}</span>
                      <div style={{ flex: 1, fontSize: 'var(--text-sm)' }}>{song.songTitle}</div>
                      {song.isValid === null ? (
                        <div className="flex gap-1">
                          <button onClick={() => store.approveSong(song.id)} className="btn btn-success btn-xs"><CheckCircle size={12} /></button>
                          <button onClick={() => store.rejectSong(song.id)} className="btn btn-danger btn-xs"><XCircle size={12} /></button>
                        </div>
                      ) : (
                        <span className={`badge ${song.isValid ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '10px' }}>{song.isValid ? '✓' : '✗'}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>No songs submitted yet.</p>}
          </div>

          {/* Live Event Controls */}
          <div className="control-section">
            <div className="control-section-title"><Radio size={16} /> LIVE EVENT</div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input className="input" value={customMessage} onChange={e => setCustomMessage(e.target.value)} placeholder="Custom message..." />
                <button onClick={() => { syncEngine.sendCommand('show-message', { text: customMessage }); setCustomMessage(''); }} className="btn btn-primary btn-sm"><Send size={14} /></button>
              </div>
              <button onClick={() => syncEngine.sendCommand('show-celebration', { text: '🎉 CELEBRATION! 🎉' })} className="btn btn-gold" style={{ width: '100%' }}><Crown size={16} /> Trigger Celebration</button>
              <button onClick={openBigScreen} className="btn btn-ghost" style={{ width: '100%' }}><Monitor size={16} /> Open Big Screen</button>
            </div>
          </div>

          {/* Match Monitor */}
          <div className="control-section" style={{ gridColumn: 'span 2' }}>
            <div className="control-section-title"><Activity size={16} /> MATCH MONITOR</div>
            <div className="grid grid-4 gap-4">
              <div className="stat-card" style={{ padding: 'var(--space-3)' }}>
                <div className="stat-value" style={{ fontSize: 'var(--text-xl)' }}>{currentRound}/{totalRounds}</div>
                <div className="stat-label">Round</div>
              </div>
              <div className="stat-card" style={{ padding: 'var(--space-3)' }}>
                <div className="stat-value" style={{ fontSize: 'var(--text-xl)' }}>{timer.remaining}s</div>
                <div className="stat-label">Timer</div>
              </div>
              <div className="stat-card" style={{ padding: 'var(--space-3)' }}>
                <div className="stat-value" style={{ fontSize: 'var(--text-xl)' }}>{songHistory.length}</div>
                <div className="stat-label">Songs</div>
              </div>
              <div className="stat-card" style={{ padding: 'var(--space-3)' }}>
                <div className="stat-value" style={{ fontSize: 'var(--text-xl)' }}>{teams.length}</div>
                <div className="stat-label">Teams</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal open={!!confirm} title={confirm?.title} message={confirm?.message} onConfirm={confirm?.action} onCancel={() => setConfirm(null)} />
    </div>
  );
}
