/**
 * @fileoverview SyncEngine — Cross-tab and Cross-device synchronization using
 * BroadcastChannel API and WebSockets.
 */

class SyncEngine {
  constructor(channelName = 'uac-sync') {
    this.channelName = channelName;
    this.channel = null;
    this.ws = null;
    this.listeners = new Map();
    this.deviceRole = 'host';
    this.socketStatus = 'CLOSED';
    this._init();
    this._initWebSocket();
  }

  _init() {
    try {
      this.channel = new BroadcastChannel(this.channelName);
      this.channel.onmessage = this._handleMessage.bind(this);
    } catch (err) {
      console.warn('SyncEngine: BroadcastChannel not supported', err);
    }
  }

  _initWebSocket() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      // In development, WebSocket server runs on port 3001. In production, it runs on the same port.
      const wsPort = window.location.port === '5173' ? '3001' : window.location.port;
      const host = window.location.hostname || 'localhost';
      const wsUrl = `${protocol}//${host}:${wsPort}/ws`;

      console.log(`[SyncEngine] Connecting to WebSocket at ${wsUrl}`);
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[SyncEngine] WebSocket connection established.');
        this.socketStatus = 'OPEN';
        this.heartbeat();
        // Request state upon connection
        this.requestState();
        this._notifyStatusChange();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this._handleMessage({ data: message });
        } catch (err) {
          console.error('[SyncEngine] Error parsing WS message:', err);
        }
      };

      this.ws.onclose = () => {
        console.warn('[SyncEngine] WebSocket connection closed. Retrying in 3 seconds...');
        this.socketStatus = 'CLOSED';
        this._notifyStatusChange();
        setTimeout(() => this._initWebSocket(), 3000);
      };

      this.ws.onerror = (err) => {
        console.error('[SyncEngine] WebSocket error observed:', err);
        this.socketStatus = 'ERROR';
        this._notifyStatusChange();
      };
    } catch (err) {
      console.warn('[SyncEngine] WebSocket initialization failed', err);
      this.socketStatus = 'ERROR';
      this._notifyStatusChange();
    }
  }

  _notifyStatusChange() {
    // Notify debug listeners about WS status changes
    const statusCallbacks = this.listeners.get('ws_status_change') || [];
    statusCallbacks.forEach(cb => {
      try {
        cb({ status: this.socketStatus });
      } catch (err) {}
    });
  }

  _handleMessage(event) {
    const { type, payload, sender, timestamp } = event.data || {};
    if (!type) return;

    const callbacks = this.listeners.get(type) || [];
    callbacks.forEach(cb => {
      try {
        cb(payload, { sender, timestamp });
      } catch (err) {
        console.error('SyncEngine: Error in listener', err);
      }
    });

    // Also fire wildcard listeners
    const wildcardCallbacks = this.listeners.get('*') || [];
    wildcardCallbacks.forEach(cb => {
      try {
        cb({ type, payload }, { sender, timestamp });
      } catch (err) {
        console.error('SyncEngine: Error in wildcard listener', err);
      }
    });
  }

  /**
   * Send a message to all other tabs and devices
   */
  send(type, payload = {}) {
    const message = {
      type,
      payload,
      sender: this.deviceRole,
      timestamp: Date.now(),
    };

    // 1. Send via BroadcastChannel (local tabs)
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (err) {
        console.warn('SyncEngine: BroadcastChannel failed to send', err);
      }
    }

    // 2. Send via WebSockets (remote tabs/devices)
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (err) {
        console.warn('SyncEngine: WebSocket failed to send', err);
      }
    }
  }

  /**
   * Broadcast full game state
   */
  broadcastState(state) {
    this.send('state_update', state);
  }

  /**
   * Send a command (celebration, message, etc.)
   */
  sendCommand(commandType, data = {}) {
    this.send('command', { commandType, ...data });
  }

  /**
   * Listen for a specific message type
   */
  on(type, callback) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type).push(callback);
    return () => this.off(type, callback);
  }

  /**
   * Remove a listener
   */
  off(type, callback) {
    const callbacks = this.listeners.get(type) || [];
    const index = callbacks.indexOf(callback);
    if (index > -1) callbacks.splice(index, 1);
  }

  /**
   * Set device role
   */
  setRole(role) {
    this.deviceRole = role;
    this.send('role_change', { role });
  }

  /**
   * Request state from host
   */
  requestState() {
    this.send('request_state', {});
  }

  /**
   * Send heartbeat
   */
  heartbeat() {
    this.send('heartbeat', { role: this.deviceRole });
  }

  /**
   * Destroy the connections
   */
  destroy() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
  }
}

export const syncEngine = new SyncEngine();
export default SyncEngine;
