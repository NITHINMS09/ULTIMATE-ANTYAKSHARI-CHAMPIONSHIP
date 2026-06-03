import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Server, Activity, Database, AlertCircle, PlayCircle,
  RefreshCw, Trash2, Download, Upload, ShieldAlert, Cpu, HardDrive
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useAppStore } from '../store/appStore';
import { useToast } from '../components/ui/Toast';

export default function AdminDashboard() {
  const { addToast } = useToast();
  const { matchId, status, resetGame, teams } = useGameStore();
  const { resetApp } = useAppStore();

  const [logs, setLogs] = useState([
    { id: 1, type: 'info', time: '12:28:01', msg: 'System initialized. IndexedDB connection established.' },
    { id: 2, type: 'info', time: '12:28:03', msg: 'BroadcastChannel synced: "uac-sync" active.' },
    { id: 3, type: 'warn', time: '12:28:10', msg: 'Audio system latency exceeds 150ms. Adjusting buffer size.' }
  ]);

  const [telemetry, setTelemetry] = useState({
    fps: 60,
    latency: 2,
    memory: 45.4,
    dbSize: 124
  });

  const [configs, setConfigs] = useState({
    debugLogs: true,
    simulateLatency: false,
    autoplayBots: false
  });

  // Telemetry fluctuation simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        fps: Math.round(58 + Math.random() * 2),
        latency: Math.round(1 + Math.random() * 3),
        memory: Math.round((45 + Math.random() * 1.5) * 10) / 10,
        dbSize: prev.dbSize
      }));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleAddTestLog = () => {
    const types = ['info', 'warn', 'error'];
    const msgs = [
      'Duplicate song submission intercepted: "Kesariya". Rejecting entry.',
      'Offline session backup snapshot saved (IndexedDB: uac_recovery_state).',
      'API Validation handshake failed. Rolling back to offline dictionaries.'
    ];
    const randType = types[Math.floor(Math.random() * types.length)];
    const randMsg = msgs[Math.floor(Math.random() * msgs.length)];
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    setLogs(prev => [
      { id: Date.now(), type: randType, time: timeStr, msg: randMsg },
      ...prev
    ]);

    addToast({
      type: randType === 'error' ? 'error' : randType === 'warn' ? 'warning' : 'info',
      title: 'Admin Alert',
      message: `New system event logged: ${randMsg.slice(0, 30)}...`
    });
  };

  const handleResetData = () => {
    if (window.confirm('WARNING: This will completely erase the game state and all local records. Are you sure?')) {
      resetGame();
      resetApp();
      setLogs([]);
      addToast({
        type: 'error',
        title: 'System Cleaned',
        message: 'All local database entries and Zustand stores have been reset.'
      });
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      matchId,
      status,
      teams,
      timestamp: Date.now(),
      version: '2.0.0-admin'
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `uac_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast({
      type: 'success',
      title: 'Database Exported',
      message: 'A JSON backup file has been saved to your downloads.'
    });
  };

  const handleImportBackup = () => {
    // Simulate import trigger
    addToast({
      type: 'info',
      title: 'Import Sandbox',
      message: 'Standard file upload handler active. Verify checksum matches v2.0 schema.'
    });
  };

  return (
    <div className="page">
      <div className="container" style={{ paddingBottom: 'var(--space-12)' }}>
        
        {/* Header */}
        <div className="page-header" style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <span className="label">Diagnostics Center</span>
          <h2 className="heading-2">⚙ Admin Dashboard & Control</h2>
          <p>Monitor local engine performance metrics, telemetry feeds, database schemas, and debug logs.</p>
        </div>

        <div className="grid grid-3 gap-6" style={{ alignItems: 'start' }}>
          
          {/* Column 1 & 2: Telemetry & Logs */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            {/* System Performance Grid */}
            <div className="grid grid-4 gap-4">
              {[
                { label: 'UI Frame Rate', val: `${telemetry.fps} FPS`, desc: 'Optimized 60 FPS', icon: Cpu, color: 'var(--success-400)' },
                { label: 'Render Delay', val: `${telemetry.latency} ms`, desc: 'DOM rendering', icon: Activity, color: 'var(--secondary-400)' },
                { label: 'Heap Memory', val: `${telemetry.memory} MB`, desc: 'Zustand garbage load', icon: HardDrive, color: 'var(--primary-400)' },
                { label: 'IndexedDB', val: `${telemetry.dbSize} KB`, desc: 'History snapshots', icon: Database, color: 'var(--accent-400)' }
              ].map((m, i) => (
                <div key={i} className="card" style={{ padding: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.label}</span>
                    <m.icon size={14} style={{ color: m.color }} />
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'white' }}>{m.val}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: 4 }}>{m.desc}</div>
                </div>
              ))}
            </div>

            {/* Event Console Logger */}
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                <h3 className="heading-4" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Server size={18} style={{ color: 'var(--primary-400)' }} />
                  Real-time Event Logger Console
                </h3>

                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={handleAddTestLog} style={{ fontSize: '11px' }}>
                    Trigger Test Event
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setLogs([])} style={{ fontSize: '11px' }}>
                    <Trash2 size={12} style={{ marginRight: 4 }} /> Clear
                  </button>
                </div>
              </div>

              {/* Logger terminal window */}
              <div style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                padding: '12px',
                fontFamily: 'monospace',
                fontSize: '11px',
                maxHeight: '220px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}>
                {logs.map(log => (
                  <div key={log.id} style={{
                    display: 'flex',
                    gap: 12,
                    color: log.type === 'error' ? '#fb7185' : log.type === 'warn' ? '#fbbf24' : '#94a3b8'
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.3)' }}>[{log.time}]</span>
                    <span style={{ fontWeight: 'bold', textTransform: 'uppercase', width: 45 }}>{log.type}</span>
                    <span style={{ flex: 1 }}>{log.msg}</span>
                  </div>
                ))}
                {logs.length === 0 && (
                  <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
                    No system logs recorded. Trigger a test event.
                  </div>
                )}
              </div>
            </div>

            {/* Active Match Telemetry */}
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <h3 className="heading-4" style={{ marginBottom: 'var(--space-3)' }}>Zustand Game State Telemetry</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Match Instance ID</div>
                  <div style={{ fontWeight: 'bold', color: 'white', marginTop: 2, fontSize: '13px' }}>{matchId || 'UAC-NULL'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lifecycle Status</div>
                  <div style={{ fontWeight: 'bold', color: 'var(--primary-400)', marginTop: 2, fontSize: '13px' }}>{status.toUpperCase()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Registered Teams</div>
                  <div style={{ fontWeight: 'bold', color: 'white', marginTop: 2, fontSize: '13px' }}>{teams.length} teams</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Persistence Namespace</div>
                  <div style={{ fontWeight: 'bold', color: 'white', marginTop: 2, fontSize: '13px' }}>uac-game-store</div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Database backup and simulation parameters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            {/* Database backups */}
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <h4 className="heading-4" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 12 }}>
                Backup & Restore
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 16 }}>
                Export local tournament archives or import v2.0 backups.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn btn-primary" onClick={handleExportBackup} style={{ width: '100%', gap: 6, fontSize: '12px' }}>
                  <Download size={14} /> Export Backup JSON
                </button>
                <button className="btn btn-ghost" onClick={handleImportBackup} style={{ width: '100%', gap: 6, fontSize: '12px' }}>
                  <Upload size={14} /> Import Backup JSON
                </button>
              </div>
            </div>

            {/* Simulation settings toggles */}
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <h4 className="heading-4" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 12 }}>
                Simulation Tools
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                
                <div style={{ display: 'flex', justifySpace: 'between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Verbose Output</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 2 }}>Write trace logs into the logger.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={configs.debugLogs}
                    onChange={e => setConfigs({ ...configs, debugLogs: e.target.checked })}
                    style={{ accentColor: 'var(--primary-500)', width: 16, height: 16 }}
                  />
                </div>

                <div style={{ display: 'flex', justifySpace: 'between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Simulate Network Lag</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 2 }}>Throttles validation requests to 1.5s.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={configs.simulateLatency}
                    onChange={e => setConfigs({ ...configs, simulateLatency: e.target.checked })}
                    style={{ accentColor: 'var(--primary-500)', width: 16, height: 16 }}
                  />
                </div>

                <div style={{ display: 'flex', justifySpace: 'between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Bot Autoplay Simulator</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: 2 }}>Automates round changes for test stress.</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={configs.autoplayBots}
                    onChange={e => setConfigs({ ...configs, autoplayBots: e.target.checked })}
                    style={{ accentColor: 'var(--primary-500)', width: 16, height: 16 }}
                  />
                </div>

              </div>
            </div>

            {/* Danger Zone */}
            <div className="card" style={{ padding: 'var(--space-4)', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.03)' }}>
              <h4 className="heading-4" style={{ fontSize: 'var(--text-sm)', color: '#fb7185', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldAlert size={14} /> Danger Zone
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 12 }}>
                Clearing local storage restores the application context to factory defaults.
              </p>
              <button className="btn btn-danger" onClick={handleResetData} style={{ width: '100%', fontSize: '12px' }}>
                <Trash2 size={14} style={{ marginRight: 6 }} /> Reset All Cache
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
