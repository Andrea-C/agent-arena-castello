/**
 * Status route - Get player status
 */

const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * @swagger
 * /status:
 *   get:
 *     summary: Get player status
 *     description: Get the current status of a player (NOT_PLAYING or PLAYING)
 *     parameters:
 *       - in: query
 *         name: player_key
 *         required: true
 *         schema:
 *           type: string
 *         description: Player authentication key
 *     responses:
 *       200:
 *         description: Player status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 status:
 *                   type: string
 *                   enum: [NOT_PLAYING, PLAYING]
 *                 player_name:
 *                   type: string
 *                 current_room:
 *                   type: string
 *                 points:
 *                   type: integer
 *                 moves:
 *                   type: integer
 *       401:
 *         description: Invalid player key
 */
router.get('/', (req, res) => {
    const { player_key } = req.query;
    
    if (!player_key) {
        return res.status(400).json({
            success: false,
            error: 'player_key_required',
            message: 'La chiave del giocatore è obbligatoria'
        });
    }
    
    // Get player
    const player = db.getPlayerByKey(player_key);
    if (!player) {
        return res.status(401).json({
            success: false,
            error: 'invalid_player_key',
            message: 'Chiave giocatore non valida'
        });
    }
    
    // Get session
    const session = db.getSession(player.id);
    
    if (!session) {
        return res.json({
            success: true,
            player_name: player.player_name,
            status: 'NOT_PLAYING',
            current_room: null,
            points: 0,
            moves: 0
        });
    }
    
    res.json({
        success: true,
        player_name: player.player_name,
        status: session.status,
        current_room: session.current_room,
        points: session.game_state?.punti || 0,
        moves: session.game_state?.mosse || 0,
        saved_games: db.listSavedGames(player.id)
    });
});

module.exports = router;
