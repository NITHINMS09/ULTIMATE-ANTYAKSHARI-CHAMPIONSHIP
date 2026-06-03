/**
 * Database layer using Dexie.js (IndexedDB wrapper)
 * Provides persistent storage for matches, teams, trophies, and analytics
 */
import Dexie from 'dexie';

const db = new Dexie('UltimateAntyakshari');

db.version(1).stores({
  matches: '++id, matchId, date, gameMode, winnerId, status',
  teams: '++id, teamId, name, createdAt',
  songs: '++id, matchId, teamId, title, artist, language, round',
  trophies: '++id, teamId, trophyId, unlockedAt',
  settings: 'key',
  analytics: '++id, type, timestamp',
  events: '++id, matchId, type, timestamp',
  profiles: '++id, name, createdAt',
});

/**
 * Save a completed match to the database
 * @param {Object} matchData - The match data to save
 * @returns {Promise<number>} The auto-generated ID
 */
export async function saveMatch(matchData) {
  try {
    const id = await db.matches.add({
      matchId: matchData.matchId,
      date: new Date().toISOString(),
      gameMode: matchData.settings?.gameMode || 'classic',
      teams: matchData.teams,
      songHistory: matchData.songHistory,
      totalRounds: matchData.totalRounds,
      currentRound: matchData.currentRound,
      winnerId: matchData.winnerId || null,
      duration: matchData.duration || 0,
      status: 'completed',
    });
    return id;
  } catch (error) {
    console.error('Failed to save match:', error);
    throw error;
  }
}

/**
 * Get all completed matches
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of match records
 */
export async function getMatches(options = {}) {
  try {
    let query = db.matches.orderBy('date').reverse();
    
    if (options.gameMode) {
      query = db.matches.where('gameMode').equals(options.gameMode).reverse();
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    return await query.toArray();
  } catch (error) {
    console.error('Failed to get matches:', error);
    return [];
  }
}

/**
 * Get a specific match by matchId
 * @param {string} matchId
 * @returns {Promise<Object|undefined>}
 */
export async function getMatchById(matchId) {
  try {
    return await db.matches.where('matchId').equals(matchId).first();
  } catch (error) {
    console.error('Failed to get match:', error);
    return undefined;
  }
}

/**
 * Save a team profile
 * @param {Object} teamData
 * @returns {Promise<number>}
 */
export async function saveTeam(teamData) {
  try {
    const existing = await db.teams.where('teamId').equals(teamData.teamId).first();
    if (existing) {
      await db.teams.update(existing.id, {
        ...teamData,
        updatedAt: new Date().toISOString(),
      });
      return existing.id;
    }
    return await db.teams.add({
      ...teamData,
      teamId: teamData.teamId || crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to save team:', error);
    throw error;
  }
}

/**
 * Get all saved teams
 * @returns {Promise<Array>}
 */
export async function getTeams() {
  try {
    return await db.teams.toArray();
  } catch (error) {
    console.error('Failed to get teams:', error);
    return [];
  }
}

/**
 * Save a trophy unlock
 * @param {string} teamId
 * @param {string} trophyId
 * @returns {Promise<number>}
 */
export async function saveTrophy(teamId, trophyId) {
  try {
    const existing = await db.trophies
      .where({ teamId, trophyId })
      .first();
    if (existing) return existing.id;
    
    return await db.trophies.add({
      teamId,
      trophyId,
      unlockedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to save trophy:', error);
    throw error;
  }
}

/**
 * Get all trophies for a team
 * @param {string} teamId
 * @returns {Promise<Array>}
 */
export async function getTeamTrophies(teamId) {
  try {
    return await db.trophies.where('teamId').equals(teamId).toArray();
  } catch (error) {
    console.error('Failed to get trophies:', error);
    return [];
  }
}

/**
 * Save an analytics event
 * @param {string} type - Event type
 * @param {Object} data - Event data
 * @returns {Promise<number>}
 */
export async function saveAnalyticsEvent(type, data) {
  try {
    return await db.analytics.add({
      type,
      data,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to save analytics:', error);
    throw error;
  }
}

/**
 * Get analytics events by type
 * @param {string} type
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export async function getAnalyticsEvents(type, limit = 100) {
  try {
    return await db.analytics
      .where('type')
      .equals(type)
      .reverse()
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error('Failed to get analytics:', error);
    return [];
  }
}

/**
 * Save a setting
 * @param {string} key
 * @param {*} value
 */
export async function saveSetting(key, value) {
  try {
    await db.settings.put({ key, value });
  } catch (error) {
    console.error('Failed to save setting:', error);
  }
}

/**
 * Get a setting
 * @param {string} key
 * @param {*} defaultValue
 * @returns {Promise<*>}
 */
export async function getSetting(key, defaultValue = null) {
  try {
    const record = await db.settings.get(key);
    return record ? record.value : defaultValue;
  } catch (error) {
    console.error('Failed to get setting:', error);
    return defaultValue;
  }
}

/**
 * Save match events for replay
 * @param {string} matchId
 * @param {Array} events
 */
export async function saveMatchEvents(matchId, events) {
  try {
    const records = events.map(event => ({
      matchId,
      type: event.type,
      data: event.data,
      timestamp: event.timestamp,
    }));
    await db.events.bulkAdd(records);
  } catch (error) {
    console.error('Failed to save match events:', error);
  }
}

/**
 * Get match events for replay
 * @param {string} matchId
 * @returns {Promise<Array>}
 */
export async function getMatchEvents(matchId) {
  try {
    return await db.events
      .where('matchId')
      .equals(matchId)
      .sortBy('timestamp');
  } catch (error) {
    console.error('Failed to get match events:', error);
    return [];
  }
}

/**
 * Get overall statistics
 * @returns {Promise<Object>}
 */
export async function getOverallStats() {
  try {
    const matches = await db.matches.toArray();
    const totalMatches = matches.length;
    const totalSongs = matches.reduce((sum, m) => sum + (m.songHistory?.length || 0), 0);
    
    const gameModes = {};
    matches.forEach(m => {
      gameModes[m.gameMode] = (gameModes[m.gameMode] || 0) + 1;
    });
    
    return {
      totalMatches,
      totalSongs,
      gameModes,
      averageDuration: totalMatches > 0
        ? matches.reduce((sum, m) => sum + (m.duration || 0), 0) / totalMatches
        : 0,
    };
  } catch (error) {
    console.error('Failed to get stats:', error);
    return { totalMatches: 0, totalSongs: 0, gameModes: {}, averageDuration: 0 };
  }
}

/**
 * Clear all data (for testing/reset)
 */
export async function clearAllData() {
  try {
    await Promise.all([
      db.matches.clear(),
      db.teams.clear(),
      db.songs.clear(),
      db.trophies.clear(),
      db.analytics.clear(),
      db.events.clear(),
    ]);
  } catch (error) {
    console.error('Failed to clear data:', error);
  }
}

export default db;
