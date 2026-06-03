import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SkipForward, Pause, Play, Send, Clock, Music, CheckCircle, XCircle,
  AlertTriangle, Volume2, Mic, MicOff, RefreshCw, VolumeX
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { validateSong } from '../engine/ValidationEngine';
import { getNextLetter } from '../engine/LetterEngine';
import { searchSongs } from '../data/songDatabase';
import { useToast } from '../components/ui/Toast';
import { syncEngine } from '../engine/SyncEngine';

export default function GamePlay() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const {
    status, teams, currentTeamIndex, currentLetter, currentRound, totalRounds,
    timer, songHistory, settings, usedSongs, tickTimer, pauseMatch, resumeMatch,
    submitSong, approveSong, rejectSong, skipTurn, nextTurn, setLetter, adjustScore
  } = useGameStore();

  const [songTitle, setSongTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [movie, setMovie] = useState('');
  const [language, setLanguage] = useState('hindi');
  const [validation, setValidation] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [scoreBump, setScoreBump] = useState(null);

  // Microphone state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  // YouTube states
  const [currentVideoId, setCurrentVideoId] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);
  const ytPlayerRef = useRef(null);

  const currentTeam = teams[currentTeamIndex];
  const timerPercent = timer.total > 0 ? timer.remaining / timer.total : 0;
  const circumference = 2 * Math.PI * 88;
  const dashOffset = circumference * (1 - timerPercent);

  // Dispatch statuses to Developer Debug Panel
  const dispatchDebugLog = useCallback((log) => {
    syncEngine.send('debug_log', { log });
  }, []);

  const dispatchStatus = useCallback((type, status) => {
    const eventName = type === 'yt' ? 'yt-player-status' : 'whisper-status';
    window.dispatchEvent(new CustomEvent(eventName, { detail: { status } }));
  }, []);

  // Timer tick
  useEffect(() => {
    if (status !== 'playing' || !timer.isRunning) return;
    const interval = setInterval(() => {
      const state = useGameStore.getState();
      if (state.timer.remaining <= 0) {
        clearInterval(interval);
        handleTimeout();
        return;
      }
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [status, timer.isRunning]);

  // Redirect if finished or setup idle
  useEffect(() => {
    if (status === 'finished') navigate('/results');
    if (status === 'idle') navigate('/setup');
  }, [status]);

  // Suggestions search listener
  useEffect(() => {
    if (songTitle.length >= 2) {
      const results = searchSongs(songTitle, 5);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [songTitle]);

  // Load YouTube Iframe API Script
  useEffect(() => {
    if (!window.YT) {
      dispatchDebugLog('Loading YouTube Iframe API Script...');
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        dispatchDebugLog('YouTube Iframe API Ready.');
        initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, []);

  const initPlayer = () => {
    if (window.YT && window.YT.Player) {
      dispatchDebugLog('Initializing YouTube Player element...');
      ytPlayerRef.current = new window.YT.Player('yt-player-element', {
        height: '140',
        width: '240',
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0
        },
        events: {
          onReady: () => {
            dispatchDebugLog('YouTube Player Ready.');
            dispatchStatus('yt', 'ready');
          },
          onStateChange: handlePlayerStateChange,
          onError: (e) => {
            dispatchDebugLog(`YouTube Player error occurred: Code ${e.data}`);
            dispatchStatus('yt', 'error');
          }
        }
      });
    }
  };

  const handlePlayerStateChange = (event) => {
    // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
    const stateNames = {
      '-1': 'unstarted',
      '0': 'ended',
      '1': 'playing',
      '2': 'paused',
      '3': 'buffering',
      '5': 'cued'
    };
    const stateName = stateNames[event.data] || 'unknown';
    dispatchStatus('yt', stateName);

    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true);
      setShowPlayButton(false);
      dispatchDebugLog('Song audio clip is playing.');
    } else {
      setIsPlaying(false);
    }
  };

  const handleManualPlay = () => {
    if (ytPlayerRef.current && ytPlayerRef.current.playVideo) {
      ytPlayerRef.current.playVideo();
    }
  };

  // Audio recording handlers
  const startRecording = async () => {
    if (isRecording) return;
    dispatchDebugLog('Requesting microphone access permission...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      dispatchDebugLog('Microphone permission granted. Initializing MediaRecorder...');
      dispatchStatus('whisper', 'recording');

      audioChunksRef.current = [];
      const options = { mimeType: 'audio/webm' };
      
      // Select best browser-supported mimetype
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/ogg';
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        dispatchDebugLog('Audio recording stopped. Constructing raw data audio blob...');
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
        await handleUploadAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      dispatchDebugLog('Microphone voice recording active.');
    } catch (err) {
      console.error('Failed to start microphone recording:', err);
      dispatchDebugLog(`Microphone initialization failed: ${err.message}`);
      addToast({
        type: 'error',
        title: 'Microphone Error',
        message: 'Could not access microphone. Please verify browser permissions.'
      });
      dispatchStatus('whisper', 'error');
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    
    // Stop recording interval
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    // Stop all audio tracks to release the microphone device
    if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    setIsRecording(false);
  };

  const handleUploadAudio = async (blob) => {
    setIsTranscribing(true);
    dispatchStatus('whisper', 'transcribing');
    dispatchDebugLog('Uploading audio blob to /api/transcribe...');

    const formData = new FormData();
    formData.append('audio', blob);

    try {
      const response = await fetch(`http://localhost:3001/api/transcribe?letter=${currentLetter || ''}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const transcribedText = data.text || '';
      dispatchDebugLog(`Received text transcription: "${transcribedText}"`);

      // Fill in input and trigger search matching
      if (transcribedText.trim()) {
        setSongTitle(transcribedText);
        addToast({
          type: 'success',
          title: 'Transcription Ready',
          message: `Sung phrase: "${transcribedText}"`
        });
        
        // Attempt immediate database matching and populate
        const matches = searchSongs(transcribedText, 1);
        if (matches && matches.length > 0) {
          const match = matches[0];
          dispatchDebugLog(`Fuzzy match found in song catalog: "${match.title}" by ${match.artist}`);
          setSongTitle(match.title);
          setArtist(match.artist);
          setMovie(match.movie);
          setLanguage(match.language);
        }
      } else {
        addToast({
          type: 'warning',
          title: 'Transcription Empty',
          message: 'Could not detect any clear lyrics. Please try again.'
        });
      }

      dispatchStatus('whisper', 'idle');
    } catch (err) {
      console.error('Failed to transcribe audio:', err);
      dispatchDebugLog(`Whisper transcription endpoint failed: ${err.message}`);
      addToast({
        type: 'error',
        title: 'Transcription Failed',
        message: 'Could not connect to Whisper transcription services.'
      });
      dispatchStatus('whisper', 'error');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTimeout = useCallback(() => {
    const state = useGameStore.getState();
    if (state.settings.penaltyPoints) {
      useGameStore.getState().adjustScore(state.teams[state.currentTeamIndex]?.id, state.settings.penaltyPoints);
    }
    dispatchDebugLog(`Time expired for team ${state.teams[state.currentTeamIndex]?.name}. Penalized.`);
    useGameStore.getState().nextTurn();
    setValidation(null);
    setSongTitle('');
    setArtist('');
    setMovie('');
    setCurrentVideoId('');
  }, []);

  const handleSubmit = () => {
    if (!songTitle.trim()) return;
    dispatchDebugLog(`Submitting song: "${songTitle}"`);
    const result = validateSong({ songTitle, artist, movie, language }, currentLetter, usedSongs);
    setValidation(result);

    if (result.status === 'approved') {
      const songId = submitSong({ songTitle, artist, movie, language });
      if (songId) {
        approveSong(songId);
        setScoreBump(currentTeam?.id);
        setTimeout(() => setScoreBump(null), 600);

        // Fetch YouTube matching video clip
        triggerYouTubePlay(songTitle, artist);
      }

      // Allow song to play for 10 seconds before proceeding to next turn (for collegiate review/entertainment)
      setTimeout(() => {
        // Stop YouTube playback
        if (ytPlayerRef.current && ytPlayerRef.current.stopVideo) {
          try {
            ytPlayerRef.current.stopVideo();
          } catch (e) {}
        }
        
        nextTurn();
        setValidation(null);
        setSongTitle('');
        setArtist('');
        setMovie('');
        setCurrentVideoId('');
      }, 10000);

    } else {
      const songId = submitSong({ songTitle, artist, movie, language });
      if (songId) rejectSong(songId);
      
      setTimeout(() => {
        nextTurn();
        setValidation(null);
        setSongTitle('');
        setArtist('');
        setMovie('');
        setCurrentVideoId('');
      }, 3000);
    }
  };

  const triggerYouTubePlay = async (title, artistName) => {
    const searchQuery = `${title} ${artistName || ''} official audio`;
    dispatchDebugLog(`Triggering YouTube search lookup for: "${searchQuery}"`);
    
    try {
      const response = await fetch('http://localhost:3001/api/youtube-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });

      if (!response.ok) {
        throw new Error(`YouTube API server error: ${response.status}`);
      }

      const data = await response.json();
      const videoId = data.videoId;
      
      if (videoId) {
        setCurrentVideoId(videoId);
        dispatchDebugLog(`Loading YouTube video ID: ${videoId}`);
        
        if (ytPlayerRef.current && ytPlayerRef.current.loadVideoById) {
          ytPlayerRef.current.loadVideoById({
            videoId: videoId,
            startSeconds: 30
          });
          
          // Autoplay checks
          setTimeout(() => {
            if (ytPlayerRef.current && ytPlayerRef.current.getPlayerState) {
              const state = ytPlayerRef.current.getPlayerState();
              if (state !== window.YT.PlayerState.PLAYING) {
                dispatchDebugLog('Autoplay blocked by browser. Revealing fallback play button.');
                setShowPlayButton(true);
              }
            }
          }, 1500);
        }
      }
    } catch (err) {
      console.error('YouTube search lookup failed:', err);
      dispatchDebugLog(`YouTube Search API check failed: ${err.message}`);
    }
  };

  const handleSkip = () => {
    dispatchDebugLog(`Skip turn clicked by team ${currentTeam.name}`);
    skipTurn();
    setValidation(null);
    setSongTitle('');
    setArtist('');
    setMovie('');
    setCurrentVideoId('');
  };

  const selectSuggestion = (song) => {
    setSongTitle(song.title);
    setArtist(song.artist);
    setMovie(song.movie);
    setLanguage(song.language);
    setShowSuggestions(false);
  };

  const timerColor = timer.remaining > 15 ? 'var(--success-500)' : timer.remaining > 5 ? 'var(--warning-500)' : 'var(--error-500)';
  const timerClass = timer.remaining <= 5 ? 'timer-danger' : timer.remaining <= 15 ? 'timer-warning' : '';

  if (!currentTeam || status === 'idle') return null;

  return (
    <div className="page" style={{ padding: 0 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 280px', gap: 0, minHeight: 'calc(100vh - var(--header-height))' }}>

        {/* Left Sidebar: Teams */}
        <aside style={{ background: 'rgba(10,10,26,0.6)', borderRight: 'var(--glass-border)', padding: 'var(--space-4)', overflowY: 'auto' }}>
          <div className="label" style={{ padding: 'var(--space-2) var(--space-3)', marginBottom: 'var(--space-3)' }}>Teams</div>
          <div className="flex flex-col gap-2">
            {teams.map((team, i) => (
              <motion.div key={team.id} layout className="card" style={{
                padding: 'var(--space-3) var(--space-4)',
                borderLeft: `3px solid ${team.color}`,
                background: i === currentTeamIndex ? `${team.color}15` : 'var(--glass-bg)',
                boxShadow: i === currentTeamIndex ? `0 0 20px ${team.color}20` : 'none',
              }}>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 'var(--text-xl)' }}>{team.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'var(--font-semibold)', fontSize: 'var(--text-sm)' }}>{team.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span className={`score-display ${scoreBump === team.id ? 'score-display--bump' : ''}`} style={{ fontSize: 'var(--text-xl)', background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {team.score}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>pts</span>
                    </div>
                  </div>
                  {i === currentTeamIndex && <span className="badge badge-primary badge-pulse" style={{ fontSize: 'var(--text-xs)' }}>TURN</span>}
                </div>
              </motion.div>
            ))}
          </div>
        </aside>

        {/* Center: Main Game Area */}
        <main style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {/* Round info */}
          <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-6)' }}>
            <span className="badge badge-primary">Round {currentRound} of {totalRounds}</span>
            <span className="badge badge-secondary">{settings.gameMode}</span>
            {status === 'paused' && <span className="badge badge-warning badge-pulse">⏸ PAUSED</span>}
          </div>

          {/* Current Team */}
          <motion.div key={currentTeam.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
            <span style={{ fontSize: 'var(--text-4xl)' }}>{currentTeam.emoji}</span>
            <h3 className="heading-3" style={{ color: currentTeam.color, marginTop: 'var(--space-2)' }}>{currentTeam.name}'s Turn</h3>
          </motion.div>

          {/* Letter Display */}
          <AnimatePresence mode="wait">
            <motion.div key={currentLetter} initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 180 }} transition={{ type: 'spring', stiffness: 200 }} className="letter-display" style={{ marginBottom: 'var(--space-6)' }}>
              <span className="letter-display-char">{currentLetter || '?'}</span>
            </motion.div>
          </AnimatePresence>

          {/* Timer */}
          <div className={`timer-display ${timerClass}`} style={{ width: 180, height: 180, marginBottom: 'var(--space-6)' }}>
            <svg className="timer-circle" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={timerColor} />
                  <stop offset="100%" stopColor={timerColor} stopOpacity="0.5" />
                </linearGradient>
              </defs>
              <circle className="timer-bg" cx="100" cy="100" r="88" />
              <circle className="timer-fill" cx="100" cy="100" r="88" stroke={timerColor}
                strokeDasharray={circumference} strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <div className="timer-text">
              <span className="timer-value" style={{ color: timerColor }}>{timer.remaining}</span>
              <span className="timer-label">seconds</span>
            </div>
          </div>

          {/* Song Input */}
          <div style={{ width: '100%', maxWidth: 500 }}>
            <div style={{ position: 'relative', marginBottom: 'var(--space-3)' }}>
              
              {/* Mic Icon toggle inside the text box */}
              <div style={{ display: 'flex', gap: 6, position: 'relative' }}>
                <input className="input input-lg" value={songTitle} onChange={e => setSongTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder={isRecording ? `Recording... hum your song!` : `Sing a song starting with "${currentLetter || '?'}"...`}
                  disabled={!!validation || status !== 'playing' || isTranscribing} autoFocus
                  style={{ paddingRight: 90 }} />
                
                {/* Microphones Control Button */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={!!validation || status !== 'playing' || isTranscribing}
                  className={`btn ${isRecording ? 'btn-danger animate-pulse' : 'btn-ghost'}`}
                  style={{
                    position: 'absolute',
                    right: 48,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    height: 38,
                    width: 38,
                    padding: 0,
                    borderRadius: '19px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 5
                  }}
                  title={isRecording ? 'Click to stop recording' : 'Record your song'}
                >
                  {isRecording ? <MicOff size={18} /> : <Mic size={18} style={{ color: 'var(--primary-400)' }} />}
                </button>
                <Music size={20} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>

              {/* suggestions list dropdown */}
              {showSuggestions && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg-secondary)', border: 'var(--glass-border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)', zIndex: 10, maxHeight: 200, overflowY: 'auto' }}>
                  {suggestions.map(s => (
                    <div key={s.id} onClick={() => selectSuggestion(s)} style={{ padding: 'var(--space-3) var(--space-4)', cursor: 'pointer', fontSize: 'var(--text-sm)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => e.target.style.background = 'var(--glass-bg)'} onMouseLeave={e => e.target.style.background = 'transparent'}>
                      <strong>{s.title}</strong> <span style={{ color: 'var(--text-tertiary)' }}>— {s.artist} ({s.movie})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recording wave duration ticker */}
            {isRecording && (
              <div style={{ display: 'flex', alignItems: 'center', justifySpace: 'between', padding: '6px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, marginBottom: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                <span className="badge-pulse" style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--error-500)', marginRight: 8 }} />
                <span style={{ color: 'var(--error-400)', fontWeight: 'bold' }}>Recording Audio ({recordingTime}s)</span>
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>Hum/Sing clear lyrics...</span>
              </div>
            )}

            {isTranscribing && (
              <div style={{ display: 'flex', alignItems: 'center', justifySpace: 'between', padding: '6px 12px', background: 'var(--gradient-primary)15', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 6, marginBottom: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
                <RefreshCw className="animate-spin" size={14} style={{ color: 'var(--primary-400)', marginRight: 8 }} />
                <span style={{ color: 'var(--primary-300)', fontWeight: 'bold' }}>Whisper Transcribing Audio Clip...</span>
              </div>
            )}

            <div className="grid grid-3 gap-3" style={{ marginBottom: 'var(--space-4)' }}>
              <input className="input" value={artist} onChange={e => setArtist(e.target.value)} placeholder="Artist" disabled={!!validation || isTranscribing} />
              <input className="input" value={movie} onChange={e => setMovie(e.target.value)} placeholder="Movie" disabled={!!validation || isTranscribing} />
              <select className="input" value={language} onChange={e => setLanguage(e.target.value)} disabled={!!validation || isTranscribing}
                style={{ background: 'var(--glass-bg)', color: 'var(--text-primary)' }}>
                <option value="hindi">Hindi</option>
                <option value="english">English</option>
                <option value="tamil">Tamil</option>
                <option value="telugu">Telugu</option>
                <option value="punjabi">Punjabi</option>
                <option value="bengali">Bengali</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={handleSubmit} className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={!songTitle.trim() || !!validation || status !== 'playing' || isTranscribing}>
                <Send size={18} /> Submit Song
              </button>
              <button onClick={handleSkip} className="btn btn-ghost btn-lg" disabled={!!validation || status !== 'playing' || !settings.allowSkip || isTranscribing}>
                <SkipForward size={18} /> Skip
              </button>
              <button onClick={() => status === 'paused' ? resumeMatch() : pauseMatch()} className="btn btn-ghost btn-lg" disabled={isTranscribing}>
                {status === 'paused' ? <Play size={18} /> : <Pause size={18} />}
              </button>
            </div>

            {/* YouTube Player embedded card block */}
            <div className="card" style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', display: currentVideoId ? 'block' : 'none' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Volume2 size={12} style={{ color: 'var(--secondary-400)' }} /> YouTube Match Playback
                </span>
                {isPlaying ? (
                  <span className="badge badge-success badge-pulse" style={{ fontSize: '9px', padding: '2px 6px' }}>PLAYING</span>
                ) : (
                  <span className="badge badge-ghost" style={{ fontSize: '9px', padding: '2px 6px' }}>LOADED</span>
                )}
              </div>
              <div style={{ borderRadius: 6, overflow: 'hidden', background: '#000', display: 'flex', justifyContent: 'center' }}>
                <div id="yt-player-element"></div>
              </div>
              {showPlayButton && (
                <button className="btn btn-primary btn-sm" onClick={handleManualPlay} style={{ marginTop: 8, width: '100%' }}>
                  ▶ Play Clip Fallback
                </button>
              )}
            </div>

            {/* Validation Result */}
            <AnimatePresence>
              {validation && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="card" style={{
                  marginTop: 'var(--space-4)', padding: 'var(--space-4)',
                  borderLeft: `4px solid ${validation.status === 'approved' ? 'var(--success-500)' : 'var(--error-500)'}`,
                }}>
                  <div className="flex items-center gap-3">
                    {validation.status === 'approved' ? <CheckCircle size={24} style={{ color: 'var(--success-500)' }} /> : <XCircle size={24} style={{ color: 'var(--error-500)' }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'var(--font-semibold)', color: validation.status === 'approved' ? 'var(--success-400)' : 'var(--error-400)' }}>
                        {validation.status === 'approved' ? '✓ Approved!' : '✗ Rejected'}
                      </div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{validation.reason}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>Confidence</div>
                      <div style={{ fontWeight: 'var(--font-bold)', color: validation.confidence >= 80 ? 'var(--success-400)' : validation.confidence >= 50 ? 'var(--warning-400)' : 'var(--error-400)' }}>
                        {validation.confidence}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Right Sidebar: Song History */}
        <aside style={{ background: 'rgba(10,10,26,0.6)', borderLeft: 'var(--glass-border)', padding: 'var(--space-4)', overflowY: 'auto' }}>
          <div className="label" style={{ padding: 'var(--space-2) var(--space-3)', marginBottom: 'var(--space-3)' }}>
            Song History ({songHistory.length})
          </div>
          <div className="flex flex-col gap-2">
            {[...songHistory].reverse().map((song, i) => {
              const team = teams.find(t => t.id === song.teamId);
              return (
                <motion.div key={song.id || i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ padding: 'var(--space-3)', borderLeft: `3px solid ${team?.color || 'var(--surface-3)'}` }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: 'var(--text-sm)' }}>{team?.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>{song.songTitle}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{song.artist || 'Unknown'}</div>
                    </div>
                    {song.isValid === true && <CheckCircle size={14} style={{ color: 'var(--success-500)' }} />}
                    {song.isValid === false && <XCircle size={14} style={{ color: 'var(--error-500)' }} />}
                    {song.isValid === null && <Clock size={14} style={{ color: 'var(--warning-500)' }} />}
                  </div>
                </motion.div>
              );
            })}
            {songHistory.length === 0 && (
              <div className="empty-state" style={{ padding: 'var(--space-8)' }}>
                <Volume2 size={32} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }} />
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>No songs yet.<br />Start singing!</p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile responsive override */}
      <style>{`
        @media (max-width: 1024px) {
          .page > div:first-child { grid-template-columns: 1fr !important; }
          .page > div:first-child > aside { display: none !important; }
        }
      `}</style>
    </div>
  );
}
