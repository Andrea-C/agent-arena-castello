/**
 * Play route - Main game interaction endpoint
 */

const express = require('express');
const db = require('../db');
const GameEngine = require('../game/GameEngine');
const { loadI18nForLanguage } = require('../game/GameDataLoader');

const router = express.Router();

// Cache of active game engines per player
const gameEngines = new Map();

/**
 * Get or create game engine for a player
 */
function getGameEngine(playerId, session) {
    let engine = gameEngines.get(playerId);
    
    if (!engine) {
        engine = new GameEngine();
        engine.start();
        gameEngines.set(playerId, engine);
    }
    
    // Restore state from session if playing
    // IMPORTANT: Do NOT restore datiAvventura from session because JSON.stringify
    // removes all functions (room overrides, callbacks, etc.)
    // Only restore the mutable state (inventory, altriDati, timedEvents, object positions)
    if (session && session.status === 'PLAYING') {
        // Restore inventory
        engine.inventario = session.inventory || {};
        
        // Restore altriDati (points, moves, etc.)
        engine.altriDati = session.game_state || { mosse: 0, punti: 0 };
        
        // Restore timed events list
        engine.timedEvents = session.timed_events || [];
        
        // Restore object positions from session if available
        if (session.dati_avventura?.objects) {
            for (let objKey in session.dati_avventura.objects) {
                if (engine.datiAvventura.objects[objKey]) {
                    engine.datiAvventura.objects[objKey].posizione = session.dati_avventura.objects[objKey].posizione;
                    engine.datiAvventura.objects[objKey].status = session.dati_avventura.objects[objKey].status;
                    engine.datiAvventura.objects[objKey].visibile = session.dati_avventura.objects[objKey].visibile;
                }
            }
        }
        
        // Restore room visit flags from session if available
        if (session.dati_avventura?.stanze) {
            for (let roomKey in session.dati_avventura.stanze) {
                if (engine.datiAvventura.stanze[roomKey]) {
                    engine.datiAvventura.stanze[roomKey].primaEntrata = session.dati_avventura.stanze[roomKey].primaEntrata;
                }
            }
        }
        
        // Restore timed event current steps
        if (session.dati_avventura?.timedEvents) {
            for (let eventKey in session.dati_avventura.timedEvents) {
                if (engine.datiAvventura.timedEvents[eventKey]) {
                    engine.datiAvventura.timedEvents[eventKey].currentStep = session.dati_avventura.timedEvents[eventKey].currentStep;
                }
            }
        }
        
        // Set current room - use the original room from datiAvventura to preserve overrides
        if (session.current_room && engine.datiAvventura.stanze[session.current_room]) {
            engine.stanzaCorrente = engine.datiAvventura.stanze[session.current_room];
            engine.Parser.setOverride(engine.stanzaCorrente.override);
            engine.refreshOggettiInStanza();
        }
        
        // Restore pending question state
        engine.pendingQuestion = session.pending_question || null;
    }
    
    return engine;
}

/**
 * Save engine state to database
 * Only save mutable state - NOT the full datiAvventura which contains functions
 */
function saveEngineState(playerId, engine, status = 'PLAYING') {
    // Extract only the mutable parts of datiAvventura that need to be persisted
    const mutableDatiAvventura = {
        // Save object positions, statuses, visibility
        objects: {},
        // Save room visit flags
        stanze: {},
        // Save timed event current steps
        timedEvents: {}
    };
    
    // Extract mutable object data
    for (let objKey in engine.datiAvventura.objects) {
        const obj = engine.datiAvventura.objects[objKey];
        mutableDatiAvventura.objects[objKey] = {
            posizione: obj.posizione,
            status: obj.status,
            visibile: obj.visibile
        };
    }
    
    // Extract room visit flags
    for (let roomKey in engine.datiAvventura.stanze) {
        const room = engine.datiAvventura.stanze[roomKey];
        mutableDatiAvventura.stanze[roomKey] = {
            primaEntrata: room.primaEntrata
        };
    }
    
    // Extract timed event current steps
    for (let eventKey in engine.datiAvventura.timedEvents) {
        const event = engine.datiAvventura.timedEvents[eventKey];
        mutableDatiAvventura.timedEvents[eventKey] = {
            currentStep: event.currentStep
        };
    }
    
    db.updateSession(playerId, {
        status: status,
        current_room: engine.stanzaCorrente?.key,
        inventory: engine.inventario,
        game_state: engine.altriDati,
        timed_events: engine.timedEvents,
        dati_avventura: mutableDatiAvventura,
        pending_question: engine.pendingQuestion || null
    });
}

