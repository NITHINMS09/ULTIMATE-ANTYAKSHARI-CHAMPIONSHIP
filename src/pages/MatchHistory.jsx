import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Calendar, Filter, PlayCircle, Clock, Music, Trophy, ChevronDown } from 'lucide-react';

const DEMO_MATCHES = [
  { id: 'match_1', date: '2026-06-01T14:30:00', mode: 'classic', teams: [{ name: 'Fire Squad', emoji: '🔥', score: 85, color: '#f43f5e' }, { name: 'Thunder', emoji: '⚡', score: 70, color: '#06b6d4' }, { name: 'Stars', emoji: '⭐', score: 55, color: '#f59e0b' }], winner: 'Fire Squad', duration: 1800, totalSongs: 24, rounds: 5 },
  { id: 'match_2', date: '2026-05-28T18:00:00', mode: 'speed', teams: [{ name: 'Melody Kings', emoji: '🎵', score: 120, color: '#7c3aed' }, { name: 'Rhythm Stars', emoji: '🎶', score: 95, color: '#10b981' }], winner: 'Melody Kings', duration: 900, totalSongs: 18, rounds: 3 },
  { id: 'match_3', date: '2026-05-25T10:00:00', mode: 'elimination', teams: [{ name: 'Champions', emoji: '🏆', score: 100, color: '#f59e0b' }, { name: 'Challengers', emoji: '💎', score: 60, color: '#06b6d4' }, { name: 'Rookies', emoji: '🌟', score: 30, color: '#f43f5e' }, { name: 'Legends', emoji: '👑', score: 85, color: '#7c3aed' }], winner: 'Champions', duration: 2400, totalSongs: 32, rounds: 7 },
  { id: 'match_4', date: '2026-05-20T20:00:00', mode: 'team_battle', teams: [{ name: 'East Side', emoji: '🌅', score: 75, color: '#f97316' }, { name: 'West Side', emoji: '🌇', score: 80, color: '#8b5cf6' }], winner: 'West Side', duration: 1500, totalSongs: 20, rounds: 5 },
];

export default function MatchHistory() {
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const filtered = DEMO_MATCHES.filter(m => {
    if (modeFilter !== 'all' && m.mode !== modeFilter) return false;
    if (search && !m.teams.some(t => t.name.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="page-header">
          <span className="label">Archive</span>
          <h2 className="heading-2">📋 Match History</h2>
          <p>Review past matches and relive the best moments</p>
        </div>
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by team name..." style={{ paddingLeft: 36 }} />
          </div>
          <select className="input" value={modeFilter} onChange={e => setModeFilter(e.target.value)} style={{ width: 160, background: 'var(--glass-bg)', color: 'var(--text-primary)' }}>
            <option value="all">All Modes</option>
            <option value="classic">Classic</option>
            <option value="speed">Speed</option>
            <option value="elimination">Elimination</option>
            <option value="team_battle">Team Battle</option>
          </select>
        </div>
        {/* Match Cards */}
        <div className="flex flex-col gap-4">
          {filtered.map((match, i) => (
            <motion.div key={match.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="card" style={{ padding: 'var(--space-5)' }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
                <div className="flex items-center gap-3">
                  <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="badge badge-primary">{match.mode}</span>
                </div>
                <div className="flex items-center gap-3" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1"><Clock size={12} /> {Math.round(match.duration / 60)}m</span>
                  <span className="flex items-center gap-1"><Music size={12} /> {match.totalSongs} songs</span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 'var(--space-3)' }}>
                {match.teams.map((team, j) => (
                  <div key={j} className="flex items-center gap-2" style={{
                    padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-md)',
                    background: team.name === match.winner ? `${team.color}15` : 'var(--glass-bg)',
                    border: team.name === match.winner ? `1px solid ${team.color}50` : 'var(--glass-border)',
                  }}>
                    <span>{team.emoji}</span>
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: team.name === match.winner ? 'var(--font-bold)' : 'var(--font-normal)' }}>{team.name}</span>
                    <span style={{ fontWeight: 'var(--font-bold)', color: team.color }}>{team.score}</span>
                    {team.name === match.winner && <Trophy size={14} style={{ color: 'var(--gold-400)' }} />}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Winner: <strong style={{ color: 'var(--gold-400)' }}>🏆 {match.winner}</strong></span>
                <Link to={`/replay/${match.id}`} className="btn btn-ghost btn-sm"><PlayCircle size={14} /> View Replay</Link>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon"><Search size={32} /></div>
              <div className="empty-state-title">No Matches Found</div>
              <div className="empty-state-description">Try adjusting your filters or start a new game!</div>
              <Link to="/setup" className="btn btn-primary">Start New Game</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
