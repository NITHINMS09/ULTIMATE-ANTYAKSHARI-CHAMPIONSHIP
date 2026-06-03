import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Brain, Smartphone, Monitor, Trophy, Shield, PlayCircle, Zap, Swords, Users, Music, Sparkles, ArrowRight, Star } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const FEATURES = [
  { icon: Brain, title: 'AI-Powered Validation', desc: 'Smart validation ensures fair play with confidence scoring', glow: 'card--glow-primary', color: 'var(--primary-500)' },
  { icon: Smartphone, title: 'Multi-Device Support', desc: 'Host, audience, and team devices all synchronized', glow: 'card--glow-secondary', color: 'var(--secondary-500)' },
  { icon: Monitor, title: 'Big Screen Mode', desc: 'Optimized for projectors, LED walls, and smart TVs', glow: 'card--glow-accent', color: 'var(--accent-500)' },
  { icon: Trophy, title: 'Trophy System', desc: 'Bronze to Legendary — earn them all and build your legacy', glow: 'card--glow-gold', color: 'var(--gold-500)' },
  { icon: Shield, title: 'Fair Play Engine', desc: 'No cheating, no repeats, no intentional delays', glow: 'card--glow-primary', color: 'var(--success-500)' },
  { icon: PlayCircle, title: 'Match Replay', desc: 'Relive every moment with full match timeline replay', glow: 'card--glow-secondary', color: 'var(--info-500)' },
];

const GAME_MODES = [
  { icon: Music, title: 'Classic Mode', desc: 'The traditional Antyakshari experience — pure musical showdown', color: '#7c3aed', gradient: 'var(--gradient-primary)' },
  { icon: Zap, title: 'Speed Round', desc: 'Race against the clock — 10 seconds or you\'re out!', color: '#06b6d4', gradient: 'var(--gradient-secondary)' },
  { icon: Swords, title: 'Elimination', desc: 'Last team standing wins — survive or get eliminated', color: '#f43f5e', gradient: 'var(--gradient-accent)' },
  { icon: Users, title: 'Team Battle', desc: 'Epic team vs team showdown with strategic depth', color: '#f59e0b', gradient: 'var(--gradient-gold)' },
];

export default function Home() {
  return (
    <div className="page">
      {/* Background musical notes */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {['♪', '♫', '♬', '♩', '🎵', '🎶'].map((note, i) => (
          <div key={i} style={{
            position: 'absolute',
            fontSize: `${20 + i * 8}px`,
            opacity: 0.04,
            left: `${10 + i * 15}%`,
            top: `${20 + (i * 37) % 60}%`,
            animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}>{note}</div>
        ))}
      </div>

      {/* Hero Section */}
      <motion.section initial="hidden" animate="visible" variants={stagger} style={{ textAlign: 'center', padding: 'var(--space-16) 0 var(--space-20)', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <motion.div variants={fadeUp} transition={{ duration: 0.6 }}>
            <span className="badge badge-primary" style={{ marginBottom: 'var(--space-6)', display: 'inline-flex' }}>
              <Sparkles size={14} /> v2.0 — Now with AI Validation
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} transition={{ duration: 0.7, delay: 0.1 }} className="heading-1" style={{ maxWidth: 800, margin: '0 auto var(--space-6)' }}>
            Ultimate Antyakshari Championship
          </motion.h1>
          <motion.p variants={fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-gradient" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-4)' }}>
            The Ultimate Musical Showdown
          </motion.p>
          <motion.p variants={fadeUp} transition={{ duration: 0.6, delay: 0.3 }} style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)', maxWidth: 600, margin: '0 auto var(--space-10)' }}>
            Host epic Antyakshari competitions at schools, colleges, festivals, corporate events & beyond. Powered by AI. Built for entertainment.
          </motion.p>
          <motion.div variants={fadeUp} transition={{ duration: 0.6, delay: 0.4 }} className="flex items-center justify-center gap-4" style={{ flexWrap: 'wrap' }}>
            <Link to="/setup" className="btn btn-primary btn-xl" style={{ gap: 'var(--space-3)' }}>
              <Play size={22} /> Start New Game
            </Link>
            <Link to="/onboarding" className="btn btn-ghost btn-xl">
              Quick Demo <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger} className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="grid grid-3" style={{ maxWidth: 700, margin: '0 auto var(--space-20)' }}>
          {[['♾️', 'Unlimited Matches'], ['🎵', '310+ Songs'], ['🏆', '6 Trophy Tiers']].map(([emoji, label], i) => (
            <motion.div key={i} variants={fadeUp} className="glass-panel" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
              <div style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-2)' }}>{emoji}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 'var(--font-bold)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger} className="container" style={{ marginBottom: 'var(--space-20)', position: 'relative', zIndex: 1 }}>
        <motion.div variants={fadeUp} className="page-header">
          <span className="label">Features</span>
          <h2 className="heading-2">Everything You Need</h2>
          <p>A complete toolkit for running professional Antyakshari competitions</p>
        </motion.div>
        <div className="grid grid-3">
          {FEATURES.map((f, i) => (
            <motion.div key={i} variants={fadeUp} className={`card card--interactive ${f.glow}`} style={{ padding: 'var(--space-8)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: `${f.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
                <f.icon size={24} style={{ color: f.color }} />
              </div>
              <h3 className="heading-4" style={{ marginBottom: 'var(--space-2)' }}>{f.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Game Modes */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger} className="container" style={{ marginBottom: 'var(--space-20)', position: 'relative', zIndex: 1 }}>
        <motion.div variants={fadeUp} className="page-header">
          <span className="label">Game Modes</span>
          <h2 className="heading-2">Choose Your Battle</h2>
          <p>Four exciting ways to play — each with unique rules and challenges</p>
        </motion.div>
        <div className="grid grid-4">
          {GAME_MODES.map((m, i) => (
            <motion.div key={i} variants={fadeUp} className="card card--interactive" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-xl)', background: m.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)', boxShadow: `0 8px 24px ${m.color}40` }}>
                <m.icon size={28} color="white" />
              </div>
              <h3 className="heading-4" style={{ marginBottom: 'var(--space-2)' }}>{m.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{m.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', padding: 'var(--space-20) 0', position: 'relative', zIndex: 1 }}>
        <div className="container">
          <motion.h2 variants={fadeUp} className="heading-2" style={{ marginBottom: 'var(--space-4)' }}>Ready to Play? 🎤</motion.h2>
          <motion.p variants={fadeUp} style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-8)', maxWidth: 500, margin: '0 auto var(--space-8)' }}>
            Set up your match in minutes. Invite your teams. Let the music begin!
          </motion.p>
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4" style={{ flexWrap: 'wrap' }}>
            <Link to="/setup" className="btn btn-primary btn-xl"><Play size={22} /> Start Now</Link>
            <Link to="/trophies" className="btn btn-ghost btn-lg"><Trophy size={18} /> Trophies</Link>
            <Link to="/community" className="btn btn-ghost btn-lg"><Users size={18} /> Community</Link>
            <Link to="/insights" className="btn btn-ghost btn-lg"><Star size={18} /> Insights</Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
