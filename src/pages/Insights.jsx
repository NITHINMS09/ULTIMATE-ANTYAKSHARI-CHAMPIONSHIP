import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Music, Globe, Mic, Film, Trophy, Zap, Clock, Star } from 'lucide-react';
import { useAnalyticsStore } from '../store/analyticsStore';
import songs from '../data/songDatabase';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

function BarViz({ data, maxValue, color }) {
  return (
    <div className="flex flex-col gap-2">
      {data.map(([label, value], i) => (
        <div key={i} className="flex items-center gap-3">
          <span style={{ fontSize: 'var(--text-sm)', width: 100, textAlign: 'right', color: 'var(--text-secondary)' }}>{label}</span>
          <div style={{ flex: 1, height: 24, background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${(value / maxValue) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.1 }}
              style={{ height: '100%', background: color || 'var(--gradient-primary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 var(--space-2)' }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-bold)', color: 'white' }}>{value}</span>
            </motion.div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Insights() {
  const langStats = useMemo(() => {
    const counts = {};
    songs.forEach(s => { counts[s.language] = (counts[s.language] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, []);

  const decadeStats = useMemo(() => {
    const counts = {};
    songs.forEach(s => { const d = `${Math.floor(s.year / 10) * 10}s`; counts[d] = (counts[d] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

  const topArtists = useMemo(() => {
    const counts = {};
    songs.forEach(s => { counts[s.artist] = (counts[s.artist] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, []);

  const letterStats = useMemo(() => {
    const counts = {};
    songs.forEach(s => { counts[s.firstLetter] = (counts[s.firstLetter] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <span className="label">Analytics</span>
          <h2 className="heading-2">📊 Insights & Analytics</h2>
          <p>Deep dive into music database statistics and game analytics</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-4" style={{ marginBottom: 'var(--space-8)' }}>
          {[
            { icon: Music, label: 'Total Songs', value: songs.length, color: 'var(--primary-400)' },
            { icon: Globe, label: 'Languages', value: langStats.length, color: 'var(--secondary-400)' },
            { icon: Mic, label: 'Artists', value: new Set(songs.map(s => s.artist)).size, color: 'var(--accent-400)' },
            { icon: Star, label: 'Letters Covered', value: letterStats.length, color: 'var(--gold-400)' },
          ].map((s, i) => (
            <motion.div key={i} variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: i * 0.1 }} className="card stat-card">
              <s.icon size={20} style={{ color: s.color }} />
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-2" style={{ gap: 'var(--space-6)' }}>
          {/* Language Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 className="heading-4" style={{ marginBottom: 'var(--space-4)' }}><Globe size={18} style={{ marginRight: 8, color: 'var(--secondary-400)' }} />Language Distribution</h3>
            <BarViz data={langStats} maxValue={langStats[0]?.[1] || 1} color="var(--gradient-secondary)" />
          </motion.div>

          {/* Top Artists */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 className="heading-4" style={{ marginBottom: 'var(--space-4)' }}><Mic size={18} style={{ marginRight: 8, color: 'var(--accent-400)' }} />Top Artists</h3>
            <BarViz data={topArtists} maxValue={topArtists[0]?.[1] || 1} color="var(--gradient-accent)" />
          </motion.div>

          {/* By Decade */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 className="heading-4" style={{ marginBottom: 'var(--space-4)' }}><Clock size={18} style={{ marginRight: 8, color: 'var(--primary-400)' }} />Songs by Decade</h3>
            <BarViz data={decadeStats} maxValue={Math.max(...decadeStats.map(d => d[1]), 1)} color="var(--gradient-primary)" />
          </motion.div>

          {/* Letter Coverage */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card" style={{ padding: 'var(--space-6)' }}>
            <h3 className="heading-4" style={{ marginBottom: 'var(--space-4)' }}><BarChart3 size={18} style={{ marginRight: 8, color: 'var(--gold-400)' }} />Letter Coverage</h3>
            <div className="flex flex-wrap gap-2">
              {letterStats.map(([letter, count]) => {
                const intensity = Math.min(1, count / (letterStats[0]?.[1] || 1));
                return (
                  <div key={letter} style={{
                    width: 48, height: 48, borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: `rgba(124, 58, 237, ${intensity * 0.4})`, border: `1px solid rgba(124, 58, 237, ${intensity * 0.6})`,
                  }}>
                    <span style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-sm)' }}>{letter}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