/**
 * @swagger
 * /play:
 *   post:
 *     summary: Send a game action
 *     description: Send an action/command to the game and receive the response
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - player_key
 *               - input
 *             properties:
 *               player_key:
 *                 type: string
 *                 description: Player authentication key
 *               player_name:
 *                 type: string
 *                 description: Player name (for debugging)
 *               input:
 *                 type: string
 *                 description: Game command or action
 *                 example: NORD
 *               save_name:
 *                 type: string
 *                 description: Name for save game (when saving)
 *     responses:
 *       200:
 *         description: Game response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 output:
 *                   type: string
 *                   description: Game output text
 *                 state:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [NOT_PLAYING, PLAYING]
 *                     room:
 *                       type: string
 *                     points:
 *                       type: integer
 *                     moves:
 *                       type: integer
 */
router.post('/', async (req, res) => {
    const { player_key, player_name, input, save_name } = req.body;
    
    // Validate player_key
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
    
    // Load language-specific i18n for this player
    const i18nData = loadI18nForLanguage(player.language);
    
    // Get session
    let session = db.getSession(player.id);
    
    // Get or create game engine
    const engine = getGameEngine(player.id, session);
    
    // Set i18n on the engine instance (race-safe: each request uses its own i18n)
    engine.setI18n(i18nData);
    
    // Handle based on current status
    if (!session || session.status === 'NOT_PLAYING') {
        return handleNotPlaying(req, res, player, engine, input);
    } else {
        return await handlePlaying(req, res, player, engine, session, input, save_name);
    }
});

/**
 * Handle NOT_PLAYING status - menu selection
 */
