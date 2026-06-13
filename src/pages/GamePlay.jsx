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
import { songRecognitionEngine } from '../engine/SongRecognitionEngine.js';
import { ConfidenceEngine } from '../engine/ConfidenceEngine.js';
import { autoPlayEngine } from '../engine/AutoPlayEngine.js';
import SongDetector from '../components/control/SongDetector.jsx';

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
  const lastAutoStartedTurnRef = useRef({ teamIndex: -1, letter: null });

  // Premium Speech Detector State
  const [detectorState, setDetectorState] = useState({
    stage: 'idle',
    stageInfo: null,
    recognizedText: '',
    confidence: 0,
    confidenceLabel: null,
    detectionResult: null,
    audioLevel: 0,
    currentAttempt: 1,
    maxAttempts: 5,
    elapsed: 0,
  });

  // YouTube states
  const [currentVideoId, setCurrentVideoId] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);

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

  // Load YouTube Iframe API Script & Init Player
  useEffect(() => {
    const initPlayer = async () => {
      dispatchDebugLog('Initializing YouTube Player via AutoPlayEngine...');
      try {
        await autoPlayEngine.initialize('yt-player-element', {
          onStateChange: (stateName, info) => {
            dispatchStatus('yt', stateName);
            if (stateName === 'playing') {
              setIsPlaying(true);
              setShowPlayButton(false);
              dispatchDebugLog('Song audio clip is playing.');
            } else {
              setIsPlaying(false);
            }
          },
          onPlaybackEnd: () => {
            dispatchDebugLog('Playback finished.');
          },
          onError: (err) => {
            dispatchDebugLog(`AutoPlayEngine error: ${err.message}`);
            dispatchStatus('yt', 'error');
          }
        });
        dispatchStatus('yt', 'ready');
      } catch (e) {
        console.error('Failed to initialize AutoPlayEngine:', e);
      }
    };

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
      autoPlayEngine.destroy();
    };
  }, []);

  const handleManualPlay = () => {
    autoPlayEngine.resume();
  };

  // Auto-activate listening at the start of a turn
  useEffect(() => {
    if (status !== 'playing' || !!validation || !!currentVideoId) return;

    const alreadyStarted = lastAutoStartedTurnRef.current.teamIndex === currentTeamIndex && 
                           lastAutoStartedTurnRef.current.letter === currentLetter;

    if (!alreadyStarted) {
      lastAutoStartedTurnRef.current = { teamIndex: currentTeamIndex, letter: currentLetter };
      dispatchDebugLog('Auto-starting recognition for new turn...');
      startEngineRecognition();
    }
  }, [currentTeamIndex, currentLetter, status, validation, currentVideoId]);

  const updateDetectorStateFromEngine = useCallback(() => {
    const engineState = songRecognitionEngine.getState();
    const confLabel = engineState.detectionResult 
      ? ConfidenceEngine.getConfidenceLabel(engineState.detectionResult.confidence)
      : null;
    
    setDetectorState(prev => ({
      ...prev,
      stage: engineState.stage,
      stageInfo: engineState.stageInfo,
      currentAttempt: engineState.currentAttempt + 1,
      maxAttempts: engineState.maxAttempts,
      recognizedText: engineState.recognizedTexts[engineState.recognizedTexts.length - 1]?.text || '',
      confidence: engineState.detectionResult?.confidence || 0,
      confidenceLabel: confLabel,
      detectionResult: engineState.detectionResult,
    }));
  }, [dispatchDebugLog]);

  const startEngineRecognition = async () => {
    dispatchDebugLog('Starting multi-engine song recognition...');
    
    setDetectorState(prev => ({
      ...prev,
      elapsed: 0,
      stage: 'listening'
    }));

    const timer = setInterval(() => {
      setDetectorState(prev => {
        if (prev.stage === 'idle' || prev.stage === 'complete' || prev.stage === 'failed') {
          clearInterval(timer);
          return prev;
        }
        return { ...prev, elapsed: prev.elapsed + 1 };
      });
    }, 1000);

    try {
      await songRecognitionEngine.startRecognition({
        requiredLetter: currentLetter,
        language: settings.allLanguagesMode ? 'all' : (settings.recognitionLanguages?.[0] || 'all'),
        autoMode: settings.recognitionMode === 'auto',
        onStageChange: (stage, stageInfo) => {
          updateDetectorStateFromEngine();
        },
        onTextDetected: (text, confidence, engine) => {
          updateDetectorStateFromEngine();
        },
        onLevelChange: (level, dB) => {
          setDetectorState(prev => ({ ...prev, audioLevel: level }));
        },
        onResultReady: async (result) => {
          updateDetectorStateFromEngine();
          
          if (result && result.songName) {
            // Auto mode & high confidence -> auto approve & play!
            if (result.confidence >= 50 && settings.recognitionMode === 'auto') {
              setSongTitle(result.songName);
              setArtist(result.artist || '');
              setMovie(result.movie || '');
              setLanguage(result.language || 'hindi');

              const songId = submitSong({
                songTitle: result.songName,
                artist: result.artist || '',
                movie: result.movie || '',
                language: result.language || 'hindi'
              });

              if (songId) {
                approveSong(songId);
                setScoreBump(currentTeam?.id);
                setTimeout(() => setScoreBump(null), 600);
              }

              setValidation({
                status: 'approved',
                reason: `Auto approved (${result.confidence}% confidence)`,
                confidence: result.confidence
              });

              // Playback lookup
              const ytResult = await songRecognitionEngine._validateWithYouTube(result.songName, result.artist);
              if (ytResult.videoId) {
                setCurrentVideoId(ytResult.videoId);
                autoPlayEngine.setPlaybackDuration(0); // infinite
                if (settings.autoPlayEnabled) {
                  autoPlayEngine.playSong(ytResult.videoId, result.songName);
                } else {
                  autoPlayEngine.currentVideoId = ytResult.videoId;
                  autoPlayEngine.currentSongTitle = result.songName;
                  if (autoPlayEngine.player && autoPlayEngine.player.cueVideoById) {
                    autoPlayEngine.player.cueVideoById({
                      videoId: ytResult.videoId,
                      startSeconds: 30
                    });
                    autoPlayEngine._setState('stopped');
                  }
                }
              }

              addToast({
                type: 'success',
                title: 'Song Confirmed!',
                message: `"${result.songName}" matched with ${result.confidence}% confidence.`
              });

              setTimeout(() => {
                setDetectorState(prev => ({ ...prev, stage: 'idle' }));
              }, 1500);
            } else {
              // Keep overlay open at complete stage to allow host review/override
              setDetectorState(prev => ({
                ...prev,
                stage: 'complete',
                detectionResult: result,
                confidence: result.confidence,
              }));
              addToast({
                type: 'info',
                title: 'Review Required',
                message: `Confidence is ${result.confidence}%. Host review required.`
              });
            }
          }
        },
        onError: (err) => {
          dispatchDebugLog(`Recognition engine error: ${err.message}`);
          updateDetectorStateFromEngine();
        }
      });
    } catch (err) {
      console.error(err);
      dispatchDebugLog(`Failed to start recognition: ${err.message}`);
    }
  };

  const stopEngineRecognition = () => {
    songRecognitionEngine.stopRecognition();
    setDetectorState(prev => ({ ...prev, stage: 'idle' }));
    dispatchDebugLog('Song recognition manually stopped.');
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
    } else {
      const songId = submitSong({ songTitle, artist, movie, language });
      if (songId) rejectSong(songId);
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
        
        autoPlayEngine.setPlaybackDuration(0); // infinite
        if (settings.autoPlayEnabled) {
          autoPlayEngine.playSong(videoId, title);
        } else {
          autoPlayEngine.currentVideoId = videoId;
          autoPlayEngine.currentSongTitle = title;
          if (autoPlayEngine.player && autoPlayEngine.player.cueVideoById) {
            autoPlayEngine.player.cueVideoById({
              videoId,
              startSeconds: 30
            });
            autoPlayEngine._setState('stopped');
          }
        }
      }
    } catch (err) {
      console.error('YouTube search lookup failed:', err);
      dispatchDebugLog(`YouTube Search API check failed: ${err.message}`);
    }
  };

  const handleApproveOverride = async () => {
    dispatchDebugLog('Host approved song override.');
    const result = detectorState.detectionResult;
    if (result && result.songName) {
      setSongTitle(result.songName);
      setArtist(result.artist || '');
      setMovie(result.movie || '');
      setLanguage(result.language || 'hindi');

      const songId = submitSong({
        songTitle: result.songName,
        artist: result.artist || '',
        movie: result.movie || '',
        language: result.language || 'hindi'
      });

      if (songId) {
        approveSong(songId);
        setScoreBump(currentTeam?.id);
        setTimeout(() => setScoreBump(null), 600);
      }

      setValidation({
        status: 'approved',
        reason: 'Host approved override',
        confidence: result.confidence || 100
      });

      const ytResult = await songRecognitionEngine._validateWithYouTube(result.songName, result.artist);
      if (ytResult.videoId) {
        setCurrentVideoId(ytResult.videoId);
        autoPlayEngine.setPlaybackDuration(0);
        if (settings.autoPlayEnabled) {
          autoPlayEngine.playSong(ytResult.videoId, result.songName);
        } else {
          autoPlayEngine.currentVideoId = ytResult.videoId;
          autoPlayEngine.currentSongTitle = result.songName;
          if (autoPlayEngine.player && autoPlayEngine.player.cueVideoById) {
            autoPlayEngine.player.cueVideoById({ videoId: ytResult.videoId, startSeconds: 30 });
            autoPlayEngine._setState('stopped');
          }
        }
      }

      addToast({
        type: 'success',
        title: 'Song Confirmed!',
        message: `"${result.songName}" approved by Host override.`
      });
    }
    setDetectorState(prev => ({ ...prev, stage: 'idle' }));
  };

  const handleRejectOverride = () => {
    dispatchDebugLog('Host rejected song match.');
    const result = detectorState.detectionResult;
    if (result && result.songName) {
      const songId = submitSong({
        songTitle: result.songName,
        artist: result.artist || '',
        movie: result.movie || '',
        language: result.language || 'hindi'
      });
      if (songId) {
        rejectSong(songId);
      }
      setValidation({
        status: 'rejected',
        reason: 'Host rejected override',
        confidence: result.confidence || 0
      });

      addToast({
        type: 'error',
        title: 'Song Rejected',
        message: `"${result.songName}" rejected by Host.`
      });
    }
    setDetectorState(prev => ({ ...prev, stage: 'idle' }));
  };

  const handleSelectAlternative = async (alt) => {
    dispatchDebugLog(`Host selected alternative song: "${alt.songName || alt.title}"`);
    const selectedSongName = alt.songName || alt.title;
    const selectedArtist = alt.artist || '';
    const selectedMovie = alt.movie || '';
    const selectedLanguage = alt.language || 'hindi';

    setSongTitle(selectedSongName);
    setArtist(selectedArtist);
    setMovie(selectedMovie);
    setLanguage(selectedLanguage);

    const songId = submitSong({
      songTitle: selectedSongName,
      artist: selectedArtist,
      movie: selectedMovie,
      language: selectedLanguage
    });

    if (songId) {
      approveSong(songId);
      setScoreBump(currentTeam?.id);
      setTimeout(() => setScoreBump(null), 600);
    }

    setValidation({
      status: 'approved',
      reason: 'Host selected alternative candidate',
      confidence: alt.confidence || 100
    });

    const ytResult = await songRecognitionEngine._validateWithYouTube(selectedSongName, selectedArtist);
    if (ytResult.videoId) {
      setCurrentVideoId(ytResult.videoId);
      autoPlayEngine.setPlaybackDuration(0);
      if (settings.autoPlayEnabled) {
        autoPlayEngine.playSong(ytResult.videoId, selectedSongName);
      } else {
        autoPlayEngine.currentVideoId = ytResult.videoId;
        autoPlayEngine.currentSongTitle = selectedSongName;
        if (autoPlayEngine.player && autoPlayEngine.player.cueVideoById) {
          autoPlayEngine.player.cueVideoById({ videoId: ytResult.videoId, startSeconds: 30 });
          autoPlayEngine._setState('stopped');
        }
      }
    }

    addToast({
      type: 'success',
      title: 'Song Confirmed!',
      message: `"${selectedSongName}" approved from alternative candidates.`
    });

    setDetectorState(prev => ({ ...prev, stage: 'idle' }));
  };

  const handleNextTurn = () => {
    dispatchDebugLog('Manually advancing to next turn.');
    autoPlayEngine.stop();
    nextTurn();
    setValidation(null);
    setSongTitle('');
    setArtist('');
    setMovie('');
    setCurrentVideoId('');
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
          {/* Round info & Mini Settings */}
          <div className="flex items-center gap-3 flex-wrap justify-center" style={{ marginBottom: 'var(--space-6)' }}>
            <span className="badge badge-primary">Round {currentRound} of {totalRounds}</span>
            <span className="badge badge-secondary" style={{ textTransform: 'capitalize' }}>{settings.gameMode} Mode</span>
            {status === 'paused' && <span className="badge badge-warning badge-pulse">⏸ PAUSED</span>}
            
            <button 
              onClick={() => useGameStore.getState().toggleAutoPlay()} 
              className={`btn btn-xs ${settings.autoPlayEnabled ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '2px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              Auto Play: {settings.autoPlayEnabled ? 'ON' : 'OFF'}
            </button>
            
            <button 
              onClick={() => useGameStore.getState().toggleAllLanguages()} 
              className={`btn btn-xs ${settings.allLanguagesMode ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '2px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              All Languages: {settings.allLanguagesMode ? 'ON' : 'OFF'}
            </button>
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
                  placeholder={detectorState.stage !== 'idle' ? `Recording... hum your song!` : `Sing a song starting with "${currentLetter || '?'}"...`}
                  disabled={!!validation || status !== 'playing' || detectorState.stage !== 'idle'} autoFocus
                  style={{ paddingRight: 90 }} />
                
                {/* Microphones Control Button */}
                <button
                  onClick={detectorState.stage !== 'idle' ? stopEngineRecognition : startEngineRecognition}
                  disabled={!!validation || status !== 'playing'}
                  className={`btn ${detectorState.stage !== 'idle' ? 'btn-danger animate-pulse' : 'btn-ghost'}`}
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
                  title={detectorState.stage !== 'idle' ? 'Click to stop recording' : 'Record your song'}
                >
                  {detectorState.stage !== 'idle' ? <MicOff size={18} /> : <Mic size={18} style={{ color: 'var(--primary-400)' }} />}
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

            <div className="grid grid-3 gap-3" style={{ marginBottom: 'var(--space-4)' }}>
              <input className="input" value={artist} onChange={e => setArtist(e.target.value)} placeholder="Artist" disabled={!!validation || detectorState.stage !== 'idle'} />
              <input className="input" value={movie} onChange={e => setMovie(e.target.value)} placeholder="Movie" disabled={!!validation || detectorState.stage !== 'idle'} />
              <select className="input" value={language} onChange={e => setLanguage(e.target.value)} disabled={!!validation || detectorState.stage !== 'idle'}
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
              <button onClick={handleSubmit} className="btn btn-primary btn-lg" style={{ flex: 1 }} disabled={!songTitle.trim() || !!validation || status !== 'playing' || detectorState.stage !== 'idle'}>
                <Send size={18} /> Submit Song
              </button>
              <button onClick={handleSkip} className="btn btn-ghost btn-lg" disabled={!!validation || status !== 'playing' || !settings.allowSkip || detectorState.stage !== 'idle'}>
                <SkipForward size={18} /> Skip
              </button>
              <button onClick={() => status === 'paused' ? resumeMatch() : pauseMatch()} className="btn btn-ghost btn-lg" disabled={detectorState.stage !== 'idle'}>
                {status === 'paused' ? <Play size={18} /> : <Pause size={18} />}
              </button>
            </div>

            {/* Premium Song Details Display */}
            <AnimatePresence>
              {validation && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }} 
                  className="card" 
                  style={{
                    marginTop: 'var(--space-4)',
                    padding: 'var(--space-4)',
                    background: validation.status === 'approved' 
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)' 
                      : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
                    border: validation.status === 'approved' 
                      ? '1px solid rgba(16, 185, 129, 0.25)' 
                      : '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <span className="badge" style={{
                        background: validation.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: validation.status === 'approved' ? 'var(--success-400)' : 'var(--error-400)',
                        borderColor: validation.status === 'approved' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
                        borderWidth: '1px',
                        borderStyle: 'solid',
                        fontSize: '10px',
                        padding: '2px 8px'
                      }}>
                        {validation.status === 'approved' ? '✓ APPROVED' : '✗ REJECTED'}
                      </span>
                      <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold', color: 'var(--text-primary)', marginTop: 8, marginBottom: 4 }}>
                        {songTitle}
                      </h4>
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{validation.reason}</p>
                    </div>
                    {validation.confidence !== undefined && (
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Confidence</div>
                        <div style={{
                          fontSize: 'var(--text-lg)',
                          fontWeight: 'bold',
                          color: validation.confidence >= 70 ? 'var(--success-400)' :
                                 validation.confidence >= 50 ? 'var(--warning-400)' : 'var(--error-400)'
                        }}>
                          {validation.confidence}%
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px 12px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                    <div>Artist: <strong style={{ color: 'var(--text-primary)' }}>{artist || 'Unknown'}</strong></div>
                    <div>Movie: <strong style={{ color: 'var(--text-primary)' }}>{movie || 'N/A'}</strong></div>
                    <div>Language: <strong style={{ color: 'var(--text-primary)' }}>{language || 'N/A'}</strong></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* YouTube Player & Admin Playback Control Panel */}
            <div className="card" style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', display: currentVideoId ? 'block' : 'none' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 'bold' }}>
                  <Volume2 size={12} style={{ color: 'var(--secondary-400)' }} /> YouTube Playback & Admin Controls
                </span>
                {isPlaying ? (
                  <span className="badge badge-success badge-pulse" style={{ fontSize: '9px', padding: '2px 6px' }}>PLAYING</span>
                ) : (
                  <span className="badge badge-ghost" style={{ fontSize: '9px', padding: '2px 6px' }}>STOPPED</span>
                )}
              </div>
              
              <div style={{ borderRadius: 8, overflow: 'hidden', background: '#000', display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <div id="yt-player-element"></div>
              </div>

              {/* Admin Playback Controls */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                <button onClick={() => autoPlayEngine.playSong(currentVideoId, songTitle)} className="btn btn-ghost btn-sm" style={{ padding: '6px 12px', gap: 4 }} title="Play">
                  <Play size={14} /> Play
                </button>
                <button onClick={() => autoPlayEngine.pause()} className="btn btn-ghost btn-sm" style={{ padding: '6px 12px', gap: 4 }} title="Pause">
                  <Pause size={14} /> Pause
                </button>
                <button onClick={() => autoPlayEngine.resume()} className="btn btn-ghost btn-sm" style={{ padding: '6px 12px', gap: 4 }} title="Resume">
                  Resume
                </button>
                <button onClick={() => autoPlayEngine.stop()} className="btn btn-ghost btn-sm" style={{ padding: '6px 12px', gap: 4 }} title="Stop">
                  Stop
                </button>
                <button onClick={() => autoPlayEngine.replay()} className="btn btn-ghost btn-sm" style={{ padding: '6px 12px', gap: 4 }} title="Replay">
                  Replay
                </button>
                <button onClick={handleNextTurn} className="btn btn-primary btn-sm" style={{ padding: '6px 16px', background: 'var(--gradient-gold)', gap: 4 }} title="Next Turn">
                  Next Song
                </button>
              </div>
            </div>
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

      <SongDetector 
        {...detectorState} 
        onClose={stopEngineRecognition} 
        onApprove={handleApproveOverride}
        onReject={handleRejectOverride}
        onSelectAlternative={handleSelectAlternative}
      />

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
