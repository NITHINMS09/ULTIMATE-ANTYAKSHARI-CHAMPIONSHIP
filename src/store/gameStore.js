/**
 * @fileoverview Game State Store — Zustand store managing all match state
 * for the Ultimate Antyakshari Championship.
 *
 * Handles match lifecycle, team management, turn logic, timer,
 * song history, game settings, and fair-play tracking.
 *
 * Uses Zustand with persist middleware (localStorage).
 * All updates use plain spread-operator immutability (no immer).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameEngine } from '../engine/GameEngine.js';
import { getNextLetter } from '../engine/LetterEngine.js';

/* ── Default Settings ────────────────────────────────────────── */

/** @type {import('./gameStore').GameSettings} */
const DEFAULT_SETTINGS = {
  timePerTurn: 30,
  totalRounds: 5,
  gameMode: 'classic', // classic | speed | elimination | team_battle
  pointsPerCorrect: 10,
  pointsPerBonus: 5,
  penaltyPoints: -5,
  autoValidate: true,
  allowSkip: true,
  // Recognition & Playback
  recognitionMode: 'auto',      // 'auto' | 'manual'
  autoPlayEnabled: true,
  allLanguagesMode: true,
  playbackDuration: 15,         // seconds (0 = full song)
  recognitionLanguages: ['all'],
};

/* ── Initial State ───────────────────────────────────────────── */

/** @returns {import('./gameStore').GameState} */
const createInitialState = () => ({
  // Match
  matchId: null,
  status: 'idle', // idle | setup | playing | paused | emergency_paused | finished

  // Teams
  teams: [],

  // Turn
  currentRound: 1,
  totalRounds: 5,
  currentTeamIndex: 0,
  currentLetter: null,

  // Timer
  timer: { total: 30, remaining: 30, isRunning: false },

  // Song history
  songHistory: [],

  // Settings
  settings: { ...DEFAULT_SETTINGS },

  // Fair play
  usedSongs: [],       // persisted as array (Sets don't serialize)
  violations: [],

  // Recognition Engine State
  detectionState: 'idle',       // idle | listening | detecting | searching | validating | playing
  currentDetection: null,       // { songName, confidence, alternatives, language, ... }
  recognitionActive: false,     // Whether recognition engine is running

  // Learning / Corrections
  corrections: [],              // [{ wrongText, correctTitle, timestamp }]
});

/* ── Store ───────────────────────────────────────────────────── */

