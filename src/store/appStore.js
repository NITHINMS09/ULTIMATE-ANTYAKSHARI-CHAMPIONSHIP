/**
 * @fileoverview Application State Store
 *
 * Manages global app-level concerns: onboarding, device role,
 * session codes, theme, and user preferences.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ── Initial State ───────────────────────────────────────────── */

const createInitialState = () => ({
  isFirstVisit: true,
  hasCompletedOnboarding: false,
  deviceRole: 'host',           // host | audience | team | admin
  sessionCode: null,
  theme: 'dark',
  soundEnabled: true,
  notificationsEnabled: true,
});

/* ── Store ───────────────────────────────────────────────────── */

export const useAppStore = create(
  persist(
    (set, get) => ({
      ...createInitialState(),

      /**
       * Set the device role (host, audience, team, or admin).
       * @param {'host'|'audience'|'team'|'admin'} role
       */
      setDeviceRole: (role) => {
        const validRoles = ['host', 'audience', 'team', 'admin'];
        if (!validRoles.includes(role)) {
          console.warn(`[AppStore] Invalid device role: "${role}"`);
          return;
        }
        set({ deviceRole: role });
      },

      /**
       * Mark onboarding as completed and clear first-visit flag.
       */
      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true, isFirstVisit: false });
      },

      /**
       * Toggle sound on/off.
       */
      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },

      /**
       * Toggle notifications on/off.
       */
      toggleNotifications: () => {
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled }));
      },

      /**
       * Generate a random 6-character alphanumeric session code
       * and store it in state.
       * @returns {string} The generated code
       */
      generateSessionCode: () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
        let code = '';
        for (let i = 0; i < 6; i++) {
          code += chars[Math.floor(Math.random() * chars.length)];
        }
        set({ sessionCode: code });
        return code;
      },

      /**
       * Set the theme.
       * @param {'dark'|'light'} theme
       */
      setTheme: (theme) => {
        set({ theme });
      },

      /**
       * Reset app state to defaults.
       */
      resetApp: () => {
        set(createInitialState());
      },
    }),
    {
      name: 'uac-app-store',
      version: 1,
    }
  )
);

export default useAppStore;
