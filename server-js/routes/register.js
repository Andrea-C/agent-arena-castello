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
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request or player name already taken
 */
router.post('/', (req, res) => {
    const { player_name } = req.body;
    
    if (!player_name || player_name.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: 'player_name_required',
            message: 'Il nome del giocatore è obbligatorio'
        });
    }
    
    const trimmedName = player_name.trim();
    
    // Check if name already exists
    const existingPlayer = db.getPlayerByName(trimmedName);
    if (existingPlayer) {
        return res.status(400).json({
            success: false,
            error: 'player_name_taken',
            message: 'Nome giocatore non disponibile'
        });
    }
    
    // Generate a 40-character token
    const playerKey = uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '').substring(0, 8);
    
    // Register the player
    const result = db.registerPlayer(trimmedName, playerKey);
    
    if (result.success) {
        res.json({
            success: true,
            player_key: playerKey,
            message: 'Registrazione completata'
        });
    } else {
        res.status(400).json({
            success: false,
            error: result.error,
            message: 'Errore durante la registrazione'
        });
    }
});

module.exports = router;
