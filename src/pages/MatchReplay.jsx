import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, XCircle, Clock, Music, Trophy } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export default function MatchReplay() {
  const { id } = useParams();
  const { teams, songHistory, currentRound, settings, matchId } = useGameStore();

  const matchTeams = teams.length ? teams : [
    { id: 't1', name: 'Team Alpha', emoji: '🔥', color: '#f43f5e', score: 65 },
    { id: 't2', name: 'Team Beta', emoji: '⚡', color: '#06b6d4', score: 80 },
  ];
  const matchSongs = songHistory.length ? songHistory : [
    { id: 1, teamId: 't1', songTitle: 'Tujhe Dekha To', artist: 'Kumar Sanu', isValid: true, round: 1, responseTime: 8 },
    { id: 2, teamId: 't2', songTitle: 'Ae Dil Hai Mushkil', artist: 'Arijit Singh', isValid: true, round: 1, responseTime: 12 },
    { id: 3, teamId: 't1', songTitle: 'Lag Ja Gale', artist: 'Lata Mangeshkar', isValid: true, round: 2, responseTime: 6 },
    { id: 4, teamId: 't2', songTitle: 'Ek Ladki Ko Dekha', artist: 'Kumar Sanu', isValid: true, round: 2, responseTime: 15 },
    { id: 5, teamId: 't1', songTitle: 'Achha Sila Diya', artist: 'Mohammed Rafi', isValid: false, round: 3, responseTime: 28 },
    { id: 6, teamId: 't2', songTitle: 'Agar Tum Saath Ho', artist: 'Arijit Singh', isValid: true, round: 3, responseTime: 9 },
  ];

  const rounds = {};
  matchSongs.forEach(s => { if (!rounds[s.round]) rounds[s.round] = []; rounds[s.round].push(s); });

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <Link to="/history" className="btn btn-ghost" style={{ marginBottom: 'var(--space-6)' }}><ArrowLeft size={16} /> Back to History</Link>
        <div className="page-header">
          <span className="label">Match Replay</span>
          <h2 className="heading-2">🎬 Match Timeline</h2>
          <p>Match ID: {id || matchId || 'demo'}</p>
        </div>

        {/* Teams overview */}
        <div className="flex items-center justify-center gap-6 flex-wrap" style={{ marginBottom: 'var(--space-8)' }}>
          {matchTeams.map((team, i) => (
            <div key={team.id} className="card" style={{ padding: 'var(--space-4) var(--space-6)', textAlign: 'center', borderTop: `3px solid ${team.color}` }}>
              <span style={{ fontSize: 'var(--text-3xl)' }}>{team.emoji}</span>
              <div style={{ fontWeight: 'var(--font-bold)', marginTop: 'var(--space-2)' }}>{team.name}</div>
              <div className="score-display" style={{ fontSize: 'var(--text-2xl)' }}>{team.score}</div>
            </div>
          ))}
        </div>

        {/* Timeline by round */}
        {Object.entries(rounds).map(([round, songs]) => (
          <div key={round} style={{ marginBottom: 'var(--space-6)' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-3)' }}>
              <span className="badge badge-primary">Round {round}</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <div className="flex flex-col gap-2">
              {songs.map((song, i) => {
                const team = matchTeams.find(t => t.id === song.teamId);
                return (
                  <motion.div key={song.id || i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="card" style={{ padding: 'var(--space-3) var(--space-4)', borderLeft: `3px solid ${team?.color || 'var(--surface-3)'}` }}>
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: 'var(--text-lg)' }}>{team?.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>{song.songTitle}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{song.artist} • {song.responseTime}s response</div>
                      </div>
                      {song.isValid ? <CheckCircle size={18} style={{ color: 'var(--success-500)' }} /> : <XCircle size={18} style={{ color: 'var(--error-500)' }} />}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Stats */}
        <div className="grid grid-3" style={{ marginTop: 'var(--space-8)' }}>
          <div className="card stat-card"><Music size={20} style={{ color: 'var(--primary-400)' }} /><div className="stat-value">{matchSongs.length}</div><div className="stat-label">Total Songs</div></div>
          <div className="card stat-card"><CheckCircle size={20} style={{ color: 'var(--success-400)' }} /><div className="stat-value">{matchSongs.filter(s => s.isValid).length}</div><div className="stat-label">Valid</div></div>
          <div className="card stat-card"><Clock size={20} style={{ color: 'var(--secondary-400)' }} /><div className="stat-value">{matchSongs.length > 0 ? Math.round(matchSongs.reduce((s, m) => s + (m.responseTime || 0), 0) / matchSongs.length) : 0}s</div><div className="stat-label">Avg Response</div></div>
        </div>
      </div>
    </div>
  );
}
