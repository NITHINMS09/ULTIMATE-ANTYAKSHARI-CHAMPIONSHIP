import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Star } from 'lucide-react';
import { TROPHY_TIERS, getTrophyProgress } from '../engine/TrophyEngine';

const demoStats = { wins: 3, accuracy: 85, totalViolations: 0, avgResponseTime: 12 };

export default function Trophies() {
  const [selected, setSelected] = useState(null);
  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <span className="label">Achievements</span>
          <h2 className="heading-2">🏆 Trophy Hall</h2>
          <p>Earn trophies by winning matches and proving your musical mastery</p>
        </div>
        <div className="grid grid-3">
          {TROPHY_TIERS.map((trophy, i) => {
            const unlocked = trophy.check(demoStats);
            const progress = getTrophyProgress(demoStats, trophy.id);
            return (
              <motion.div key={trophy.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                onClick={() => setSelected(trophy)} className={`card card--interactive ${unlocked ? '' : ''}`}
                style={{ textAlign: 'center', padding: 'var(--space-8)', cursor: 'pointer', opacity: unlocked ? 1 : 0.5, filter: unlocked ? 'none' : 'grayscale(60%)' }}>
                <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)', filter: unlocked ? `drop-shadow(0 4px 20px ${trophy.glowColor})` : 'none', transition: 'transform var(--duration-normal)', }}>
                  {trophy.emoji}
                </div>
                <h3 className="heading-4" style={{ marginBottom: 'var(--space-2)', color: unlocked ? trophy.color : 'var(--text-muted)' }}>{trophy.name}</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>{trophy.requirement}</p>
                {!unlocked ? (
                  <div>
                    <div className="progress-bar" style={{ marginBottom: 'var(--space-2)' }}>
                      <div className="progress-fill" style={{ width: `${progress}%`, background: trophy.gradient }} />
                    </div>
                    <div className="flex items-center justify-center gap-1" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      <Lock size={12} /> {progress}%
                    </div>
                  </div>
                ) : (
                  <span className="badge badge-success"><Star size={12} /> Unlocked!</span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
      {/* Trophy Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-body" style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
              <div style={{ fontSize: '6rem', marginBottom: 'var(--space-4)', filter: `drop-shadow(0 8px 30px ${selected.glowColor})` }}>{selected.emoji}</div>
              <h2 className="heading-3" style={{ color: selected.color, marginBottom: 'var(--space-3)' }}>{selected.name}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>{selected.requirement}</p>
              <div className="progress-bar" style={{ maxWidth: 300, margin: '0 auto var(--space-4)' }}>
                <div className="progress-fill" style={{ width: `${getTrophyProgress(demoStats, selected.id)}%`, background: selected.gradient }} />
              </div>
              <button onClick={() => setSelected(null)} className="btn btn-ghost">Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
