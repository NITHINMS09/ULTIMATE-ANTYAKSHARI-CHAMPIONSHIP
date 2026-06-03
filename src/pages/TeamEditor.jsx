import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Trash2, Palette, Save, ArrowLeft, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

const TEAM_EMOJIS = ['🔥','⚡','🌟','🎵','🎸','🎤','💫','🦁','🐯','🦅','🎯','🏆','💎','🌊','🎪','🎭'];
const COLORS = ['#7c3aed','#06b6d4','#f43f5e','#f59e0b','#10b981','#f97316','#6366f1','#ec4899'];

export default function TeamEditor() {
  const navigate = useNavigate();
  const storeTeams = useGameStore(s => s.teams);
  const [teams, setTeams] = useState(storeTeams.length ? storeTeams.map(t => ({ ...t, members: t.members?.join(', ') || '' })) : [
    { id: '1', name: 'Team Alpha', emoji: '🔥', color: '#7c3aed', members: '' },
    { id: '2', name: 'Team Beta', emoji: '⚡', color: '#06b6d4', members: '' },
  ]);

  const update = (i, field, value) => setTeams(teams.map((t, idx) => idx === i ? { ...t, [field]: value } : t));
  const addTeam = () => { if (teams.length >= 8) return; setTeams([...teams, { id: Date.now().toString(), name: `Team ${teams.length + 1}`, emoji: TEAM_EMOJIS[teams.length], color: COLORS[teams.length % COLORS.length], members: '' }]); };
  const removeTeam = (i) => { if (teams.length <= 2) return; setTeams(teams.filter((_, idx) => idx !== i)); };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ marginBottom: 'var(--space-4)' }}><ArrowLeft size={16} /> Back</button>
        <div className="page-header">
          <span className="label">Team Management</span>
          <h2 className="heading-2"><Users size={28} style={{ marginRight: 8 }} /> Team Editor</h2>
          <p>Create and customize teams for your championship</p>
        </div>
        <div className="flex flex-col gap-4">
          {teams.map((team, i) => (
            <motion.div key={team.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="card" style={{ padding: 'var(--space-5)', borderLeft: `4px solid ${team.color}` }}>
              <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-4)' }}>
                <GripVertical size={16} style={{ color: 'var(--text-muted)', cursor: 'grab' }} />
                <span style={{ fontSize: 'var(--text-3xl)' }}>{team.emoji}</span>
                <input className="input" value={team.name} onChange={e => update(i, 'name', e.target.value)} style={{ flex: 1, fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)' }} />
                {teams.length > 2 && <button onClick={() => removeTeam(i)} className="btn btn-ghost btn-sm" style={{ color: 'var(--error-400)' }}><Trash2 size={16} /></button>}
              </div>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label className="input-label" style={{ marginBottom: 'var(--space-2)', display: 'block' }}>Emoji</label>
                <div className="flex flex-wrap gap-1">
                  {TEAM_EMOJIS.map(e => (
                    <button key={e} onClick={() => update(i, 'emoji', e)} style={{
                      width: 36, height: 36, borderRadius: 'var(--radius-md)', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                      background: team.emoji === e ? team.color : 'var(--glass-bg)', border: team.emoji === e ? `2px solid ${team.color}` : 'var(--glass-border)',
                    }}>{e}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <label className="input-label" style={{ marginBottom: 'var(--space-2)', display: 'block' }}>Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => update(i, 'color', c)} style={{
                      width: 32, height: 32, borderRadius: '50%', background: c, cursor: 'pointer',
                      border: team.color === c ? '3px solid white' : '2px solid transparent', boxShadow: team.color === c ? `0 0 12px ${c}60` : 'none',
                    }} />
                  ))}
                </div>
              </div>
              <div>
                <label className="input-label">Team Members (comma separated)</label>
                <input className="input" value={team.members} onChange={e => update(i, 'members', e.target.value)} placeholder="Alice, Bob, Charlie" />
              </div>
            </motion.div>
          ))}
        </div>
        {teams.length < 8 && (
          <button onClick={addTeam} className="btn btn-ghost btn-lg" style={{ width: '100%', marginTop: 'var(--space-4)', borderStyle: 'dashed' }}>
            <Plus size={20} /> Add Team ({teams.length}/8)
          </button>
        )}
      </div>
    </div>
  );
}
