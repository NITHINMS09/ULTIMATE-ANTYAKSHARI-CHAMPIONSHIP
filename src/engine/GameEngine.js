/**
 * @fileoverview Game Engine — Core game logic for the
 * Ultimate Antyakshari Championship.
 *
 * Pure functions / static methods — no side-effects.
 * The game store calls into this module for calculations.
 */

/* ── Game Mode Configurations ────────────────────────────────── */

/**
 * @typedef {Object} GameModeConfig
 * @property {string}  name
 * @property {string}  description
 * @property {number}  timePerTurn      — seconds per turn
 * @property {number}  totalRounds
 * @property {boolean} allowSkip
 * @property {number}  pointsPerCorrect
 * @property {number}  pointsPerBonus
 * @property {number}  penaltyPoints
 * @property {boolean} hasElimination
 * @property {number}  speedMultiplier  — score multiplier for quick answers
 */

/** @type {Record<string, GameModeConfig>} */
const GAME_MODES = {
  classic: {
    name: 'Classic',
    description: 'The traditional Antyakshari experience. Take turns, sing your heart out!',
    timePerTurn: 30,
    totalRounds: 5,
    allowSkip: true,
    pointsPerCorrect: 10,
    pointsPerBonus: 5,
    penaltyPoints: -5,
    hasElimination: false,
    speedMultiplier: 1.0,
  },
  speed: {
    name: 'Speed Round',
    description: 'Half the time, double the thrill. Quick thinking wins!',
    timePerTurn: 15,
    totalRounds: 8,
    allowSkip: false,
    pointsPerCorrect: 15,
    pointsPerBonus: 10,
    penaltyPoints: -10,
    hasElimination: false,
    speedMultiplier: 2.0,
  },
  elimination: {
    name: 'Elimination',
    description: 'Lowest scorer gets eliminated each round. Last team standing wins!',
    timePerTurn: 25,
    totalRounds: 10,
    allowSkip: true,
    pointsPerCorrect: 10,
    pointsPerBonus: 5,
    penaltyPoints: -10,
    hasElimination: true,
    speedMultiplier: 1.0,
  },
  team_battle: {
    name: 'Team Battle',
    description: 'Two mega-teams go head to head in an epic musical showdown.',
    timePerTurn: 35,
    totalRounds: 7,
    allowSkip: true,
    pointsPerCorrect: 10,
    pointsPerBonus: 8,
    penaltyPoints: -5,
    hasElimination: false,
    speedMultiplier: 1.5,
  },
};

/* ── Speed Bonus Thresholds ──────────────────────────────────── */

/**
 * Calculate a speed bonus based on how quickly the team answered.
 * @param {number} responseTime  — seconds taken
 * @param {number} totalTime     — total allowed seconds
 * @returns {number} bonus multiplier (1.0 – 2.0)
 */
const getSpeedBonus = (responseTime, totalTime) => {
  if (totalTime <= 0) return 1.0;
  const ratio = responseTime / totalTime;

  if (ratio <= 0.25) return 2.0;  // answered within first quarter → 2×
  if (ratio <= 0.50) return 1.5;  // within first half → 1.5×
  if (ratio <= 0.75) return 1.2;  // within third quarter → 1.2×
  return 1.0;                      // last quarter → no bonus
};

/* ── Game Engine ─────────────────────────────────────────────── */

