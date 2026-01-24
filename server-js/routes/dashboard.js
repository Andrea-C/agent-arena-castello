/**
 * Dashboard route - Monitoring dashboard
 */

const express = require('express');
const path = require('path');
const db = require('../db');

const router = express.Router();

/**
 * Serve dashboard HTML page
 */
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html'));
});

/**
 * @swagger
 * /dashboard/api/sessions:
 *   get:
 *     summary: Get active sessions
 *     description: Get list of currently active game sessions
 *     responses:
 *       200:
 *         description: List of active sessions
 */
router.get('/api/sessions', (req, res) => {
    const sessions = db.getActiveSessions();
    res.json({
        success: true,
        sessions: sessions
    });
});

/**
 * @swagger
 * /dashboard/api/players:
 *   get:
 *     summary: Get all players
 *     description: Get list of all registered players
 *     responses:
 *       200:
 *         description: List of all players
 */
router.get('/api/players', (req, res) => {
    const players = db.getAllPlayers();
    res.json({
        success: true,
        players: players
    });
});

/**
 * @swagger
 * /dashboard/api/actions:
 *   get:
 *     summary: Get recent actions
 *     description: Get list of recent game actions
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of actions to return
 *     responses:
 *       200:
 *         description: List of recent actions
 */
router.get('/api/actions', (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const actions = db.getRecentActions(limit);
    res.json({
        success: true,
        actions: actions
    });
});

module.exports = router;