export const useGameStore = create(
  persist(
    (set, get) => ({
      ...createInitialState(),

      /* ─────────────────────────────────────────────────────────
       * MATCH LIFECYCLE
       * ───────────────────────────────────────────────────────── */

      /**
       * Initialise a new match with teams and (optional) custom settings.
       * @param {Array<{name:string, emoji:string, color:string, members:string[]}>} teams
       * @param {Partial<import('./gameStore').GameSettings>} [settingsOverride]
       */
      initMatch: (teams, settingsOverride = {}) => {
        const settings = { ...DEFAULT_SETTINGS, ...settingsOverride };
        const modeConfig = GameEngine.getGameModeConfig(settings.gameMode);

        const enrichedTeams = teams.map((t, i) => ({
          id: `team_${Date.now()}_${i}`,
          name: t.name,
          emoji: t.emoji || '🎵',
          color: t.color || `hsl(${(i * 137) % 360}, 70%, 60%)`,
          score: 0,
          members: t.members || [],
          violations: 0,
        }));

        set({
          matchId: GameEngine.generateMatchId(),
          status: 'setup',
          teams: enrichedTeams,
          currentRound: 1,
          totalRounds: settings.totalRounds,
          currentTeamIndex: 0,
          currentLetter: null,
          timer: {
            total: modeConfig.timePerTurn ?? settings.timePerTurn,
            remaining: modeConfig.timePerTurn ?? settings.timePerTurn,
            isRunning: false,
          },
          songHistory: [],
          settings,
          usedSongs: [],
          violations: [],
        });
      },

      /**
       * Transition from setup → playing. Starts the first turn timer.
       */
      startMatch: () => {
        const state = get();
        if (state.status !== 'setup') return;

        set({
          status: 'playing',
          timer: { ...state.timer, isRunning: true },
        });
      },

      /**
       * Pause the match (user-initiated).
       */
      pauseMatch: () => {
        const state = get();
        if (state.status !== 'playing') return;

        set({
          status: 'paused',
          timer: { ...state.timer, isRunning: false },
        });
      },

      /**
       * Resume from a normal pause.
       */
      resumeMatch: () => {
        const state = get();
        if (state.status !== 'paused') return;

        set({
          status: 'playing',
          timer: { ...state.timer, isRunning: true },
        });
      },

      /**
       * Emergency pause — locks the match until explicitly resumed.
       */
      emergencyPause: () => {
        const state = get();
        if (state.status !== 'playing' && state.status !== 'paused') return;

        set({
          status: 'emergency_paused',
          timer: { ...state.timer, isRunning: false },
        });
      },

      /**
       * End the match and calculate final standings.
       */
      endMatch: () => {
        set((state) => ({
          status: 'finished',
          timer: { ...state.timer, isRunning: false, remaining: 0 },
        }));
      },

      /* ─────────────────────────────────────────────────────────
       * TURN MANAGEMENT
       * ───────────────────────────────────────────────────────── */

      /**
       * Advance to the next team / round.
       */
      nextTurn: () => {
        const state = get();
        if (state.status !== 'playing') return;

        let nextIndex = state.currentTeamIndex + 1;
        let nextRound = state.currentRound;

        // Wrap around to the next round
        if (nextIndex >= state.teams.length) {
          nextIndex = 0;
          nextRound += 1;
        }

        // Check win condition
        if (GameEngine.checkWinCondition(nextRound, state.totalRounds, state.teams, state.settings.gameMode)) {
          set({
            status: 'finished',
            timer: { ...state.timer, isRunning: false, remaining: 0 },
          });
          return;
        }

        // In elimination mode, skip eliminated teams (score <= 0 after round 2)
        if (state.settings.gameMode === 'elimination' && nextRound > 2) {
          const activeTeams = state.teams.filter((t) => t.score > 0);
          if (activeTeams.length <= 1) {
            set({
              status: 'finished',
              timer: { ...state.timer, isRunning: false, remaining: 0 },
            });
            return;
          }
          // Skip teams with 0 or negative score
          while (state.teams[nextIndex] && state.teams[nextIndex].score <= 0) {
            nextIndex = (nextIndex + 1) % state.teams.length;
          }
        }

        const turnDuration = state.settings.timePerTurn;

        set({
          currentTeamIndex: nextIndex,
          currentRound: nextRound,
          timer: { total: turnDuration, remaining: turnDuration, isRunning: true },
        });
      },

      /**
       * Skip the current turn (if allowed). Applies a penalty.
       */
      skipTurn: () => {
        const state = get();
        if (state.status !== 'playing') return;
        if (!state.settings.allowSkip) return;

        const currentTeam = state.teams[state.currentTeamIndex];
        if (!currentTeam) return;

        const updatedTeams = state.teams.map((t) =>
          t.id === currentTeam.id
            ? { ...t, score: t.score + state.settings.penaltyPoints }
            : t
        );

        set({ teams: updatedTeams });

        // Advance
        get().nextTurn();
      },

      /* ─────────────────────────────────────────────────────────
       * SONG SUBMISSION & VALIDATION
       * ───────────────────────────────────────────────────────── */

      /**
       * Submit a song for the current turn.
       * @param {{ songTitle:string, artist?:string, movie?:string, language?:string }} songData
       * @returns {string} The generated song entry ID
       */
      submitSong: (songData) => {
        const state = get();
        if (state.status !== 'playing') return null;

        const currentTeam = state.teams[state.currentTeamIndex];
        if (!currentTeam) return null;

        const songId = `song_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

        const entry = {
          id: songId,
          teamId: currentTeam.id,
          songTitle: songData.songTitle.trim(),
          artist: songData.artist?.trim() || '',
          movie: songData.movie?.trim() || '',
          language: songData.language?.trim() || '',
          letter: state.currentLetter,
          timestamp: Date.now(),
          isValid: null, // pending validation
          validatedBy: null,
          round: state.currentRound,
          responseTime: state.timer.total - state.timer.remaining,
        };

        set((prev) => ({
          songHistory: [...prev.songHistory, entry],
          timer: { ...prev.timer, isRunning: false },
        }));

        return songId;
      },

      /**
       * Approve a submitted song. Awards points and sets the next letter.
       * @param {string} songId
       */
      approveSong: (songId) => {
        const state = get();
        const songIndex = state.songHistory.findIndex((s) => s.id === songId);
        if (songIndex === -1) return;

        const song = state.songHistory[songIndex];
        const responseTime = song.responseTime || 0;
        const points = GameEngine.calculateScore(song, responseTime, state.settings);

        // Update song entry
        const updatedHistory = state.songHistory.map((s) =>
          s.id === songId ? { ...s, isValid: true, validatedBy: 'host' } : s
        );

        // Award points
        const updatedTeams = state.teams.map((t) =>
          t.id === song.teamId ? { ...t, score: t.score + points } : t
        );

        // Track used song
        const updatedUsedSongs = [...state.usedSongs, song.songTitle.toLowerCase()];

        // Derive next letter from the song title
        const nextLetter = getNextLetter(song.songTitle);

        set({
          songHistory: updatedHistory,
          teams: updatedTeams,
          usedSongs: updatedUsedSongs,
          currentLetter: nextLetter,
        });
      },

      /**
       * Reject a submitted song. Applies a penalty.
       * @param {string} songId
       */
      rejectSong: (songId) => {
        const state = get();
        const songIndex = state.songHistory.findIndex((s) => s.id === songId);
        if (songIndex === -1) return;

        const song = state.songHistory[songIndex];

        const updatedHistory = state.songHistory.map((s) =>
          s.id === songId ? { ...s, isValid: false, validatedBy: 'host' } : s
        );

        const updatedTeams = state.teams.map((t) =>
          t.id === song.teamId
            ? { ...t, score: t.score + state.settings.penaltyPoints, violations: t.violations + 1 }
            : t
        );

        set({
          songHistory: updatedHistory,
          teams: updatedTeams,
        });
      },

      /* ─────────────────────────────────────────────────────────
       * SCORE & LETTER
       * ───────────────────────────────────────────────────────── */

      /**
       * Manually adjust a team's score.
       * @param {string} teamId
       * @param {number} delta  — positive or negative
       */
      adjustScore: (teamId, delta) => {
        set((state) => ({
          teams: state.teams.map((t) =>
            t.id === teamId ? { ...t, score: t.score + delta } : t
          ),
        }));
      },

      /**
       * Set the required starting letter for the current turn.
       * @param {string} letter
       */
      setLetter: (letter) => {
        set({ currentLetter: letter?.toUpperCase() || null });
      },

      /* ─────────────────────────────────────────────────────────
       * TIMER
       * ───────────────────────────────────────────────────────── */

      /**
       * Decrement the timer by 1 second.
       * Called externally by TimerEngine on each tick.
       */
      tickTimer: () => {
        set((state) => {
          const next = Math.max(0, state.timer.remaining - 1);
          return {
            timer: {
              ...state.timer,
              remaining: next,
              isRunning: next > 0 ? state.timer.isRunning : false,
            },
          };
        });
      },

      /**
       * Reset the timer to the configured turn duration.
       */
      resetTimer: () => {
        set((state) => ({
          timer: {
            total: state.settings.timePerTurn,
            remaining: state.settings.timePerTurn,
            isRunning: false,
          },
        }));
      },

      /* ─────────────────────────────────────────────────────────
       * DERIVED DATA (computed getters)
       * ───────────────────────────────────────────────────────── */

      /**
       * Get the currently active team object.
       * @returns {object|null}
       */
      getCurrentTeam: () => {
        const { teams, currentTeamIndex } = get();
        return teams[currentTeamIndex] ?? null;
      },

      /**
       * Get teams sorted by score (descending).
       * @returns {Array<object>}
       */
      getLeaderboard: () => {
        const { teams } = get();
        return [...teams].sort((a, b) => b.score - a.score);
      },

      /* ─────────────────────────────────────────────────────────
       * RECOGNITION & AUTOPLAY CONTROLS
       * ───────────────────────────────────────────────────────── */

      /**
       * Set recognition mode ('auto' or 'manual').
       * @param {'auto'|'manual'} mode
       */
      setRecognitionMode: (mode) => {
        set((state) => ({
          settings: { ...state.settings, recognitionMode: mode },
        }));
      },

      /**
       * Toggle auto-play on/off.
       */
      toggleAutoPlay: () => {
        set((state) => ({
          settings: { ...state.settings, autoPlayEnabled: !state.settings.autoPlayEnabled },
        }));
      },

      /**
       * Toggle all-languages mode on/off.
       */
      toggleAllLanguages: () => {
        set((state) => ({
          settings: { ...state.settings, allLanguagesMode: !state.settings.allLanguagesMode },
        }));
      },

      /**
       * Set playback duration in seconds (0 = full song).
       * @param {number} seconds
       */
      setPlaybackDuration: (seconds) => {
        set((state) => ({
          settings: { ...state.settings, playbackDuration: seconds },
        }));
      },

      /**
       * Set the current detection state.
       * @param {string} detectionState
       */
      setDetectionState: (detectionState) => {
        set({ detectionState });
      },

      /**
       * Submit a detection result from the recognition engine.
       * @param {Object} detection — { songName, confidence, alternatives, language, ... }
       */
      submitDetection: (detection) => {
        set({
          currentDetection: detection,
          detectionState: 'complete',
        });
      },

      /**
       * Clear the current detection.
       */
      clearDetection: () => {
        set({
          currentDetection: null,
          detectionState: 'idle',
        });
      },

      /**
       * Set recognition active state.
       * @param {boolean} active
       */
      setRecognitionActive: (active) => {
        set({ recognitionActive: active });
      },

      /**
       * Store a host correction (wrong detection → correct song).
       * @param {string} wrongText
       * @param {Object} correctSong
       */
      addCorrection: (wrongText, correctSong) => {
        set((state) => ({
          corrections: [...state.corrections, {
            wrongText,
            correctTitle: correctSong.title || correctSong.songTitle,
            correctArtist: correctSong.artist || '',
            timestamp: Date.now(),
          }],
        }));
      },

      /* ─────────────────────────────────────────────────────────
       * FULL RESET
       * ───────────────────────────────────────────────────────── */

      /**
       * Reset the store to its initial state.
       */
      resetGame: () => {
        set(createInitialState());
      },
    }),
    {
      name: 'uac-game-store',
      version: 1,
      partialize: (state) => {
        // Persist everything except transient timer-running flag
        const { ...rest } = state;
        return {
          ...rest,
          timer: { ...rest.timer, isRunning: false },
        };
      },
    }
  )
);

export default useGameStore;
