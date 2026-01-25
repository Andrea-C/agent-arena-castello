/**
 * Register route - Player registration
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new player
 *     description: Register a new player with a unique name and receive a player key for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - player_name
 *             properties:
 *               player_name:
 *                 type: string
 *                 description: Unique player name
 *                 example: Marco
 *               language:
 *                 type: string
 *                 description: Preferred language (en, it, es). Defaults to 'en'
 *                 example: it
 *                 enum: [en, it, es]
 *     responses:
 *       200:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 player_key:
 *                   type: string
 *                   description: 40-character authentication token
 *                 language:
 *                   type: string
 *                   description: Player's language setting
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request or player name already taken
 */
router.post('/', (req, res) => {
    const { player_name, language } = req.body;
    
    if (!player_name || player_name.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: 'player_name_required',
            message: 'Player name is required'
        });
    }
    
    const trimmedName = player_name.trim();
    
    // Check if name already exists
    const existingPlayer = db.getPlayerByName(trimmedName);
    if (existingPlayer) {
        return res.status(400).json({
            success: false,
            error: 'player_name_taken',
            message: 'Player name not available'
        });
    }
    
    // Validate and normalize language (defaults to 'en' if not provided or invalid)
    const supportedLanguages = db.getSupportedLanguages();
    const playerLanguage = language && supportedLanguages.includes(language) ? language : 'en';
    
    // Generate a 40-character token
    const playerKey = uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '').substring(0, 8);
    
    // Register the player with language preference
    const result = db.registerPlayer(trimmedName, playerKey, playerLanguage);
    
    if (result.success) {
        res.json({
            success: true,
            player_key: playerKey,
            language: playerLanguage,
            message: 'Registration completed'
        });
    } else {
        res.status(400).json({
            success: false,
            error: result.error,
            message: 'Registration error'
        });
    }
});

module.exports = router;
