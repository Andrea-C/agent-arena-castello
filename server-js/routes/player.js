/**
 * Player route - Player profile management
 */

const express = require('express');
const db = require('../db');

const router = express.Router();

/**
 * @swagger
 * /player/language:
 *   put:
 *     summary: Update player language
 *     description: Change the player's preferred language. Takes effect immediately for all subsequent API responses.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - player_key
 *               - language
 *             properties:
 *               player_key:
 *                 type: string
 *                 description: Player's authentication key
 *                 example: abc123def456...
 *               language:
 *                 type: string
 *                 description: New language code
 *                 example: it
 *                 enum: [en, it, es]
 *     responses:
 *       200:
 *         description: Language updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 language:
 *                   type: string
 *                   description: New language setting
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid request or unsupported language
 *       401:
 *         description: Invalid player key
 */
router.put('/language', (req, res) => {
    const { player_key, language } = req.body;
    
    // Validate player_key
    if (!player_key) {
        return res.status(400).json({
            success: false,
            error: 'player_key_required',
            message: 'Player key is required'
        });
    }
    
    // Validate language
    if (!language) {
        return res.status(400).json({
            success: false,
            error: 'language_required',
            message: 'Language is required'
        });
    }
    
    // Check if language is supported
    const supportedLanguages = db.getSupportedLanguages();
    if (!supportedLanguages.includes(language)) {
        return res.status(400).json({
            success: false,
            error: 'invalid_language',
            message: `Unsupported language. Supported languages: ${supportedLanguages.join(', ')}`,
            supported_languages: supportedLanguages
        });
    }
    
    // Get player
    const player = db.getPlayerByKey(player_key);
    if (!player) {
        return res.status(401).json({
            success: false,
            error: 'invalid_player_key',
            message: 'Invalid player key'
        });
    }
    
    // Update language
    const result = db.updatePlayerLanguage(player.id, language);
    
    if (result.success) {
        res.json({
            success: true,
            language: language,
            message: 'Language updated successfully'
        });
    } else {
        res.status(400).json({
            success: false,
            error: result.error,
            message: 'Failed to update language'
        });
    }
});

/**
 * @swagger
 * /player/languages:
 *   get:
 *     summary: Get supported languages
 *     description: Returns a list of all supported language codes
 *     responses:
 *       200:
 *         description: List of supported languages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 languages:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [en, it, es]
 */
router.get('/languages', (req, res) => {
    res.json({
        success: true,
        languages: db.getSupportedLanguages()
    });
});

module.exports = router;
