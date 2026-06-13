import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, Cpu, Video, Radio, Database, ShieldAlert, X, AlertTriangle, CheckCircle, RefreshCw
} from 'lucide-react';
import { syncEngine } from '../../engine/SyncEngine';
import db from '../../db/database';
import { songRecognitionEngine } from '../../engine/SongRecognitionEngine.js';
import { LearningEngine } from '../../engine/LearningEngine.js';

export default function DebugPanel({ isOpen, onClose }) {
  const [micStatus, setMicStatus] = useState('unknown');
  const [wsStatus, setWsStatus] = useState(syncEngine.socketStatus);
  const [whisperStatus, setWhisperStatus] = useState('idle');
  const [ytPlayerStatus, setYtPlayerStatus] = useState('unloaded');
  const [dbStatus, setDbStatus] = useState('connected');
  const [logs, setLogs] = useState([]);
  const [pipelineState, setPipelineState] = useState(null);
  const [learningStats, setLearningStats] = useState(null);

  // Load diagnostic states and subscribe to events
  useEffect(() => {
    // 1. Check microphone permission status
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' }).then(permissionStatus => {
        setMicStatus(permissionStatus.state);
        permissionStatus.onchange = () => {
          setMicStatus(permissionStatus.state);
          addLog(`Microphone permission state changed: ${permissionStatus.state}`);
        };
      }).catch(() => {
        setMicStatus('unsupported');
      });
    } else {
      setMicStatus('unsupported');
    }

    // 2. Listen to WebSocket status changes
    const unsubWs = syncEngine.on('ws_status_change', (payload) => {
      setWsStatus(payload.status);
      addLog(`WebSocket connection status: ${payload.status}`);
    });

    // 3. Listen to local debug log broadcasts
    const handleLogBroadcast = (payload) => {
      if (payload.log) {
        addLog(payload.log);
      }
    };
    const unsubLog = syncEngine.on('debug_log', handleLogBroadcast);

    // 4. Test database connection
    db.matches.count().then(count => {
      setDbStatus('connected');
      addLog(`IndexedDB connected. Current matches count: ${count}`);
    }).catch(err => {
      setDbStatus('error');
      addLog(`IndexedDB error: ${err.message}`);
    });

    // Add initial log
    addLog('Developer diagnostics engine initialized.');

    // 5. Poll engine state periodically when panel is open
    const pollTimer = setInterval(() => {
      if (songRecognitionEngine.isActive) {
        setPipelineState(songRecognitionEngine.getState());
      } else {
        setPipelineState(null);
      }
    }, 500);

    // 6. Fetch learning engine stats
    LearningEngine.getAccuracyStats().then(stats => {
      setLearningStats(stats);
    }).catch(() => {});

    return () => {
      unsubWs();
      unsubLog();
      clearInterval(pollTimer);
    };
  }, []);

  // Listen to custom window events for YouTube/Whisper diagnostic changes
  useEffect(() => {
    const handleYtChange = (e) => {
      setYtPlayerStatus(e.detail.status);
      addLog(`YouTube Player event: ${e.detail.status}`);
    };
    
    const handleWhisperChange = (e) => {
      setWhisperStatus(e.detail.status);
      addLog(`Whisper API event: ${e.detail.status}`);
    };

    window.addEventListener('yt-player-status', handleYtChange);
    window.addEventListener('whisper-status', handleWhisperChange);

    return () => {
      window.removeEventListener('yt-player-status', handleYtChange);
      window.removeEventListener('whisper-status', handleWhisperChange);
    };
  }, []);

  const addLog = (msg) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    setLogs(prev => [{ time: timeStr, msg }, ...prev].slice(0, 100));
  };

  const handleTestPing = async () => {
    addLog('Testing backend API connectivity...');
    try {
      // Hit a dummy endpoint or check server
      const response = await fetch('http://localhost:3001/api/youtube-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'test' })
      });
      if (response.ok) {
        addLog('Backend server responsive. YouTube API search match verified.');
      } else {
        addLog(`Backend server responded with status: ${response.status}`);
      }
    } catch (err) {
      addLog(`Backend connectivity failed: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '380px',
      height: '600px',
      background: 'rgba(10, 10, 26, 0.95)',
      border: '1px solid rgba(124, 58, 237, 0.3)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7), 0 0 20px rgba(124, 58, 237, 0.1)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(124, 58, 237, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={16} style={{ color: 'var(--primary-400)' }} />
          <span style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>DEVELOPER DEBUG PANEL</span>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4 }}>
          <X size={16} />
        </button>
      </div>

      {/* Grid Status */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        padding: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        {/* Mic Status */}
        <div style={{
          padding: '8px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Mic size={14} style={{ color: micStatus === 'granted' ? 'var(--success-400)' : 'var(--error-400)' }} />
          <div style={{ fontSize: '10px' }}>
            <div style={{ color: 'var(--text-muted)' }}>Microphone</div>
            <div style={{ fontWeight: 'bold', color: micStatus === 'granted' ? 'var(--success-400)' : 'var(--warning-400)' }}>
              {micStatus.toUpperCase()}
            </div>
          </div>
        </div>

        {/* WS Status */}
        <div style={{
          padding: '8px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Radio size={14} style={{ color: wsStatus === 'OPEN' ? 'var(--success-400)' : 'var(--error-400)' }} />
          <div style={{ fontSize: '10px' }}>
            <div style={{ color: 'var(--text-muted)' }}>WebSocket</div>
            <div style={{ fontWeight: 'bold', color: wsStatus === 'OPEN' ? 'var(--success-400)' : 'var(--error-400)' }}>
              {wsStatus}
            </div>
          </div>
        </div>

        {/* Whisper Status */}
        <div style={{
          padding: '8px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Cpu size={14} style={{ color: whisperStatus === 'transcribing' ? 'var(--warning-400)' : 'var(--primary-400)' }} />
          <div style={{ fontSize: '10px' }}>
            <div style={{ color: 'var(--text-muted)' }}>Whisper API</div>
            <div style={{ fontWeight: 'bold', color: whisperStatus === 'transcribing' ? 'var(--warning-400)' : 'white' }}>
              {whisperStatus.toUpperCase()}
            </div>
          </div>
        </div>

        {/* YouTube Status */}
        <div style={{
          padding: '8px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Video size={14} style={{ color: ytPlayerStatus === 'playing' ? 'var(--success-400)' : 'var(--secondary-400)' }} />
          <div style={{ fontSize: '10px' }}>
            <div style={{ color: 'var(--text-muted)' }}>YouTube Player</div>
            <div style={{ fontWeight: 'bold', color: ytPlayerStatus === 'playing' ? 'var(--success-400)' : 'white' }}>
              {ytPlayerStatus.toUpperCase()}
            </div>
          </div>
        </div>

        {/* DB Status */}
        <div style={{
          padding: '8px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          gridColumn: 'span 2'
        }}>
          <Database size={14} style={{ color: dbStatus === 'connected' ? 'var(--success-400)' : 'var(--error-400)' }} />
          <div style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>IndexedDB: </span>
              <span style={{ fontWeight: 'bold', color: 'var(--success-400)' }}>ACTIVE</span>
            </div>
            <button onClick={handleTestPing} style={{ fontSize: '9px', background: 'transparent', border: 'none', color: 'var(--primary-400)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
              <RefreshCw size={8} /> Test Backend Connection
            </button>
          </div>
        </div>

        {/* Learning Stats */}
        {learningStats && (
          <div style={{
            padding: '8px',
            background: 'rgba(245, 158, 11, 0.02)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            gridColumn: 'span 2'
          }}>
            <Cpu size={14} style={{ color: 'var(--warning-400)' }} />
            <div style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>AI Learning Stats: </span>
                <span style={{ fontWeight: 'bold', color: 'var(--warning-400)' }}>{learningStats.overall}% Accuracy</span>
              </div>
              <div style={{ color: 'var(--text-tertiary)' }}>
                {learningStats.totalCorrections} Corrections
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pipeline Telemetry */}
      {pipelineState && (
        <div style={{
          padding: '12px',
          background: 'rgba(124, 58, 237, 0.08)',
          borderBottom: '1px solid rgba(124, 58, 237, 0.15)',
          fontSize: '11px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <div style={{ fontWeight: 'bold', color: 'var(--primary-300)', display: 'flex', justifyContent: 'space-between' }}>
            <span>⚡ AI RECOGNITION PIPELINE</span>
            <span>Attempt {pipelineState.currentAttempt}/{pipelineState.maxAttempts}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Stage:</span> <span style={{ fontWeight: 'bold', color: 'var(--secondary-400)' }}>{pipelineState.stage.toUpperCase()}</span></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Audio Level:</span> <span style={{ fontWeight: 'bold' }}>{Math.round(pipelineState.audioMetrics?.dB || 0)} dB</span></div>
          </div>
          {pipelineState.recognizedTexts.length > 0 && (
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '9px', marginBottom: 2 }}>Transcribed Lyrics:</div>
              <div style={{ color: 'var(--warning-300)', fontWeight: 'bold' }}>
                "{pipelineState.recognizedTexts[pipelineState.recognizedTexts.length - 1]?.text}"
              </div>
            </div>
          )}
          {pipelineState.detectionResult && (
            <div style={{ background: 'rgba(16,185,129,0.06)', padding: '6px', borderRadius: '4px', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div style={{ fontWeight: 'bold', color: 'var(--success-400)' }}>Song Found: {pipelineState.detectionResult.songName}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Artist: {pipelineState.detectionResult.artist} • Confidence: {pipelineState.detectionResult.confidence}%</div>
            </div>
          )}
        </div>
      )}

      {/* Terminal Logs */}
      <div style={{
        flex: 1,
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        overflow: 'hidden'
      }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>System Trace Logs:</div>
        <div style={{
          flex: 1,
          background: 'rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '6px',
          padding: '8px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {logs.map((log, i) => (
            <div key={i} style={{ color: log.msg.includes('error') ? 'var(--error-400)' : log.msg.includes('warning') ? 'var(--warning-400)' : 'var(--text-secondary)' }}>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>[{log.time}]</span> {log.msg}
            </div>
          ))}
          {logs.length === 0 && (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '12px' }}>
              No telemetry captured yet.
            </div>
          )}
        </div>
      </div>

      {/* Footer warning */}
      <div style={{
        padding: '8px 12px',
        background: 'rgba(245, 158, 11, 0.04)',
        borderTop: '1px solid rgba(245, 158, 11, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '10px',
        color: 'var(--warning-400)'
      }}>
        <ShieldAlert size={12} />
        <span>Admin Sandbox mode active. Hotkeys: Ctrl + Alt + D toggles this console.</span>
      </div>
    </div>
  );
}