export const GameEngine = {
  /**
   * Determine the next turn's team index and round, handling wrap-around.
   * @param {number} currentTeamIndex
   * @param {number} currentRound
   * @param {number} teamCount
   * @returns {{ nextTeamIndex: number, nextRound: number }}
   */
  manageTurns(currentTeamIndex, currentRound, teamCount) {
    let nextTeamIndex = currentTeamIndex + 1;
    let nextRound = currentRound;

    if (nextTeamIndex >= teamCount) {
      nextTeamIndex = 0;
      nextRound += 1;
    }

    return { nextTeamIndex, nextRound };
  },

  /**
   * Calculate score for a valid song submission.
   * @param {{ songTitle:string, artist?:string, movie?:string, language?:string }} songData
   * @param {number} responseTime — seconds taken to answer
   * @param {object} settings — game settings from the store
   * @returns {number} Total points awarded
   */
  calculateScore(songData, responseTime, settings) {
    const modeConfig = GAME_MODES[settings.gameMode] || GAME_MODES.classic;
    let points = settings.pointsPerCorrect;

    // Speed bonus
    const speedMultiplier = getSpeedBonus(responseTime, settings.timePerTurn);
    points = Math.round(points * speedMultiplier);

    // Mode-specific speed multiplier
    if (speedMultiplier > 1.0) {
      points = Math.round(points * modeConfig.speedMultiplier);
    }

    // Bonus for providing extra metadata (artist, movie, language)
    let bonusFields = 0;
    if (songData.artist) bonusFields += 1;
    if (songData.movie) bonusFields += 1;
    if (songData.language) bonusFields += 1;

    if (bonusFields >= 2) {
      points += settings.pointsPerBonus;
    }

    return Math.max(0, points);
  },

  /**
   * Handle what happens when the timer expires for a turn.
   * Returns the penalty to apply.
   * @param {object} settings
   * @returns {{ penalty: number, action: 'skip'|'deduct' }}
   */
  handleTimeout(settings) {
    return {
      penalty: settings.penaltyPoints,
      action: 'skip',
    };
  },

  /**
   * Determine whether the match should end.
   * @param {number} currentRound
   * @param {number} totalRounds
   * @param {Array<{id:string, score:number}>} teams
   * @param {string} gameMode
   * @returns {boolean}
   */
  checkWinCondition(currentRound, totalRounds, teams, gameMode) {
    // All rounds completed
    if (currentRound > totalRounds) return true;

    // Elimination: only 1 team left with score > 0
    if (gameMode === 'elimination' && currentRound > 2) {
      const activeTeams = teams.filter((t) => t.score > 0);
      if (activeTeams.length <= 1) return true;
    }

    return false;
  },

  /**
   * Get configuration for a specific game mode.
   * @param {string} mode
   * @returns {GameModeConfig}
   */
  getGameModeConfig(mode) {
    return GAME_MODES[mode] || GAME_MODES.classic;
  },

  /**
   * Get all available game modes.
   * @returns {Record<string, GameModeConfig>}
   */
  getAllGameModes() {
    return { ...GAME_MODES };
  },

  /**
   * Generate a unique match ID.
   * @returns {string} e.g. "UAC-1717345200000-a3f8b2"
   */
  generateMatchId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    return `UAC-${timestamp}-${random}`;
  },

  /**
   * Determine the winner(s) of a finished match.
   * @param {Array<{id:string, name:string, score:number}>} teams
   * @returns {{ winner: object|null, isTie: boolean, tiedTeams: object[] }}
   */
  getMatchResult(teams) {
    if (!teams || teams.length === 0) {
      return { winner: null, isTie: false, tiedTeams: [] };
    }

    const sorted = [...teams].sort((a, b) => b.score - a.score);
    const topScore = sorted[0].score;
    const tiedTeams = sorted.filter((t) => t.score === topScore);

    if (tiedTeams.length > 1) {
      return { winner: null, isTie: true, tiedTeams };
    }

    return { winner: sorted[0], isTie: false, tiedTeams: [] };
  },

  /**
   * Get a human-readable match duration string.
   * @param {number} startTime — timestamp ms
   * @param {number} endTime   — timestamp ms
   * @returns {string} e.g. "12m 34s"
   */
  formatMatchDuration(startTime, endTime) {
    const diff = Math.max(0, endTime - startTime);
    const totalSeconds = Math.floor(diff / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes === 0) return `${seconds}s`;
    return `${minutes}m ${seconds}s`;
  },
};

export default GameEngine;
