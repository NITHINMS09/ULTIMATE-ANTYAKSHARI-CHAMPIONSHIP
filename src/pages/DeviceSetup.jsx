import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Smartphone, Monitor, Crown, Settings, Key, Link as LinkIcon,
  CheckCircle, Radio, Activity, RefreshCw, AlertCircle, ArrowRight
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useGameStore } from '../store/gameStore';
import { syncEngine } from '../engine/SyncEngine';
import { useToast } from '../components/ui/Toast';

export default function DeviceSetup() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { deviceRole, setDeviceRole, sessionCode, generateSessionCode } = useAppStore();
  const { matchId, status } = useGameStore();

  const [enteredCode, setEnteredCode] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeConnections, setActiveConnections] = useState([]);
  const connectionsRef = useRef([]);

  // Sync heartbeats
  useEffect(() => {
    // Set initial sync role
    syncEngine.setRole(deviceRole);

    // Heartbeat sender interval
    const heartbeatInterval = setInterval(() => {
      syncEngine.heartbeat();
    }, 2000);

    // Initial state request
    syncEngine.requestState();

    // Listen for heartbeats & role changes
    const unsubHeartbeat = syncEngine.on('heartbeat', (payload, meta) => {
      handleDeviceMessage(meta.sender, payload.role);
    });

    const unsubRoleChange = syncEngine.on('role_change', (payload, meta) => {
      handleDeviceMessage(meta.sender, payload.role);
    });

    // Cleanup stale connections (older than 6 seconds)
    const cleanupInterval = setInterval(() => {
      const cutoff = Date.now() - 6000;
      const active = connectionsRef.current.filter(conn => conn.timestamp > cutoff);
      connectionsRef.current = active;
      setActiveConnections(active);
    }, 3000);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(cleanupInterval);
      unsubHeartbeat();
      unsubRoleChange();
    };
  }, [deviceRole]);

  const handleDeviceMessage = (senderId, role) => {
    const existingIndex = connectionsRef.current.findIndex(conn => conn.role === role);
    const now = Date.now();

    if (existingIndex > -1) {
      connectionsRef.current[existingIndex] = { role, timestamp: now, id: senderId };
    } else {
      connectionsRef.current = [...connectionsRef.current, { role, timestamp: now, id: senderId }];
    }
    setActiveConnections(connectionsRef.current);
  };

  const handleRoleSelect = (role) => {
    setDeviceRole(role);
    syncEngine.setRole(role);
    addToast({
      type: 'info',
      title: 'Device Role Changed',
      message: `This device is now configured as a ${role.toUpperCase()}`
    });
  };

  const handleGenerateCode = () => {
    const code = generateSessionCode();
    addToast({
      type: 'success',
      title: 'Session Code Generated',
      message: `Your match session code is: ${code}`
    });
  };

  const handleConnectSession = (e) => {
    e.preventDefault();
    if (!enteredCode.trim()) return;

    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      addToast({
        type: 'success',
        title: 'Connection Successful',
        message: `Synced with active session: ${enteredCode.toUpperCase()}`
      });
      // Redirect to play or relevant view
      if (deviceRole === 'team') navigate('/play');
      if (deviceRole === 'audience') navigate('/bigscreen');
      if (deviceRole === 'admin') navigate('/admin');
    }, 1500);
  };

  const handleLaunchPanel = () => {
    if (deviceRole === 'host') navigate('/control');
    if (deviceRole === 'audience') navigate('/bigscreen');
    if (deviceRole === 'team') navigate('/play');
    if (deviceRole === 'admin') navigate('/admin');
  };

  const ROLES = [
    { id: 'host', name: 'Master Host', desc: 'Control turn flow, adjust scores, override AI answers, trigger big screen reactions.', icon: Crown, color: 'var(--gold-500)', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)' },
    { id: 'audience', name: 'Big Screen Display', desc: 'Projector or TV view showing full screen countdown timer, glowing letters, and leaderboard updates.', icon: Monitor, color: 'var(--secondary-500)', bg: 'rgba(6,182,212,0.06)', border: 'rgba(6,182,212,0.2)' },
    { id: 'team', name: 'Team Device / Buzzer', desc: 'A remote panel for teams to enter song selections and view the turn timer.', icon: Smartphone, color: 'var(--primary-500)', bg: 'rgba(124,58,237,0.06)', border: 'rgba(124,58,237,0.2)' },
    { id: 'admin', name: 'Admin Watchdog', desc: 'Monitor telemetry logs, IndexedDB diagnostics, and handle testing triggers.', icon: Settings, color: 'var(--accent-500)', bg: 'rgba(244,63,94,0.06)', border: 'rgba(244,63,94,0.2)' }
  ];

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 880, padding: 'var(--space-4) 0 var(--space-12)' }}>
        
        {/* Header */}
        <div className="page-header" style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <span className="label">Device Synchronization</span>
          <h2 className="heading-2">📡 Tab & Device Setup</h2>
          <p>Pair multiple screens to create an immersive, multi-screen Antyakshari experience.</p>
        </div>

        <div className="grid grid-3 gap-6" style={{ alignItems: 'start' }}>
          
          {/* Column 1 & 2: Setup configuration */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            
            {/* Step 1: Select Role */}
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <h3 className="heading-4" style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Radio size={18} style={{ color: 'var(--primary-400)' }} />
                1. Select Device Role
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {ROLES.map(role => {
                  const Icon = role.icon;
                  const isSelected = deviceRole === role.id;
                  return (
                    <div
                      key={role.id}
                      onClick={() => handleRoleSelect(role.id)}
                      style={{
                        padding: '14px',
                        borderRadius: 'var(--radius-lg)',
                        background: isSelected ? role.bg : 'var(--glass-bg)',
                        border: isSelected ? `2px solid ${role.color}` : '1px solid rgba(255,255,255,0.05)',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: 12,
                        transition: 'all 0.3s ease',
                        boxShadow: isSelected ? `0 0 15px ${role.color}15` : 'none'
                      }}
                    >
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: '19px',
                        background: isSelected ? role.color : 'rgba(255,255,255,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isSelected ? 'black' : 'var(--text-secondary)',
                        flexShrink: 0
                      }}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '13px', color: isSelected ? role.color : 'white' }}>
                          {role.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.3, marginTop: 4 }}>
                          {role.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Session Connection */}
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <h3 className="heading-4" style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Key size={18} style={{ color: 'var(--primary-400)' }} />
                2. Pair Session
              </h3>

              {deviceRole === 'host' ? (
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                    As the Host, generate a pairing code. Share this code with other screens or team buzzers to link them.
                  </p>
                  
                  {sessionCode ? (
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div className="glass-panel" style={{ padding: '12px 24px', fontSize: '1.6rem', fontWeight: 'bold', letterSpacing: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--gold-400)' }}>
                        {sessionCode}
                      </div>
                      <button className="btn btn-ghost" onClick={handleGenerateCode} style={{ padding: 12 }}>
                        <RefreshCw size={16} />
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-primary" onClick={handleGenerateCode}>
                      Generate Session Pairing Code
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleConnectSession}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                    Enter the 6-character pairing code generated by the Host control panel.
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input
                      className="input"
                      value={enteredCode}
                      onChange={e => setEnteredCode(e.target.value.toUpperCase())}
                      placeholder="ENTER 6-DIGIT CODE"
                      maxLength={6}
                      style={{ maxWidth: 200, fontSize: '1.1rem', letterSpacing: '3px', fontWeight: 'bold', textAlign: 'center' }}
                    />
                    <button type="submit" className="btn btn-primary animate-pulse" disabled={enteredCode.length < 6 || isConnecting}>
                      {isConnecting ? 'Syncing...' : 'Connect'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Column 3: Active Connections Telemetry */}
          <div className="flex flex-col gap-6">
            
            {/* Connection list */}
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h4 className="heading-4" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Synced Tabs</h4>
                <span className="badge badge-success" style={{ padding: '2px 6px', fontSize: '10px' }}>
                  <Activity size={10} style={{ marginRight: 4 }} /> Syncing
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 120 }}>
                {/* Always show ourselves */}
                <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid var(--primary-500)' }}>
                  <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{deviceRole.toUpperCase()} (You)</span>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--success-500)' }} />
                </div>

                {activeConnections.filter(c => c.role !== deviceRole).map((conn, idx) => (
                  <div key={idx} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: '3px solid var(--secondary-500)' }}>
                    <span style={{ fontSize: '12px' }}>{conn.role.toUpperCase()} (tab_{conn.id.slice(0, 4)})</span>
                    <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--success-500)' }} />
                  </div>
                ))}

                {activeConnections.filter(c => c.role !== deviceRole).length === 0 && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 0', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: 6 }}>
                    <LinkIcon size={20} style={{ color: 'var(--text-tertiary)', marginBottom: 6 }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No other tabs detected.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Launch Control Panel */}
            <div className="card" style={{ padding: 'var(--space-4)', background: 'var(--gradient-primary)20', border: '1px solid rgba(124,58,237,0.3)' }}>
              <h5 style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: 4 }}>Ready to begin?</h5>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: 12 }}>
                Click below to launch the dashboard screen for your selected role.
              </p>
              <button className="btn btn-primary" onClick={handleLaunchPanel} style={{ width: '100%', gap: 6 }}>
                Launch Board <ArrowRight size={14} />
              </button>
            </div>
            
            {/* Warning info */}
            <div style={{ display: 'flex', gap: 10, padding: 8, borderRadius: 6, border: '1px solid rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.02)' }}>
              <AlertCircle size={16} style={{ color: 'var(--warning-400)', flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                <strong>Sync Scope:</strong> Cross-tab communication uses browser standard BroadcastChannels. Both windows must be open in the same browser.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
