/**
 * Database module for Castello API App
 * Uses sql.js (pure JavaScript SQLite implementation)
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'castello.db');

let db = null;

/**
 * Initialize the database
 */
async function initDatabase() {
    const SQL = await initSqlJs();
    
    // Try to load existing database
    try {
        if (fs.existsSync(DB_PATH)) {
            const fileBuffer = fs.readFileSync(DB_PATH);
            db = new SQL.Database(fileBuffer);
            console.log('Database loaded from file');
        } else {
            db = new SQL.Database();
            console.log('New database created');
        }
    } catch (err) {
        console.error('Error loading database, creating new one:', err.message);
        db = new SQL.Database();
    }
    
    // Create tables if they don't exist
    createTables();
    
    return db;
}

/**
 * Create database tables
 */
function createTables() {
    // Players table
    db.run(`
        CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_name TEXT UNIQUE NOT NULL,
            player_key TEXT UNIQUE NOT NULL,
            language TEXT DEFAULT 'en',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    // Add language column if it doesn't exist (for existing databases)
    try {
        db.run(`ALTER TABLE players ADD COLUMN language TEXT DEFAULT 'en'`);
    } catch (e) {
        // Column already exists, ignore
    }
    
    // Sessions table (current game state)
    db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER REFERENCES players(id),
            status TEXT DEFAULT 'NOT_PLAYING',
            current_room TEXT,
            inventory TEXT,
            game_state TEXT,
            timed_events TEXT,
            dati_avventura TEXT,
            pending_question TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(player_id)
        )
    `);
    
    // Add pending_question column if it doesn't exist (for existing databases)
    try {
        db.run(`ALTER TABLE sessions ADD COLUMN pending_question TEXT`);
    } catch (e) {
        // Column already exists, ignore
    }
    
    // Saved games table
    db.run(`
        CREATE TABLE IF NOT EXISTS saved_games (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER REFERENCES players(id),
            save_name TEXT NOT NULL,
            game_data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(player_id, save_name)
        )
    `);
    
    // Action log (for dashboard)
    db.run(`
        CREATE TABLE IF NOT EXISTS action_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id INTEGER REFERENCES players(id),
            action_input TEXT,
            action_output TEXT,
            room TEXT,
            points INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
    
    saveDatabase();
    console.log('Database tables created/verified');
}

/**
 * Save database to file
 */
function saveDatabase() {
    if (db) {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(DB_PATH, buffer);
    }
}

/**
 * Get database instance
 */
function getDb() {
    return db;
}

// ============== Player Operations ==============

/**
 * Supported languages
 */
const SUPPORTED_LANGUAGES = ['en', 'it', 'es'];
const DEFAULT_LANGUAGE = 'en';

/**
 * Register a new player
 * @param {string} playerName - Player's name
 * @param {string} playerKey - Player's authentication key
 * @param {string} language - Player's preferred language (default: 'en')
 */
function registerPlayer(playerName, playerKey, language = DEFAULT_LANGUAGE) {
    // Validate language
    if (!SUPPORTED_LANGUAGES.includes(language)) {
        language = DEFAULT_LANGUAGE;
    }
    
    try {
        db.run(
            'INSERT INTO players (player_name, player_key, language) VALUES (?, ?, ?)',
            [playerName, playerKey, language]
        );
        
        // Create initial session for player
        const player = getPlayerByKey(playerKey);
        if (player) {
            db.run(
                'INSERT INTO sessions (player_id, status) VALUES (?, ?)',
                [player.id, 'NOT_PLAYING']
            );
        }
        
        saveDatabase();
        return { success: true };
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return { success: false, error: 'player_name_taken' };
        }
        return { success: false, error: err.message };
    }
}

/**
 * Get player by key
 */
function getPlayerByKey(playerKey) {
    const result = db.exec(
        'SELECT id, player_name, player_key, language, created_at FROM players WHERE player_key = ?',
        [playerKey]
    );
    if (result.length > 0 && result[0].values.length > 0) {
        const row = result[0].values[0];
        return {
            id: row[0],
            player_name: row[1],
            player_key: row[2],
            language: row[3] || DEFAULT_LANGUAGE,
            created_at: row[4]
        };
    }
    return null;
}

/**
 * Get player by name
 */
function getPlayerByName(playerName) {
    const result = db.exec(
        'SELECT id, player_name, player_key, language, created_at FROM players WHERE player_name = ?',
        [playerName]
    );
    if (result.length > 0 && result[0].values.length > 0) {
        const row = result[0].values[0];
        return {
            id: row[0],
            player_name: row[1],
            player_key: row[2],
            language: row[3] || DEFAULT_LANGUAGE,
            created_at: row[4]
        };
    }
    return null;
}

/**
 * Update player language
 * @param {number} playerId - Player's ID
 * @param {string} language - New language code
 * @returns {object} Result with success flag
 */
function updatePlayerLanguage(playerId, language) {
    // Validate language
    if (!SUPPORTED_LANGUAGES.includes(language)) {
        return { success: false, error: 'invalid_language', supported: SUPPORTED_LANGUAGES };
    }
    
    try {
        db.run(
            'UPDATE players SET language = ? WHERE id = ?',
            [language, playerId]
        );
        saveDatabase();
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/**
 * Get supported languages
 */
function getSupportedLanguages() {
    return SUPPORTED_LANGUAGES;
}

// ============== Session Operations ==============

/**
 * Get session by player ID
 */
function getSession(playerId) {
    const result = db.exec(
        'SELECT id, player_id, status, current_room, inventory, game_state, timed_events, dati_avventura, pending_question, updated_at FROM sessions WHERE player_id = ?',
        [playerId]
    );
    if (result.length > 0 && result[0].values.length > 0) {
        const row = result[0].values[0];
        return {
            id: row[0],
            player_id: row[1],
            status: row[2],
            current_room: row[3],
            inventory: row[4] ? JSON.parse(row[4]) : {},
            game_state: row[5] ? JSON.parse(row[5]) : {},
            timed_events: row[6] ? JSON.parse(row[6]) : [],
            dati_avventura: row[7] ? JSON.parse(row[7]) : null,
            pending_question: row[8] ? JSON.parse(row[8]) : null,
            updated_at: row[9]
        };
    }
    return null;
}

/**
 * Update session
 */
function updateSession(playerId, sessionData) {
    const { status, current_room, inventory, game_state, timed_events, dati_avventura, pending_question } = sessionData;
    
    db.run(`
        UPDATE sessions SET 
            status = ?,
            current_room = ?,
            inventory = ?,
            game_state = ?,
            timed_events = ?,
            dati_avventura = ?,
            pending_question = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE player_id = ?
    `, [
        status,
        current_room,
        JSON.stringify(inventory || {}),
        JSON.stringify(game_state || {}),
        JSON.stringify(timed_events || []),
        dati_avventura ? JSON.stringify(dati_avventura) : null,
        pending_question ? JSON.stringify(pending_question) : null,
        playerId
    ]);
    
    saveDatabase();
}

/**
 * Reset session to NOT_PLAYING
 */
function resetSession(playerId) {
    db.run(`
        UPDATE sessions SET 
            status = 'NOT_PLAYING',
            current_room = NULL,
            inventory = NULL,
            game_state = NULL,
            timed_events = NULL,
            dati_avventura = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE player_id = ?
    `, [playerId]);
    
    saveDatabase();
}

// ============== Saved Games Operations ==============

/**
 * Save game
 */
function saveGame(playerId, saveName, gameData) {
    try {
        // Try to update existing save
        const existing = db.exec(
            'SELECT id FROM saved_games WHERE player_id = ? AND save_name = ?',
            [playerId, saveName]
        );
        
        if (existing.length > 0 && existing[0].values.length > 0) {
            db.run(
                'UPDATE saved_games SET game_data = ?, created_at = CURRENT_TIMESTAMP WHERE player_id = ? AND save_name = ?',
                [JSON.stringify(gameData), playerId, saveName]
            );
        } else {
            db.run(
                'INSERT INTO saved_games (player_id, save_name, game_data) VALUES (?, ?, ?)',
                [playerId, saveName, JSON.stringify(gameData)]
            );
        }
        
        saveDatabase();
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

/**
 * Load saved game
 */
function loadGame(playerId, saveName) {
    const result = db.exec(
        'SELECT game_data FROM saved_games WHERE player_id = ? AND save_name = ?',
        [playerId, saveName]
    );
    if (result.length > 0 && result[0].values.length > 0) {
        return JSON.parse(result[0].values[0][0]);
    }
    return null;
}

/**
 * List saved games for a player
 */
function listSavedGames(playerId) {
    const result = db.exec(
        'SELECT save_name, created_at FROM saved_games WHERE player_id = ? ORDER BY created_at DESC',
        [playerId]
    );
    if (result.length > 0) {
        return result[0].values.map(row => ({
            save_name: row[0],
            created_at: row[1]
        }));
    }
    return [];
}

/**
 * Delete all saved games for a player
 */
function deleteAllSavedGames(playerId) {
    db.run('DELETE FROM saved_games WHERE player_id = ?', [playerId]);
    saveDatabase();
}

/**
 * Delete a specific saved game
 */
function deleteSavedGame(playerId, saveName) {
    db.run('DELETE FROM saved_games WHERE player_id = ? AND save_name = ?', [playerId, saveName]);
    saveDatabase();
}

// ============== Action Log Operations ==============

/**
 * Log an action
 */
function logAction(playerId, input, output, room, points) {
    db.run(
        'INSERT INTO action_log (player_id, action_input, action_output, room, points) VALUES (?, ?, ?, ?, ?)',
        [playerId, input, output, room, points]
    );
    saveDatabase();
}

/**
 * Get recent actions for dashboard
 */
function getRecentActions(limit = 50) {
    const result = db.exec(`
        SELECT 
            al.id,
            p.player_name,
            al.action_input,
            al.action_output,
            al.room,
            al.points,
            al.created_at
        FROM action_log al
        JOIN players p ON al.player_id = p.id
        ORDER BY al.created_at DESC
        LIMIT ?
    `, [limit]);
    
    if (result.length > 0) {
        return result[0].values.map(row => ({
            id: row[0],
            player_name: row[1],
            action_input: row[2],
            action_output: row[3],
            room: row[4],
            points: row[5],
            created_at: row[6]
        }));
    }
    return [];
}

/**
 * Get active sessions for dashboard
 */
function getActiveSessions() {
    const result = db.exec(`
        SELECT 
            p.player_name,
            s.status,
            s.current_room,
            s.game_state,
            s.updated_at
        FROM sessions s
        JOIN players p ON s.player_id = p.id
        WHERE s.status = 'PLAYING'
        ORDER BY s.updated_at DESC
    `);
    
    if (result.length > 0) {
        return result[0].values.map(row => {
            const gameState = row[3] ? JSON.parse(row[3]) : {};
            return {
                player_name: row[0],
                status: row[1],
                current_room: row[2],
                points: gameState.punti || 0,
                moves: gameState.mosse || 0,
                updated_at: row[4]
            };
        });
    }
    return [];
}

/**
 * Get all players for dashboard
 */
function getAllPlayers() {
    const result = db.exec(`
        SELECT 
            p.id,
            p.player_name,
            s.status,
            s.current_room,
            s.game_state,
            p.created_at
        FROM players p
        LEFT JOIN sessions s ON p.id = s.player_id
        ORDER BY p.created_at DESC
    `);
    
    if (result.length > 0) {
        return result[0].values.map(row => {
            const gameState = row[4] ? JSON.parse(row[4]) : {};
            return {
                id: row[0],
                player_name: row[1],
                status: row[2] || 'NOT_PLAYING',
                current_room: row[3],
                points: gameState.punti || 0,
                moves: gameState.mosse || 0,
                created_at: row[5]
            };
        });
    }
    return [];
}

module.exports = {
    initDatabase,
    getDb,
    saveDatabase,
    // Player operations
    registerPlayer,
    getPlayerByKey,
    getPlayerByName,
    updatePlayerLanguage,
    getSupportedLanguages,
    // Session operations
    getSession,
    updateSession,
    resetSession,
    // Saved games operations
    saveGame,
    loadGame,
    listSavedGames,
    deleteAllSavedGames,
    deleteSavedGame,
    // Action log operations
    logAction,
    getRecentActions,
    getActiveSessions,
    getAllPlayers
};