async function handleNotPlaying(req, res, player, engine, input) {
    const trimmedInput = (input || '').trim();
    
    // If no input, show menu
    if (!trimmedInput) {
        return res.json({
            success: true,
            output: engine.getMenuText(),
            state: {
                status: 'NOT_PLAYING',
                room: null,
                points: 0,
                moves: 0
            }
        });
    }
    
    // Handle menu selection
    switch (trimmedInput) {
        case '1':
            // Start new game with prologue and intro
            const startOutput = await engine.startNewGame();
            
            // Save state
            saveEngineState(player.id, engine, 'PLAYING');
            
            // Log action
            db.logAction(player.id, 'START_GAME', startOutput, engine.stanzaCorrente?.key, engine.altriDati.punti);
            
            return res.json({
                success: true,
                output: startOutput,
                state: {
                    status: 'PLAYING',
                    room: engine.stanzaCorrente?.key,
                    roomLabel: engine.stanzaCorrente?.label,
                    points: engine.altriDati.punti,
                    moves: engine.altriDati.mosse
                }
            });
            
        case '2':
            // List saved games
            const savedGames = db.listSavedGames(player.id);
            if (savedGames.length === 0) {
                return res.json({
                    success: true,
                    output: 'Nessun dato salvato...\n\n' + engine.getMenuText(),
                    state: {
                        status: 'NOT_PLAYING',
                        room: null,
                        points: 0,
                        moves: 0
                    }
                });
            }
            
            let output = 'Salvataggi disponibili:\n';
            savedGames.forEach((save, i) => {
                output += `- ${save.save_name} (${save.created_at})\n`;
            });
            output += '\nInvia il nome del salvataggio da caricare.';
            
            return res.json({
                success: true,
                output: output,
                state: {
                    status: 'NOT_PLAYING',
                    room: null,
                    points: 0,
                    moves: 0
                },
                awaiting_load: true,
                saved_games: savedGames
            });
            
        case '3':
            // Delete all saved games
            db.deleteAllSavedGames(player.id);
            return res.json({
                success: true,
                output: 'Tutti i salvataggi sono stati cancellati.\n\n' + engine.getMenuText(),
                state: {
                    status: 'NOT_PLAYING',
                    room: null,
                    points: 0,
                    moves: 0
                }
            });
            
        case '4':
            // Show instructions
            engine.clearOutput();
            await engine.istruzioni();
            return res.json({
                success: true,
                output: engine.getOutput() + '\n\n' + engine.getMenuText(),
                state: {
                    status: 'NOT_PLAYING',
                    room: null,
                    points: 0,
                    moves: 0
                }
            });
            
        case '5':
            // Quit
            return res.json({
                success: true,
                output: 'Peggio per te!',
                state: {
                    status: 'NOT_PLAYING',
                    room: null,
                    points: 0,
                    moves: 0
                },
                quit: true
            });
            
        default:
            // Try to load a saved game by name
            const gameData = db.loadGame(player.id, trimmedInput);
            if (gameData) {
                engine.reload(gameData);
                
                // Set current room
                if (gameData.stanzaCorrente && engine.datiAvventura.stanze[gameData.stanzaCorrente]) {
                    engine.stanzaCorrente = engine.datiAvventura.stanze[gameData.stanzaCorrente];
                    engine.Parser.setOverride(engine.stanzaCorrente.override);
                    engine.refreshOggettiInStanza();
                }
                
                // Save state
                saveEngineState(player.id, engine, 'PLAYING');
                
                engine.clearOutput();
                engine.print('Dati caricati...');
                await engine.descriviStanzaCorrente();
                
                return res.json({
                    success: true,
                    output: engine.getOutput(),
                    state: {
                        status: 'PLAYING',
                        room: engine.stanzaCorrente?.key,
                        roomLabel: engine.stanzaCorrente?.label,
                        points: engine.altriDati.punti,
                        moves: engine.altriDati.mosse
                    }
                });
            }
            
            // Invalid input
            return res.json({
                success: true,
                output: 'Scelta non valida.\n\n' + engine.getMenuText(),
                state: {
                    status: 'NOT_PLAYING',
                    room: null,
                    points: 0,
                    moves: 0
                }
            });
    }
}

/**
 * Handle PLAYING status - game commands
 */
