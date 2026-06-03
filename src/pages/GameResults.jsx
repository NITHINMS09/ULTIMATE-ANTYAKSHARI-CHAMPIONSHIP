import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, PlayCircle, Home, RotateCcw, Share2, Clock, Music, Target, Zap } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 2, duration: 1.5 + Math.random() * 2,
    color: ['#7c3aed', '#06b6d4', '#f43f5e', '#f59e0b', '#10b981', '#fbbf24'][i % 6],
    size: 6 + Math.random() * 8, rotation: Math.random() * 360,
  })), []);
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100, overflow: 'hidden' }}>
      {pieces.map(p => (
        <motion.div key={p.id} initial={{ y: -20, x: `${p.left}vw`, rotate: 0, opacity: 1 }}
          animate={{ y: '110vh', rotate: p.rotation + 720, opacity: 0 }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'linear' }}
          style={{ position: 'absolute', width: p.size, height: p.size * 0.6, background: p.color, borderRadius: 2 }} />
      ))}
    </div>
  );
}

function AnimatedScore({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 40);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(start);
    }, 30);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
}

export default function GameResults() {
  const navigate = useNavigate();
  const { teams, songHistory, currentRound, settings, matchId, resetGame } = useGameStore();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => { const t = setTimeout(() => setShowConfetti(false), 5000); return () => clearTimeout(t); }, []);

  const leaderboard = useMemo(() => [...teams].sort((a, b) => b.score - a.score), [teams]);
  const winner = leaderboard[0];
  const totalSongs = songHistory.length;
  const validSongs = songHistory.filter(s => s.isValid).length;

  const handlePlayAgain = () => { resetGame(); navigate('/setup'); };

  if (!winner) return <div className="page container text-center"><p>No match data available.</p><Link to="/" className="btn btn-primary" style={{ marginTop: 'var(--space-4)' }}>Go Home</Link></div>;

  return (
    <div className="page">
      {showConfetti && <Confetti />}
      <div className="container" style={{ maxWidth: 900 }}>
        {/* Winner Announcement */}
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 150, delay: 0.3 }} style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <motion.div animate={{ rotate: [0, -5, 5, -3, 3, 0] }} transition={{ duration: 1, delay: 0.5 }} style={{ fontSize: '5rem', marginBottom: 'var(--space-4)' }}>🏆</motion.div>
          <h1 className="heading-1" style={{ marginBottom: 'var(--space-2)' }}>CHAMPION!</h1>
          <div style={{ fontSize: 'var(--text-5xl)', marginBottom: 'var(--space-2)' }}>{winner.emoji}</div>
          <h2 className="heading-2" style={{ color: winner.color }}>{winner.name}</h2>
          <div className="score-display" style={{ fontSize: 'var(--text-6xl)', marginTop: 'var(--space-2)' }}>
            <AnimatedScore value={winner.score} /> pts
          </div>
        </motion.div>

        {/* Podium */}
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          className="flex items-end justify-center gap-4" style={{ marginBottom: 'var(--space-12)', height: 280 }}>
          {leaderboard.slice(0, 3).map((team, i) => {
            const heights = [200, 160, 130];
            const medals = ['🥇', '🥈', '🥉'];
            const glows = ['var(--shadow-glow-gold)', 'none', 'none'];
            return (
              <motion.div key={team.id} variants={fadeUp} style={{ textAlign: 'center', width: i === 0 ? 160 : 130 }}>
                <div style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-2)' }}>{team.emoji}</div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>{team.name}</div>
                <motion.div initial={{ height: 0 }} animate={{ height: heights[i] }} transition={{ duration: 0.6, delay: 0.5 + i * 0.15 }}
                  className="card" style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    borderTop: `4px solid ${team.color}`, borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                    boxShadow: glows[i], background: i === 0 ? 'rgba(245,158,11,0.08)' : 'var(--glass-bg)',
                  }}>
                  <div style={{ fontSize: 'var(--text-3xl)' }}>{medals[i]}</div>
                  <div className="score-display" style={{ fontSize: 'var(--text-2xl)' }}><AnimatedScore value={team.score} /></div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>#{i + 1}</div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Full Leaderboard */}
        {leaderboard.length > 3 && (
          <div className="table-container" style={{ marginBottom: 'var(--space-8)' }}>
            <table className="table"><thead><tr><th>Rank</th><th>Team</th><th>Score</th><th>Violations</th></tr></thead>
              <tbody>{leaderboard.slice(3).map((team, i) => (
                <tr key={team.id}><td>#{i + 4}</td>
                  <td className="flex items-center gap-2"><span>{team.emoji}</span> {team.name}</td>
                  <td style={{ fontWeight: 'var(--font-bold)' }}>{team.score}</td>
                  <td>{team.violations || 0}</td></tr>
              ))}</tbody></table>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
          {[
            { icon: Music, label: 'Songs Played', value: totalSongs, color: 'var(--primary-400)' },
            { icon: Target, label: 'Valid Songs', value: validSongs, color: 'var(--success-400)' },
            { icon: Clock, label: 'Rounds', value: currentRound, color: 'var(--secondary-400)' },
            { icon: Zap, label: 'Game Mode', value: settings.gameMode, color: 'var(--warning-400)' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 + i * 0.1 }} className="card stat-card">
              <s.icon size={20} style={{ color: s.color }} />
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Song Timeline */}
        <div className="card" style={{ padding: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
          <h3 className="heading-4" style={{ marginBottom: 'var(--space-4)' }}>📋 Song Timeline</h3>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {songHistory.map((song, i) => {
              const team = teams.find(t => t.id === song.teamId);
              return (
                <div key={i} className="flex items-center gap-3" style={{ padding: 'var(--space-2) 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', width: 24 }}>#{i + 1}</span>
                  <span>{team?.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>{song.songTitle}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginLeft: 'var(--space-2)' }}>{song.artist}</span>
                  </div>
                  <span className={`badge ${song.isValid ? 'badge-success' : 'badge-error'}`} style={{ fontSize: 'var(--text-xs)' }}>
                    {song.isValid ? '✓' : '✗'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button onClick={handlePlayAgain} className="btn btn-primary btn-lg"><RotateCcw size={18} /> Play Again</button>
          <Link to={`/replay/${matchId}`} className="btn btn-secondary btn-lg"><PlayCircle size={18} /> View Replay</Link>
          <Link to="/" className="btn btn-ghost btn-lg"><Home size={18} /> Home</Link>
        </div>
      </div>
    </div>
  );
}
