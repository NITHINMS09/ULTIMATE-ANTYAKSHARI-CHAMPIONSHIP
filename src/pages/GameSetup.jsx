import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Zap, Swords, Users, Plus, Trash2, ArrowLeft, ArrowRight, Check, Shuffle, Settings } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { getRandomLetterWithSongs } from '../data/songDatabase';

const TEAM_EMOJIS = ['🔥','⚡','🌟','🎵','🎸','🎤','💫','🦁','🐯','🦅','🎯','🏆','💎','🌊','🎪','🎭','🎨','🚀','⭐','🌈','🎶','🎹','🥁','🎺','🎻','💥','🌸','🍀','🦋','🌙'];
const TEAM_COLORS = [
  { name: 'Violet', value: '#7c3aed' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Gold', value: '#f59e0b' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Pink', value: '#ec4899' },
];

const GAME_MODES = [
  { id: 'classic', icon: Music, title: 'Classic', desc: 'Traditional Antyakshari rules', color: '#7c3aed' },
  { id: 'speed', icon: Zap, title: 'Speed Round', desc: '10-second turns, max intensity', color: '#06b6d4' },
  { id: 'elimination', icon: Swords, title: 'Elimination', desc: 'Teams eliminated each round', color: '#f43f5e' },
  { id: 'team_battle', icon: Users, title: 'Team Battle', desc: 'Strategic team gameplay', color: '#f59e0b' },
];

const slideVariant = {
  enter: (d) => ({ x: d > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d) => ({ x: d > 0 ? -300 : 300, opacity: 0 }),
};

export default function GameSetup() {
  const navigate = useNavigate();
  const initMatch = useGameStore(s => s.initMatch);
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const [mode, setMode] = useState('classic');
  const [teams, setTeams] = useState([
    { name: 'Team Alpha', emoji: '🔥', color: '#7c3aed', members: '' },
    { name: 'Team Beta', emoji: '⚡', color: '#06b6d4', members: '' },
  ]);
  const [settings, setSettings] = useState({
    timePerTurn: 30, totalRounds: 5, pointsPerCorrect: 10,
    penaltyPoints: -5, autoValidate: true, allowSkip: true, startingLetter: 'random',
  });

  const goNext = () => { setDirection(1); setStep(s => Math.min(3, s + 1)); };
  const goPrev = () => { setDirection(-1); setStep(s => Math.max(0, s - 1)); };

  const addTeam = () => {
    if (teams.length >= 6) return;
    const idx = teams.length;
    setTeams([...teams, { name: `Team ${String.fromCharCode(65 + idx)}`, emoji: TEAM_EMOJIS[idx + 2], color: TEAM_COLORS[idx % TEAM_COLORS.length].value, members: '' }]);
  };

  const removeTeam = (i) => {
    if (teams.length <= 2) return;
    setTeams(teams.filter((_, idx) => idx !== i));
  };

  const updateTeam = (i, field, value) => {
    setTeams(teams.map((t, idx) => idx === i ? { ...t, [field]: value } : t));
  };

  const startGame = () => {
    const enrichedTeams = teams.map(t => ({
      ...t,
      members: t.members ? t.members.split(',').map(m => m.trim()).filter(Boolean) : [],
    }));
    initMatch(enrichedTeams, { ...settings, gameMode: mode });

    const store = useGameStore.getState();
    const letter = settings.startingLetter === 'random' ? getRandomLetterWithSongs() : settings.startingLetter;
    store.setLetter(letter);
    store.startMatch();
    navigate('/play');
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        {/* Stepper */}
        <div className="flex items-center justify-center gap-2" style={{ marginBottom: 'var(--space-10)' }}>
          {['Game Mode', 'Teams', 'Rules', 'Ready'].map((label, i) => (
            <React.Fragment key={i}>
              <div onClick={() => { setDirection(i > step ? 1 : -1); setStep(i); }} style={{
                display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-full)',
                background: step >= i ? 'var(--primary-600)' : 'var(--glass-bg)', color: step >= i ? 'white' : 'var(--text-tertiary)',
                fontSize: 'var(--text-sm)', fontWeight: 'var(--font-semibold)', transition: 'all var(--duration-normal)',
              }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: step > i ? 'var(--success-500)' : 'rgba(255,255,255,0.1)', fontSize: 'var(--text-xs)' }}>
                  {step > i ? <Check size={14} /> : i + 1}
                </span>
                <span style={{ display: window.innerWidth < 600 ? 'none' : 'inline' }}>{label}</span>
              </div>
              {i < 3 && <div style={{ width: 40, height: 2, background: step > i ? 'var(--primary-500)' : 'var(--surface-3)' }} />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          {/* Step 0: Game Mode */}
          {step === 0 && (
            <motion.div key="mode" custom={direction} variants={slideVariant} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <div className="page-header">
                <h2 className="heading-2">Choose Game Mode</h2>
                <p>Select the battle format for your championship</p>
              </div>
              <div className="grid grid-2" style={{ maxWidth: 700, margin: '0 auto' }}>
                {GAME_MODES.map(m => (
                  <div key={m.id} onClick={() => setMode(m.id)} className="card card--interactive" style={{
                    padding: 'var(--space-8)', textAlign: 'center', cursor: 'pointer',
                    border: mode === m.id ? `2px solid ${m.color}` : 'var(--glass-border)',
                    boxShadow: mode === m.id ? `0 0 30px ${m.color}30` : 'var(--glass-shadow)',
                  }}>
                    <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-xl)', background: `${m.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
                      <m.icon size={28} style={{ color: m.color }} />
                    </div>
                    <h3 className="heading-4">{m.title}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>{m.desc}</p>
                    {mode === m.id && <span className="badge badge-primary" style={{ marginTop: 'var(--space-3)' }}>Selected</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 1: Teams */}
          {step === 1 && (
            <motion.div key="teams" custom={direction} variants={slideVariant} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <div className="page-header">
                <h2 className="heading-2">Set Up Teams</h2>
                <p>Create 2-6 teams with custom branding</p>
              </div>
              <div className="flex flex-col gap-6">
                {teams.map((team, i) => (
                  <div key={i} className="card" style={{ padding: 'var(--space-6)', borderLeft: `4px solid ${team.color}` }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
                      <span style={{ fontSize: 'var(--text-2xl)' }}>{team.emoji}</span>
                      {teams.length > 2 && (
                        <button onClick={() => removeTeam(i)} className="btn btn-ghost btn-sm" style={{ color: 'var(--error-400)' }}><Trash2 size={16} /></button>
                      )}
                    </div>
                    <div className="grid grid-2 gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
                      <div className="input-group">
                        <label className="input-label">Team Name</label>
                        <input className="input" value={team.name} onChange={e => updateTeam(i, 'name', e.target.value)} placeholder="Enter team name" />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Members (comma separated)</label>
                        <input className="input" value={team.members} onChange={e => updateTeam(i, 'members', e.target.value)} placeholder="Alice, Bob, Charlie" />
                      </div>
                    </div>
                    <div style={{ marginTop: 'var(--space-4)' }}>
                      <label className="input-label" style={{ marginBottom: 'var(--space-2)', display: 'block' }}>Emoji</label>
                      <div className="flex flex-wrap gap-2">
                        {TEAM_EMOJIS.slice(0, 15).map(e => (
                          <button key={e} onClick={() => updateTeam(i, 'emoji', e)} style={{
                            width: 36, height: 36, borderRadius: 'var(--radius-md)', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            background: team.emoji === e ? 'var(--primary-600)' : 'var(--glass-bg)', border: team.emoji === e ? '2px solid var(--primary-400)' : 'var(--glass-border)',
                          }}>{e}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginTop: 'var(--space-4)' }}>
                      <label className="input-label" style={{ marginBottom: 'var(--space-2)', display: 'block' }}>Color</label>
                      <div className="flex flex-wrap gap-2">
                        {TEAM_COLORS.map(c => (
                          <button key={c.value} onClick={() => updateTeam(i, 'color', c.value)} style={{
                            width: 32, height: 32, borderRadius: '50%', background: c.value, cursor: 'pointer',
                            border: team.color === c.value ? '3px solid white' : '2px solid transparent', boxShadow: team.color === c.value ? `0 0 12px ${c.value}60` : 'none',
                          }} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {teams.length < 6 && (
                  <button onClick={addTeam} className="btn btn-ghost btn-lg" style={{ width: '100%', borderStyle: 'dashed' }}>
                    <Plus size={20} /> Add Team ({teams.length}/6)
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 2: Rules */}
          {step === 2 && (
            <motion.div key="rules" custom={direction} variants={slideVariant} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <div className="page-header">
                <h2 className="heading-2">Configure Rules</h2>
                <p>Customize the match settings to your preference</p>
              </div>
              <div className="card" style={{ maxWidth: 600, margin: '0 auto', padding: 'var(--space-8)' }}>
                <div className="flex flex-col gap-6">
                  <div className="input-group">
                    <label className="input-label">Time Per Turn: {settings.timePerTurn}s</label>
                    <input type="range" min="10" max="60" step="5" value={settings.timePerTurn} onChange={e => setSettings({ ...settings, timePerTurn: +e.target.value })}
                      style={{ width: '100%', accentColor: 'var(--primary-500)' }} />
                    <div className="flex justify-between" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}><span>10s</span><span>60s</span></div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Number of Rounds</label>
                    <div className="flex gap-2">
                      {[3, 5, 7, 10].map(n => (
                        <button key={n} onClick={() => setSettings({ ...settings, totalRounds: n })} className={`btn ${settings.totalRounds === n ? 'btn-primary' : 'btn-ghost'}`}>{n} Rounds</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-2 gap-4">
                    <div className="input-group">
                      <label className="input-label">Points per Correct Answer</label>
                      <input type="number" className="input" value={settings.pointsPerCorrect} onChange={e => setSettings({ ...settings, pointsPerCorrect: +e.target.value })} />
                    </div>
                    <div className="input-group">
                      <label className="input-label">Penalty Points</label>
                      <input type="number" className="input" value={settings.penaltyPoints} onChange={e => setSettings({ ...settings, penaltyPoints: +e.target.value })} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Starting Letter</label>
                    <div className="flex gap-2 flex-wrap">
                      <button onClick={() => setSettings({ ...settings, startingLetter: 'random' })} className={`btn ${settings.startingLetter === 'random' ? 'btn-primary' : 'btn-ghost'}`}>
                        <Shuffle size={16} /> Random
                      </button>
                      {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l => (
                        <button key={l} onClick={() => setSettings({ ...settings, startingLetter: l })} style={{
                          width: 36, height: 36, borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', cursor: 'pointer',
                          background: settings.startingLetter === l ? 'var(--primary-600)' : 'var(--glass-bg)', color: settings.startingLetter === l ? 'white' : 'var(--text-secondary)',
                          border: settings.startingLetter === l ? '2px solid var(--primary-400)' : 'var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>AI Auto-Validation</span>
                    <div className={`toggle ${settings.autoValidate ? 'toggle--active' : ''}`} onClick={() => setSettings({ ...settings, autoValidate: !settings.autoValidate })}>
                      <div className="toggle-thumb" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: 'var(--text-secondary)' }}>Allow Skip Turn</span>
                    <div className={`toggle ${settings.allowSkip ? 'toggle--active' : ''}`} onClick={() => setSettings({ ...settings, allowSkip: !settings.allowSkip })}>
                      <div className="toggle-thumb" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Ready */}
          {step === 3 && (
            <motion.div key="ready" custom={direction} variants={slideVariant} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3 }}>
              <div className="page-header">
                <h2 className="heading-2">Ready to Start! 🎉</h2>
                <p>Review your match configuration</p>
              </div>
              <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <div className="card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-6)' }}>
                  <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-4)' }}>
                    <Settings size={20} style={{ color: 'var(--primary-400)' }} />
                    <h3 className="heading-4">Match Settings</h3>
                  </div>
                  <div className="grid grid-2 gap-3" style={{ fontSize: 'var(--text-sm)' }}>
                    <div><span style={{ color: 'var(--text-tertiary)' }}>Mode:</span> <strong>{mode}</strong></div>
                    <div><span style={{ color: 'var(--text-tertiary)' }}>Rounds:</span> <strong>{settings.totalRounds}</strong></div>
                    <div><span style={{ color: 'var(--text-tertiary)' }}>Time/Turn:</span> <strong>{settings.timePerTurn}s</strong></div>
                    <div><span style={{ color: 'var(--text-tertiary)' }}>Starting Letter:</span> <strong>{settings.startingLetter === 'random' ? '🎲 Random' : settings.startingLetter}</strong></div>
                  </div>
                </div>
                <div className="flex flex-col gap-3" style={{ marginBottom: 'var(--space-8)' }}>
                  {teams.map((t, i) => (
                    <div key={i} className="card" style={{ padding: 'var(--space-4)', borderLeft: `4px solid ${t.color}` }}>
                      <div className="flex items-center gap-3">
                        <span style={{ fontSize: 'var(--text-2xl)' }}>{t.emoji}</span>
                        <div>
                          <div style={{ fontWeight: 'var(--font-bold)' }}>{t.name}</div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                            {t.members ? t.members.split(',').length + ' members' : 'No members added'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={startGame} className="btn btn-primary btn-xl" style={{ width: '100%' }}>
                  🎤 Start Match!
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between" style={{ marginTop: 'var(--space-10)', maxWidth: 600, margin: 'var(--space-10) auto 0' }}>
          <button onClick={goPrev} className="btn btn-ghost" disabled={step === 0}><ArrowLeft size={18} /> Back</button>
          {step < 3 && <button onClick={goNext} className="btn btn-primary">Next <ArrowRight size={18} /></button>}
        </div>
      </div>
    </div>
  );
}