async function handlePlaying(req, res, player, engine, session, input, save_name) {
    const trimmedInput = (input || '').trim();
    
    // If no input, just describe current room
    if (!trimmedInput) {
        engine.clearOutput();
        await engine.descriviStanzaCorrente();
        return res.json({
            success: true,
            output: engine.getOutput(),
            state: {
                status: 'PLAYING',
                room: engine.stanzaCorrente?.key,
                roomLabel: engine.stanzaCorrente?.label,
                points: engine.altriDati.punti,
                moves: engine.altriDati.mosse
            }
        });
    }
    
    // Check if there's a pending yes/no question
    if (engine.hasPendingQuestion()) {
        const answer = engine.parseYesNoInput(trimmedInput);
        
        if (answer === null) {
            // Invalid answer - re-prompt
            engine.clearOutput();
            const i18n = engine.i18n || global.i18n;
            engine.print("(" + i18n.IFEngine.yesOrNo.yes + "/" + i18n.IFEngine.yesOrNo.no + ") ");
            
            // Save state and return
            saveEngineState(player.id, engine, 'PLAYING');
            
            return res.json({
                success: true,
                output: engine.getOutput(),
                state: {
                    status: 'PLAYING',
                    room: engine.stanzaCorrente?.key,
                    roomLabel: engine.stanzaCorrente?.label,
                    points: engine.altriDati.punti,
                    moves: engine.altriDati.mosse
                },
                awaiting_answer: true
            });
        }
        
        // Valid answer - set it and re-execute the original input
        engine.setQuestionAnswer(answer);
        const originalInput = engine.getPendingOriginalInput();
        
        // Re-execute the original command (the yesNoQuestion will now return the answer)
        // Move will be counted normally this time since it's a fresh processInput call
        input = originalInput;
    }
    
    // Process the input with try/catch for PENDING_QUESTION
    let result;
    try {
        result = await engine.processInput(input);
    } catch (error) {
        if (error.isPendingQuestion) {
            // A yes/no question was triggered - undo the move increment since action didn't complete
            if (engine.altriDati.mosse !== undefined && engine.altriDati.mosse > 0) {
                engine.altriDati.mosse--;
            }
            
            // Save state and return
            saveEngineState(player.id, engine, 'PLAYING');
            
            return res.json({
                success: true,
                output: engine.getOutput(),
                state: {
                    status: 'PLAYING',
                    room: engine.stanzaCorrente?.key,
                    roomLabel: engine.stanzaCorrente?.label,
                    points: engine.altriDati.punti,
                    moves: engine.altriDati.mosse
                },
                awaiting_answer: true
            });
        }
        // Re-throw other errors
        throw error;
    }
    
    // Handle special results
    if (result.needsSave) {
        const saveName = save_name || `save_${Date.now()}`;
        const gameState = engine._getTbs();
        db.saveGame(player.id, saveName, gameState);
        
        engine.clearOutput();
        engine.print('Dati salvati!');
        
        return res.json({
            success: true,
            output: engine.getOutput(),
            state: {
                status: 'PLAYING',
                room: engine.stanzaCorrente?.key,
                roomLabel: engine.stanzaCorrente?.label,
                points: engine.altriDati.punti,
                moves: engine.altriDati.mosse
            },
            saved: true,
            save_name: saveName
        });
    }
    
    if (result.needsLoad) {
        // List saved games
        const savedGames = db.listSavedGames(player.id);
        if (savedGames.length === 0) {
            engine.clearOutput();
            engine.print('Nessun dato salvato...');
            return res.json({
                success: true,
                output: engine.getOutput(),
                state: {
                    status: 'PLAYING',
                    room: engine.stanzaCorrente?.key,
                    roomLabel: engine.stanzaCorrente?.label,
                    points: engine.altriDati.punti,
                    moves: engine.altriDati.mosse
                }
            });
        }
        
        let output = 'Salvataggi disponibili:\n';
        savedGames.forEach((save) => {
            output += `- ${save.save_name}\n`;
        });
        
        return res.json({
            success: true,
            output: output,
            state: {
                status: 'PLAYING',
                room: engine.stanzaCorrente?.key,
                roomLabel: engine.stanzaCorrente?.label,
                points: engine.altriDati.punti,
                moves: engine.altriDati.mosse
            },
            awaiting_load: true,
            saved_games: savedGames
        });
    }
    
    // Use the actual input that was processed (might be originalInput when resuming from question)
    const processedInput = (input || '').trim();
    
    // Check if game is over
    if (result.gameOver) {
        // Reset session to NOT_PLAYING
        db.resetSession(player.id);
        gameEngines.delete(player.id);
        
        // Log action
        db.logAction(player.id, processedInput, result.output, engine.stanzaCorrente?.key, engine.altriDati.punti);
        
        return res.json({
            success: true,
            output: result.output + '\n\n' + new GameEngine().getMenuText(),
            state: {
                status: 'NOT_PLAYING',
                room: null,
                points: engine.altriDati.punti,
                moves: engine.altriDati.mosse
            },
            game_over: true,
            player_died: result.playerDied
        });
    }
    
    // Save state
    saveEngineState(player.id, engine, 'PLAYING');
    
    // Log action
    db.logAction(player.id, processedInput, result.output, engine.stanzaCorrente?.key, engine.altriDati.punti);
    
    return res.json({
        success: true,
        output: result.output,
        state: {
            status: 'PLAYING',
            room: engine.stanzaCorrente?.key,
            roomLabel: engine.stanzaCorrente?.label,
            points: engine.altriDati.punti,
            moves: engine.altriDati.mosse
        }
    });
}

module.exports = router;
