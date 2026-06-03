import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Brain, Monitor, Trophy, Shield, Music, Users, ArrowRight, ArrowLeft,
  Check, Sparkles, Volume2, Plus, Trash2, Settings, HelpCircle, Smartphone, AlertTriangle
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useGameStore } from '../store/gameStore';
import { validateSong } from '../engine/ValidationEngine';
import { getNextLetter } from '../engine/LetterEngine';

const STEPS = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'tutorial', title: 'Walkthrough' },
  { id: 'demo', title: 'Interactive Demo' },
  { id: 'features', title: 'Key Features' },
  { id: 'setup', title: 'Quick Setup' }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { completeOnboarding } = useAppStore();
  const { initMatch, startMatch } = useGameStore();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Tutorial Tooltips State
  const [activeTooltip, setActiveTooltip] = useState(0);
  const tooltips = [
    { target: 'timer', title: 'The Tick-Tock Pressure', text: 'Teams have a customizable countdown (e.g. 30s) to submit their song. Watch out, color codes warn when time is running out!' },
    { target: 'letter', title: 'The Start Letter', text: 'This represents the starting letter for the song. Derived dynamically from the last consonant of the previous song!' },
    { target: 'input', title: 'Fuzzy Song Autocomplete', text: 'Start typing and get suggestions instantly from the built-in database of 300+ popular songs.' },
    { target: 'validation', title: 'Dual validation', text: 'The AI checks for duplicate songs, letters, and correctness. If confidence is low, the host can manually override.' }
  ];

  // Demo Match State
  const [demoState, setDemoState] = useState({
    playerScore: 0,
    aiScore: 0,
    currentLetter: 'K',
    playerInput: '',
    suggestions: [],
    validationResult: null,
    turn: 'player', // 'player' | 'ai' | 'finished'
    history: []
  });

  const demoSongs = [
    { title: 'Kesariya', artist: 'Arijit Singh', movie: 'Brahmastra', language: 'Hindi' },
    { title: 'Kal Ho Naa Ho', artist: 'Sonu Nigam', movie: 'Kal Ho Naa Ho', language: 'Hindi' },
    { title: 'Kolaveri Di', artist: 'Dhanush', movie: '3', language: 'Tamil' }
  ];

  useEffect(() => {
    if (demoState.playerInput.length >= 1) {
      const filtered = demoSongs.filter(s =>
        s.title.toLowerCase().startsWith(demoState.playerInput.toLowerCase())
      );
      setDemoState(prev => ({ ...prev, suggestions: filtered }));
    } else {
      setDemoState(prev => ({ ...prev, suggestions: [] }));
    }
  }, [demoState.playerInput]);

  const handleDemoSubmit = (song) => {
    const title = song?.title || demoState.playerInput;
    const isK = title.trim().toUpperCase().startsWith('K');

    if (!isK) {
      setDemoState(prev => ({
        ...prev,
        validationResult: { status: 'rejected', confidence: 100, reason: 'Song must start with letter K!' }
      }));
      return;
    }

    const validation = validateSong({ songTitle: title }, 'K', []);
    setDemoState(prev => ({
      ...prev,
      validationResult: validation,
      playerScore: prev.playerScore + 10,
      turn: 'ai',
      history: [{ title, singer: 'You', status: 'approved' }, ...prev.history]
    }));

    // Trigger AI response after delay
    setTimeout(() => {
      const nextLetter = getNextLetter(title);
      setDemoState(prev => ({
        ...prev,
        currentLetter: nextLetter,
        validationResult: null,
        playerInput: '',
        suggestions: []
      }));

      setTimeout(() => {
        // AI plays a song
        const aiSongs = {
          'Y': 'Yeh Dosti (Sholay)',
          'A': 'Ae Dil Hai Mushkil',
          'N': 'Naatu Naatu (RRR)',
          'R': 'Roop Tera Mastana',
          'M': 'Mere Sapno Ki Rani',
          'H': 'Humma Humma',
          'S': 'Shree Ganeshay Dheemahi',
          'T': 'Tujhe Dekha To Yeh Jaana'
        };

        const aiSong = aiSongs[nextLetter] || 'Dil To Pagal Hai';
        const aiNextLetter = getNextLetter(aiSong);

        setDemoState(prev => ({
          ...prev,
          aiScore: prev.aiScore + 10,
          currentLetter: aiNextLetter,
          turn: 'player',
          history: [{ title: aiSong, singer: 'AI Master', status: 'approved' }, ...prev.history]
        }));
      }, 1500);

    }, 2000);
  };

  // Carousel State
  const [activeCarousel, setActiveCarousel] = useState(0);
  const carouselItems = [
    {
      icon: Brain,
      title: 'Real-Time AI Song Validation',
      desc: 'The app checks song metadata, starting letters, and duplicates in a fraction of a second. Low-confidence matches are seamlessly routed to the Host screen for approval.'
    },
    {
      icon: Monitor,
      title: 'Projector/LED Big Screen',
      desc: 'Connect a secondary display (TV or projector) and launch Big Screen Mode. Watch real-time leaderboard adjustments, letter glows, and victory podium celebrations as the match progresses.'
    },
    {
      icon: Users,
      title: 'Intuitive Host Control Center',
      desc: 'The host has absolute control. Adjust scores, pause the game, skip turns, trigger celebration overlays, override AI validation, or initiate an emergency pause with a single click.'
    },
    {
      icon: Shield,
      title: 'Offline Event Recovery',
      desc: 'Never fear network disconnections. The state is auto-saved in local IndexedDB storage every 2 seconds. A single refresh completely restores your score, round count, and timer.'
    }
  ];

  // Setup Wizard State
  const [setupTeams, setSetupTeams] = useState([
    { name: 'Swaras', emoji: '🎵', color: '#7c3aed', members: 'Arav, Priya' },
    { name: 'Taalas', emoji: '⚡', color: '#06b6d4', members: 'Rohan, Meera' }
  ]);
  const [settings, setSettings] = useState({
    timePerTurn: 30,
    totalRounds: 5,
    gameMode: 'classic',
  });

  const handleAddTeam = () => {
    if (setupTeams.length >= 6) return;
    const emojis = ['🌟', '🔥', '🦁', '🦅', '💫', '🎯'];
    const colors = ['#f43f5e', '#f59e0b', '#10b981', '#fb7185', '#a78bfa', '#fbbf24'];
    const names = ['Ragas', 'Alaaps', 'BollyBeats', 'Rockstars', 'Symphonies', 'Melodies'];
    const idx = setupTeams.length;
    setSetupTeams([...setupTeams, {
      name: names[idx] || `Team ${idx + 1}`,
      emoji: emojis[idx % emojis.length],
      color: colors[idx % colors.length],
      members: ''
    }]);
  };

  const handleRemoveTeam = (idx) => {
    setSetupTeams(setupTeams.filter((_, i) => i !== idx));
  };

  const handleTeamChange = (idx, field, val) => {
    const updated = [...setupTeams];
    updated[idx][field] = val;
    setSetupTeams(updated);
  };

  const handleLaunchGame = () => {
    const formattedTeams = setupTeams.map(t => ({
      name: t.name,
      emoji: t.emoji,
      color: t.color,
      members: t.members.split(',').map(m => m.trim()).filter(Boolean)
    }));
    initMatch(formattedTeams, settings);
    completeOnboarding();
    startMatch();
    navigate('/play');
  };

  const nextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  return (
    <div className="page" style={{ background: 'radial-gradient(circle at top, #1e1b4b 0%, #09090b 100%)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top indicator bar */}
      <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-4)', zIndex: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: '1.5rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold' }}>♫</span>
            <span style={{ fontWeight: 'bold', letterSpacing: '2px', fontSize: '1.1rem' }}>UAC PLATFORM DEMO</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => { completeOnboarding(); navigate('/'); }}>
            Skip Intro
          </button>
        </div>

        {/* Steps indicator dots */}
        <div style={{ display: 'flex', gap: '8px', width: '100%', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
          {STEPS.map((s, idx) => (
            <div
              key={s.id}
              style={{
                flex: 1,
                background: idx <= currentStepIndex ? 'var(--gradient-primary)' : 'transparent',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '6px' }}>
          <span>Step {currentStepIndex + 1} of {STEPS.length}: {STEPS[currentStepIndex].title}</span>
          <span>{Math.round(((currentStepIndex + 1) / STEPS.length) * 100)}% Complete</span>
        </div>
      </div>

      {/* Main Step Content Container */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-4)' }}>
        <div className="container" style={{ maxWidth: 800, zIndex: 10 }}>
          <AnimatePresence mode="wait">
            
            {/* WELCOME STEP */}
            {STEPS[currentStepIndex].id === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{ display: 'inline-flex', width: 80, height: 80, borderRadius: '40px', background: 'rgba(124,58,237,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-6)', border: '1px solid rgba(124,58,237,0.2)' }}>
                  <Sparkles size={36} style={{ color: 'var(--primary-400)' }} />
                </div>
                <h1 className="heading-1" style={{ marginBottom: 'var(--space-4)', fontSize: '2.8rem' }}>
                  Ultimate Antyakshari Championship
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: 600, margin: '0 auto var(--space-8)', lineHeight: 1.6 }}>
                  Welcome to the ultimate system for hosting high-energy musical battles. Whether for a community festival, a family reunion, or a collegiate clash, our dual-validation, multi-screen engine makes it spectacular.
                </p>

                {/* Simulated live visual bars */}
                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', height: '60px', alignItems: 'flex-end', marginBottom: 'var(--space-8)' }}>
                  {[12, 35, 45, 20, 60, 40, 25, 50, 15, 30].map((h, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [h * 0.4, h, h * 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1, ease: 'easeInOut' }}
                      style={{
                        width: '8px',
                        borderRadius: '4px',
                        background: i % 2 === 0 ? 'var(--gradient-primary)' : 'var(--gradient-secondary)'
                      }}
                    />
                  ))}
                </div>

                <div className="flex justify-center">
                  <button className="btn btn-primary btn-xl" onClick={nextStep} style={{ padding: 'var(--space-4) var(--space-8)' }}>
                    Get Started <ArrowRight size={18} style={{ marginLeft: 6 }} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* INTERACTIVE WALKTHROUGH */}
            {STEPS[currentStepIndex].id === 'tutorial' && (
              <motion.div
                key="tutorial"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="page-header" style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                  <span className="label">Dashboard Walkthrough</span>
                  <h2 className="heading-3">Understanding the Gameplay Panel</h2>
                  <p>Familiarize yourself with the interface elements that drive the main game loop.</p>
                </div>

                <div className="grid grid-2 gap-6" style={{ alignItems: 'center' }}>
                  {/* Gameplay mockup simulation */}
                  <div className="glass-panel" style={{ padding: 'var(--space-6)', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
                      <span>Round 1 of 5</span>
                      <span style={{ color: 'var(--success-500)', fontWeight: 'bold' }}>Active Match</span>
                    </div>

                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                      <span style={{ fontSize: 'var(--text-xl)' }}>⚡</span>
                      <div style={{ fontWeight: 'bold', color: 'var(--secondary-400)' }}>Team Taalas</div>
                    </div>

                    {/* Highlights targets */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                      {/* Timer target */}
                      <div
                        id="timer-target"
                        style={{
                          width: '70px',
                          height: '70px',
                          borderRadius: '35px',
                          border: `2px solid ${activeTooltip === 0 ? 'var(--primary-500)' : 'rgba(255,255,255,0.1)'}`,
                          boxShadow: activeTooltip === 0 ? '0 0 15px var(--primary-500)' : 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--error-400)' }}>12</span>
                        <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>secs</span>
                      </div>

                      {/* Letter target */}
                      <div
                        id="letter-target"
                        style={{
                          width: '70px',
                          height: '70px',
                          borderRadius: '8px',
                          background: 'rgba(255,255,255,0.04)',
                          border: `2px solid ${activeTooltip === 1 ? 'var(--primary-500)' : 'rgba(255,255,255,0.1)'}`,
                          boxShadow: activeTooltip === 1 ? '0 0 15px var(--primary-500)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2rem',
                          fontWeight: 'bold',
                          color: '#a78bfa',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        K
                      </div>
                    </div>

                    {/* Input field target */}
                    <div
                      id="input-target"
                      style={{
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(255,255,255,0.02)',
                        border: `2px solid ${activeTooltip === 2 ? 'var(--primary-500)' : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: activeTooltip === 2 ? '0 0 15px var(--primary-500)' : 'none',
                        color: 'var(--text-muted)',
                        fontSize: 'var(--text-sm)',
                        textAlign: 'left',
                        marginBottom: 'var(--space-4)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Sing a song starting with "K"...
                    </div>

                    {/* Validation target */}
                    <div
                      id="validation-target"
                      style={{
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(16,185,129,0.05)',
                        border: `2px solid ${activeTooltip === 3 ? 'var(--primary-500)' : 'rgba(16,185,129,0.2)'}`,
                        boxShadow: activeTooltip === 3 ? '0 0 15px var(--primary-500)' : 'none',
                        fontSize: 'var(--text-xs)',
                        textAlign: 'left',
                        color: 'var(--success-400)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>✓ Approved by AI</div>
                      <div style={{ opacity: 0.8 }}>Confidence: 95% — Kesariya (Arijit Singh)</div>
                    </div>
                  </div>

                  {/* Tooltip Content Panel */}
                  <div className="flex flex-col gap-4">
                    <div className="card" style={{ padding: 'var(--space-5)', border: '1px solid rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.05)' }}>
                      <h4 className="heading-4" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary-400)', marginBottom: '8px' }}>
                        <HelpCircle size={18} />
                        {tooltips[activeTooltip].title}
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', lineHeight: 1.5 }}>
                        {tooltips[activeTooltip].text}
                      </p>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {tooltips.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveTooltip(i)}
                            style={{
                              width: '10px',
                              height: '10px',
                              borderRadius: '5px',
                              border: 'none',
                              background: i === activeTooltip ? 'var(--primary-400)' : 'rgba(255,255,255,0.2)',
                              cursor: 'pointer'
                            }}
                          />
                        ))}
                      </div>

                      <div className="flex gap-2">
                        {activeTooltip > 0 && (
                          <button className="btn btn-ghost btn-sm" onClick={() => setActiveTooltip(activeTooltip - 1)}>
                            Back
                          </button>
                        )}
                        {activeTooltip < tooltips.length - 1 ? (
                          <button className="btn btn-primary btn-sm" onClick={() => setActiveTooltip(activeTooltip + 1)}>
                            Next Tooltip
                          </button>
                        ) : (
                          <button className="btn btn-primary btn-sm" onClick={nextStep}>
                            Interactive Demo <ArrowRight size={14} style={{ marginLeft: 4 }} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between" style={{ marginTop: 'var(--space-10)' }}>
                  <button className="btn btn-ghost" onClick={prevStep}>
                    <ArrowLeft size={16} style={{ marginRight: 6 }} /> Back
                  </button>
                </div>
              </motion.div>
            )}

            {/* INTERACTIVE DEMO MATCH */}
            {STEPS[currentStepIndex].id === 'demo' && (
              <motion.div
                key="demo"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="page-header" style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                  <span className="label">Mini Game Simulation</span>
                  <h2 className="heading-3">Test Out the Smart Validator</h2>
                  <p>Type one of the songs starting with "K" from the suggestions, or click a suggestion directly to test how the engine validates and triggers responses.</p>
                </div>

                <div className="grid grid-3 gap-6" style={{ alignItems: 'start' }}>
                  {/* Left panel: scoreboard */}
                  <div className="card" style={{ padding: 'var(--space-4)' }}>
                    <h4 className="heading-4" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>Demo Scoreboard</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: 6 }}>
                        <span>👤 You (Team Swaras)</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--primary-400)' }}>{demoState.playerScore} pts</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: 6 }}>
                        <span>🤖 AI Champion</span>
                        <span style={{ fontWeight: 'bold', color: 'var(--secondary-400)' }}>{demoState.aiScore} pts</span>
                      </div>
                    </div>

                    <div style={{ marginTop: 'var(--space-4)' }}>
                      <h5 style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 6 }}>Match Logs</h5>
                      <div style={{ maxHeight: 110, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {demoState.history.map((h, i) => (
                          <div key={i} style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                            <span>{h.singer}: {h.title}</span>
                            <span style={{ color: 'var(--success-400)' }}>✓ +10</span>
                          </div>
                        ))}
                        {demoState.history.length === 0 && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No songs played yet.</span>}
                      </div>
                    </div>
                  </div>

                  {/* Center panel: play zone */}
                  <div className="glass-panel" style={{ padding: 'var(--space-5)', gridColumn: 'span 2' }}>
                    <div style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                      <span className="badge badge-primary" style={{ textTransform: 'uppercase' }}>
                        {demoState.turn === 'player' ? 'Your Turn' : 'AI Opponent is thinking...'}
                      </span>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 4 }}>
                        Starting letter required:
                      </div>
                      <div className="letter-display" style={{ width: 80, height: 80, margin: '8px auto', fontSize: '2rem' }}>
                        {demoState.currentLetter}
                      </div>
                    </div>

                    {demoState.turn === 'player' ? (
                      <div style={{ position: 'relative' }}>
                        <input
                          className="input"
                          value={demoState.playerInput}
                          onChange={e => setDemoState({ ...demoState, playerInput: e.target.value })}
                          placeholder={`Sing a song starting with "${demoState.currentLetter}"... (e.g. Kesariya)`}
                        />

                        {demoState.suggestions.length > 0 && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-secondary)', border: 'var(--glass-border)', borderRadius: 'var(--radius-md)', zIndex: 20 }}>
                            {demoState.suggestions.map((s, idx) => (
                              <div
                                key={idx}
                                onClick={() => handleDemoSubmit(s)}
                                style={{ padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}
                                onMouseEnter={e => e.target.style.background = 'var(--glass-bg)'}
                                onMouseLeave={e => e.target.style.background = 'transparent'}
                              >
                                {s.title} ({s.movie})
                              </div>
                            ))}
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', alignSelf: 'center' }}>Quick Suggestions:</span>
                          {demoSongs.map((s, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleDemoSubmit(s)}
                              disabled={demoState.currentLetter !== 'K'}
                              className="btn btn-ghost btn-sm"
                              style={{ fontSize: '11px', padding: '2px 8px' }}
                            >
                              {s.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>
                        <div className="badge-pulse" style={{ width: 12, height: 12, borderRadius: 6, background: 'var(--secondary-500)', display: 'inline-block', marginRight: 8 }} />
                        Generating response from song catalog...
                      </div>
                    )}

                    {/* AI Feedback toast in mini form */}
                    {demoState.validationResult && (
                      <div style={{
                        marginTop: 15,
                        padding: 10,
                        borderRadius: 6,
                        background: demoState.validationResult.status === 'approved' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        border: `1px solid ${demoState.validationResult.status === 'approved' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                        fontSize: '12px'
                      }}>
                        <strong>{demoState.validationResult.status === 'approved' ? 'Approved!' : 'Rejected'}</strong> — {demoState.validationResult.reason} (AI confidence {demoState.validationResult.confidence}%)
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between" style={{ marginTop: 'var(--space-8)' }}>
                  <button className="btn btn-ghost" onClick={prevStep}>
                    <ArrowLeft size={16} style={{ marginRight: 6 }} /> Back
                  </button>
                  <button className="btn btn-primary" onClick={nextStep}>
                    Next: Key Features <ArrowRight size={16} style={{ marginLeft: 6 }} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* KEY FEATURES CAROUSEL */}
            {STEPS[currentStepIndex].id === 'features' && (
              <motion.div
                key="features"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="page-header" style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                  <span className="label">Architecture & Highlights</span>
                  <h2 className="heading-3">Built for High-Stakes Events</h2>
                  <p>Discover the core sub-systems engineered to deliver a seamless event experience.</p>
                </div>

                <div className="grid grid-2 gap-6" style={{ alignItems: 'center' }}>
                  {/* Left: active carousel item content */}
                  <div>
                    {React.createElement(carouselItems[activeCarousel].icon, {
                      size: 48,
                      style: { color: 'var(--primary-400)', marginBottom: 'var(--space-4)' }
                    })}
                    <h3 className="heading-3" style={{ marginBottom: 'var(--space-3)' }}>
                      {carouselItems[activeCarousel].title}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-base)', lineHeight: 1.6, marginBottom: 'var(--space-6)' }}>
                      {carouselItems[activeCarousel].desc}
                    </p>

                    <div style={{ display: 'flex', gap: 6 }}>
                      {carouselItems.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveCarousel(i)}
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '6px',
                            border: 'none',
                            background: i === activeCarousel ? 'var(--primary-400)' : 'rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Right: Feature list selectors */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {carouselItems.map((item, idx) => {
                      const Icon = item.icon;
                      const isActive = idx === activeCarousel;
                      return (
                        <div
                          key={idx}
                          onClick={() => setActiveCarousel(idx)}
                          style={{
                            padding: '16px',
                            borderRadius: '10px',
                            border: isActive ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(255,255,255,0.04)',
                            background: isActive ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.02)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            background: isActive ? 'var(--primary-500)' : 'rgba(255,255,255,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isActive ? 'white' : 'var(--text-muted)',
                            transition: 'all 0.3s ease'
                          }}>
                            <Icon size={18} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: isActive ? 'var(--primary-300)' : 'var(--text-primary)' }}>
                              {item.title}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between" style={{ marginTop: 'var(--space-10)' }}>
                  <button className="btn btn-ghost" onClick={prevStep}>
                    <ArrowLeft size={16} style={{ marginRight: 6 }} /> Back
                  </button>
                  <button className="btn btn-primary" onClick={nextStep}>
                    Next: Launch Game <ArrowRight size={16} style={{ marginLeft: 6 }} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* QUICK SETUP WIZARD */}
            {STEPS[currentStepIndex].id === 'setup' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="page-header" style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
                  <span className="label">Launch Match</span>
                  <h2 className="heading-3">Configure Your First Match</h2>
                  <p>Set up teams and click "Launch Game" to complete onboarding and enter the tournament!</p>
                </div>

                <div className="grid grid-2 gap-6">
                  {/* Left column: Teams setup */}
                  <div className="card" style={{ padding: 'var(--space-5)', maxHeight: 420, overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h4 className="heading-4" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Teams List ({setupTeams.length})</h4>
                      <button
                        onClick={handleAddTeam}
                        disabled={setupTeams.length >= 6}
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: '11px', gap: 4 }}
                      >
                        <Plus size={12} /> Add Team
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {setupTeams.map((team, idx) => (
                        <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, borderLeft: `3px solid ${team.color}` }}>
                          <input
                            type="text"
                            value={team.emoji}
                            onChange={e => handleTeamChange(idx, 'emoji', e.target.value)}
                            style={{ width: 30, background: 'transparent', border: 'none', textAlign: 'center', fontSize: '1.2rem' }}
                          />
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <input
                              type="text"
                              value={team.name}
                              placeholder="Team Name"
                              onChange={e => handleTeamChange(idx, 'name', e.target.value)}
                              style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', padding: '2px 0', fontWeight: 'bold' }}
                            />
                            <input
                              type="text"
                              value={team.members}
                              placeholder="Members (comma-separated)"
                              onChange={e => handleTeamChange(idx, 'members', e.target.value)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '11px', padding: '2px 0' }}
                            />
                          </div>
                          {setupTeams.length > 2 && (
                            <button className="btn btn-ghost btn-sm" style={{ padding: 4 }} onClick={() => handleRemoveTeam(idx)}>
                              <Trash2 size={14} style={{ color: 'var(--error-400)' }} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right column: settings summary */}
                  <div className="flex flex-col gap-4">
                    <div className="card" style={{ padding: 'var(--space-5)' }}>
                      <h4 className="heading-4" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 12 }}>Game Rules</h4>
                      
                      <div className="flex flex-col gap-3">
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Game Mode</label>
                          <select
                            className="input"
                            value={settings.gameMode}
                            onChange={e => setSettings({ ...settings, gameMode: e.target.value })}
                            style={{ background: 'var(--glass-bg)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                          >
                            <option value="classic">Classic Mode</option>
                            <option value="speed">Speed Round</option>
                            <option value="elimination">Elimination</option>
                            <option value="team_battle">Team Battle</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Time Limit per Turn ({settings.timePerTurn}s)</label>
                          <input
                            type="range"
                            min="10"
                            max="60"
                            step="5"
                            value={settings.timePerTurn}
                            onChange={e => setSettings({ ...settings, timePerTurn: parseInt(e.target.value) })}
                            style={{ width: '100%', accentColor: 'var(--primary-500)' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Rounds to Play ({settings.totalRounds})</label>
                          <input
                            type="range"
                            min="3"
                            max="10"
                            step="1"
                            value={settings.totalRounds}
                            onChange={e => setSettings({ ...settings, totalRounds: parseInt(e.target.value) })}
                            style={{ width: '100%', accentColor: 'var(--primary-500)' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="card" style={{ padding: 'var(--space-4)', border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Check size={20} style={{ color: 'var(--success-400)' }} />
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Launching this match will store the setup parameters in localStorage so your session recovers even after a tab reload.
                      </div>
                    </div>

                    <button className="btn btn-primary btn-lg" onClick={handleLaunchGame} style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                      <Play size={18} /> Launch Match Now!
                    </button>
                  </div>
                </div>

                <div className="flex justify-between" style={{ marginTop: 'var(--space-8)' }}>
                  <button className="btn btn-ghost" onClick={prevStep}>
                    <ArrowLeft size={16} style={{ marginRight: 6 }} /> Back
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
      
      {/* Footer copyright space */}
      <div style={{ padding: 'var(--space-4) 0', borderTop: '1px solid rgba(255,255,255,0.03)', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', zIndex: 10 }}>
        © {new Date().getFullYear()} Ultimate Antyakshari Championship. Designed for premium event entertainment.
      </div>
    </div>
  );
}
