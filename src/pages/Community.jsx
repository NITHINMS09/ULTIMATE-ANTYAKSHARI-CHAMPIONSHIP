import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Star, Heart, Share2, Trophy, Music, Globe } from 'lucide-react';

const COMMUNITY_POSTS = [
  { user: 'MusicMaster_22', emoji: '🎵', time: '2 hours ago', text: 'Just hosted an amazing 6-team championship at my college fest! The elimination mode was INSANE 🔥', likes: 42, replies: 8 },
  { user: 'AntakshariFan', emoji: '🎤', time: '5 hours ago', text: 'Tip: Speed mode with 10-second timer is perfect for breaking ties between top teams!', likes: 28, replies: 5 },
  { user: 'EventOrganizer_Pro', emoji: '🎪', time: '1 day ago', text: 'Used the Big Screen mode at our corporate event. The projector setup looked absolutely professional! 📺', likes: 56, replies: 12 },
  { user: 'BollywoodQueen', emoji: '👑', time: '2 days ago', text: 'Challenge: Try playing with ONLY 90s Bollywood songs. It gets SO hard after round 3! 😂', likes: 89, replies: 23 },
  { user: 'TechGuru', emoji: '💻', time: '3 days ago', text: 'The AI validation caught someone trying to make up a song name. Fair play engine works great!', likes: 34, replies: 7 },
];

const LEADERBOARD = [
  { name: 'MusicMaster_22', wins: 47, trophies: 5, emoji: '🏆' },
  { name: 'BollywoodQueen', wins: 42, trophies: 4, emoji: '👑' },
  { name: 'RhythmKing', wins: 38, trophies: 4, emoji: '🎸' },
  { name: 'MelodyMaker', wins: 35, trophies: 3, emoji: '🎹' },
  { name: 'SongBird99', wins: 31, trophies: 3, emoji: '🐦' },
];

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

export default function Community() {
  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <span className="label">Community</span>
          <h2 className="heading-2">🌍 Community Hub</h2>
          <p>Connect with fellow Antyakshari enthusiasts worldwide</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-6)' }}>
          {/* Feed */}
          <div>
            <h3 className="heading-4" style={{ marginBottom: 'var(--space-4)' }}><MessageSquare size={18} style={{ marginRight: 8 }} /> Community Feed</h3>
            <div className="flex flex-col gap-4">
              {COMMUNITY_POSTS.map((post, i) => (
                <motion.div key={i} variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: i * 0.1 }}
                  className="card card--interactive" style={{ padding: 'var(--space-5)' }}>
                  <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-3)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xl)' }}>{post.emoji}</div>
                    <div>
                      <div style={{ fontWeight: 'var(--font-bold)', fontSize: 'var(--text-sm)' }}>{post.user}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{post.time}</div>
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-3)' }}>{post.text}</p>
                  <div className="flex items-center gap-4">
                    <button className="btn btn-ghost btn-xs"><Heart size={14} /> {post.likes}</button>
                    <button className="btn btn-ghost btn-xs"><MessageSquare size={14} /> {post.replies}</button>
                    <button className="btn btn-ghost btn-xs"><Share2 size={14} /> Share</button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="card" style={{ padding: 'var(--space-5)', marginBottom: 'var(--space-4)' }}>
              <h4 className="heading-4" style={{ marginBottom: 'var(--space-4)' }}><Trophy size={16} style={{ marginRight: 8 }} /> Top Players</h4>
              <div className="flex flex-col gap-3">
                {LEADERBOARD.map((player, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span style={{ width: 24, textAlign: 'center', fontWeight: 'var(--font-bold)', color: i === 0 ? 'var(--gold-400)' : i === 1 ? 'var(--text-secondary)' : i === 2 ? '#cd7f32' : 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>#{i + 1}</span>
                    <span>{player.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>{player.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{player.wins} wins • {player.trophies} 🏆</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <h4 className="heading-4" style={{ marginBottom: 'var(--space-3)' }}>📊 Quick Stats</h4>
              <div className="flex flex-col gap-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                <div className="flex justify-between"><span>Active Players</span><strong>1,247</strong></div>
                <div className="flex justify-between"><span>Matches Today</span><strong>89</strong></div>
                <div className="flex justify-between"><span>Songs Played</span><strong>4,521</strong></div>
                <div className="flex justify-between"><span>Languages</span><strong>6</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .container > div[style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
