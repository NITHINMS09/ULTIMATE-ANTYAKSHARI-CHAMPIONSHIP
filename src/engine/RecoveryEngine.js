/**
 * @fileoverview RecoveryEngine — Auto-saves and restores game state
 */

const AUTO_SAVE_KEY = 'uac_recovery_state';
const AUTO_SAVE_INTERVAL = 2000;

/**
 * Save game state to localStorage
 * @param {Object} gameState
 */
export function saveState(gameState) {
  try {
    const data = {
      state: gameState,
      savedAt: Date.now(),
      version: 1,
    };
    localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('RecoveryEngine: Failed to save state', err);
  }
}

/**
 * Load saved state from localStorage
 * @returns {Object|null}
 */
export function loadState() {
  try {
    const raw = localStorage.getItem(AUTO_SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data.state || !data.savedAt) return null;
    // Reject saves older than 24 hours
    if (Date.now() - data.savedAt > 24 * 60 * 60 * 1000) {
      clearSavedSession();
      return null;
    }
    return data.state;
  } catch (err) {
    console.warn('RecoveryEngine: Failed to load state', err);
    return null;
  }
}

/**
 * Check if there's a recoverable session
 * @returns {{ hasSession: boolean, savedAt: number|null, matchId: string|null }}
 */
export function hasRecoverableSession() {
  try {
    const raw = localStorage.getItem(AUTO_SAVE_KEY);
    if (!raw) return { hasSession: false, savedAt: null, matchId: null };
    const data = JSON.parse(raw);
    if (!data.state || data.state.status === 'idle' || data.state.status === 'finished') {
      return { hasSession: false, savedAt: null, matchId: null };
    }
    if (Date.now() - data.savedAt > 24 * 60 * 60 * 1000) {
      clearSavedSession();
      return { hasSession: false, savedAt: null, matchId: null };
    }
    return {
      hasSession: true,
      savedAt: data.savedAt,
      matchId: data.state.matchId,
    };
  } catch {
    return { hasSession: false, savedAt: null, matchId: null };
  }
}

/**
 * Clear saved session
 */
export function clearSavedSession() {
  try {
    localStorage.removeItem(AUTO_SAVE_KEY);
  } catch (err) {
    console.warn('RecoveryEngine: Failed to clear session', err);
  }
}

/**
 * Start auto-saving game state at regular intervals
 * @param {Function} getState - Function that returns current game state
 * @returns {Function} cleanup function to stop auto-saving
 */
export function startAutoSave(getState) {
  const interval = setInterval(() => {
    const state = getState();
    if (state && state.status !== 'idle') {
      saveState(state);
    }
  }, AUTO_SAVE_INTERVAL);

  return () => clearInterval(interval);
}

/**
 * Check if the browser is online
 * @returns {boolean}
 */
export function isOnline() {
  return navigator.onLine !== false;
}

/**
 * Monitor connection status
 * @param {Function} onOnline
 * @param {Function} onOffline
 * @returns {Function} cleanup
 */
export function monitorConnection(onOnline, onOffline) {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

export default {
  saveState,
  loadState,
  hasRecoverableSession,
  clearSavedSession,
  startAutoSave,
  isOnline,
  monitorConnection,
};
