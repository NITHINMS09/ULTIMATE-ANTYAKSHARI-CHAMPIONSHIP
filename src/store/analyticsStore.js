/**
 * @fileoverview Analytics Store
 *
 * Tracks historical statistics: matches played, songs sung,
 * language / artist / movie breakdowns, and per-team performance.
 *
 * All data is persisted to localStorage.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ── Initial State ───────────────────────────────────────────── */

const createInitialState = () => ({
  totalMatches: 0,
  totalSongsPlayed: 0,
  languageStats: {},   // { hindi: 45, english: 20, … }
  artistStats: {},     // { "Arijit Singh": 12, … }
  movieStats: {},      // { "DDLJ": 5, … }
  teamStats: {},       // { teamId: { wins, losses, totalScore, avgResponseTime, totalTurns } }
  matchHistory: [],    // summary records
  recentActivity: [],  // last N activity entries (capped at 100)
});

/* ── Helpers ─────────────────────────────────────────────────── */

/**
 * Increment a key in a stats object, returning a new object.
 * @param {Record<string,number>} stats
 * @param {string} key
 * @param {number} [amount=1]
 * @returns {Record<string,number>}
 */
const incrementStat = (stats, key, amount = 1) => {
  if (!key) return stats;
  const normalised = key.trim().toLowerCase();
  if (!normalised) return stats;
  return { ...stats, [normalised]: (stats[normalised] || 0) + amount };
};

/** Cap the recent-activity list at 100 items */
const MAX_RECENT = 100;

/* ── Store ───────────────────────────────────────────────────── */

export const useAnalyticsStore = create(
  persist(
    (set, get) => ({
      ...createInitialState(),

      /* ─── Recording Actions ──────────────────────────────── */

      /**
       * Record a completed match summary.
       * @param {{
       *   matchId: string,
       *   teams: Array<{id:string, name:string, score:number}>,
       *   winnerId: string|null,
       *   totalSongs: number,
       *   duration: number,
       *   gameMode: string,
       *   rounds: number,
       * }} matchSummary
       */
      recordMatch: (matchSummary) => {
        set((state) => {
          const updatedTeamStats = { ...state.teamStats };

          matchSummary.teams.forEach((team) => {
            const existing = updatedTeamStats[team.id] || {
              wins: 0,
              losses: 0,
              totalScore: 0,
              avgResponseTime: 0,
              totalTurns: 0,
            };

            const isWinner = team.id === matchSummary.winnerId;

            updatedTeamStats[team.id] = {
              ...existing,
              wins: existing.wins + (isWinner ? 1 : 0),
              losses: existing.losses + (isWinner ? 0 : 1),
              totalScore: existing.totalScore + team.score,
            };
          });

          const activity = {
            id: `act_${Date.now()}`,
            type: 'match_completed',
            description: `Match completed — ${matchSummary.teams.length} teams, ${matchSummary.totalSongs} songs`,
            timestamp: Date.now(),
          };

          const recentActivity = [activity, ...state.recentActivity].slice(0, MAX_RECENT);

          return {
            totalMatches: state.totalMatches + 1,
            matchHistory: [
              ...state.matchHistory,
              {
                ...matchSummary,
                timestamp: Date.now(),
              },
            ],
            teamStats: updatedTeamStats,
            recentActivity,
          };
        });
      },

      /**
       * Record an individual song entry.
       * @param {{
       *   songTitle: string,
       *   artist?: string,
       *   movie?: string,
       *   language?: string,
       *   teamId: string,
       *   responseTime?: number,
       * }} songData
       */
      recordSong: (songData) => {
        set((state) => {
          const updatedTeamStats = { ...state.teamStats };
          const existing = updatedTeamStats[songData.teamId] || {
            wins: 0,
            losses: 0,
            totalScore: 0,
            avgResponseTime: 0,
            totalTurns: 0,
          };

          const newTotalTurns = existing.totalTurns + 1;
          const prevTotalTime = existing.avgResponseTime * existing.totalTurns;
          const newAvgResponseTime = (prevTotalTime + (songData.responseTime || 0)) / newTotalTurns;

          updatedTeamStats[songData.teamId] = {
            ...existing,
            totalTurns: newTotalTurns,
            avgResponseTime: Math.round(newAvgResponseTime * 100) / 100,
          };

          const activity = {
            id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            type: 'song_played',
            description: `"${songData.songTitle}" was played`,
            timestamp: Date.now(),
          };

          const recentActivity = [activity, ...state.recentActivity].slice(0, MAX_RECENT);

          return {
            totalSongsPlayed: state.totalSongsPlayed + 1,
            languageStats: incrementStat(state.languageStats, songData.language),
            artistStats: incrementStat(state.artistStats, songData.artist),
            movieStats: incrementStat(state.movieStats, songData.movie),
            teamStats: updatedTeamStats,
            recentActivity,
          };
        });
      },

      /* ─── Insight Getters ────────────────────────────────── */

      /**
       * Aggregate overview insights.
       * @returns {{ totalMatches:number, totalSongs:number, uniqueLanguages:number, uniqueArtists:number }}
       */
      getInsights: () => {
        const s = get();
        return {
          totalMatches: s.totalMatches,
          totalSongs: s.totalSongsPlayed,
          uniqueLanguages: Object.keys(s.languageStats).length,
          uniqueArtists: Object.keys(s.artistStats).length,
          uniqueMovies: Object.keys(s.movieStats).length,
        };
      },

      /**
       * Top N languages by song count.
       * @param {number} [n=5]
       * @returns {Array<{name:string, count:number}>}
       */
      getTopLanguages: (n = 5) => {
        const entries = Object.entries(get().languageStats);
        return entries
          .sort((a, b) => b[1] - a[1])
          .slice(0, n)
          .map(([name, count]) => ({ name, count }));
      },

      /**
       * Top N artists by song count.
       * @param {number} [n=5]
       * @returns {Array<{name:string, count:number}>}
       */
      getTopArtists: (n = 5) => {
        const entries = Object.entries(get().artistStats);
        return entries
          .sort((a, b) => b[1] - a[1])
          .slice(0, n)
          .map(([name, count]) => ({ name, count }));
      },

      /**
       * Top N movies by song count.
       * @param {number} [n=5]
       * @returns {Array<{name:string, count:number}>}
       */
      getTopMovies: (n = 5) => {
        const entries = Object.entries(get().movieStats);
        return entries
          .sort((a, b) => b[1] - a[1])
          .slice(0, n)
          .map(([name, count]) => ({ name, count }));
      },

      /**
       * Team with the highest total score across all matches.
       * @returns {{ teamId:string, stats:object }|null}
       */
      getStrongestTeam: () => {
        const stats = get().teamStats;
        const entries = Object.entries(stats);
        if (entries.length === 0) return null;

        const [teamId, teamStat] = entries.reduce((best, curr) =>
          curr[1].totalScore > best[1].totalScore ? curr : best
        );

        return { teamId, stats: teamStat };
      },

      /**
       * Team with the lowest average response time.
       * @returns {{ teamId:string, stats:object }|null}
       */
      getFastestTeam: () => {
        const stats = get().teamStats;
        const entries = Object.entries(stats).filter(([, s]) => s.totalTurns > 0);
        if (entries.length === 0) return null;

        const [teamId, teamStat] = entries.reduce((best, curr) =>
          curr[1].avgResponseTime < best[1].avgResponseTime ? curr : best
        );

        return { teamId, stats: teamStat };
      },

      /**
       * Reset all analytics.
       */
      resetAnalytics: () => {
        set(createInitialState());
      },
    }),
    {
      name: 'uac-analytics-store',
      version: 1,
    }
  )
);

export default useAnalyticsStore;
