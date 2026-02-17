/**
 * IFEngineServer - Interactive Fiction Engine for Server-side use
 * Adapted from source_app/IFEngine/js/IFEngine.js
 * 
 * Key changes:
 * - Removed CRT (console/terminal) dependencies
 * - Removed localStorage - uses database via callbacks
 * - Uses output buffer instead of printing to screen
 * - Synchronous processing (no user input waiting)
 */

const Parser = require('./Parser');
const Thesaurus = require('./Thesaurus');

class IFEngineServer {
    constructor() {
        // Per-instance i18n data — eliminates global.i18n race condition
        // Set via setI18n() before processing each request
        this.i18n = null;
        
        // Output buffer - collects all output text
        this.outputBuffer = [];
        
        // The current room
        this.stanzaCorrente = null;

        // Player inventory
        this.inventario = {};

        // Additional game data to save
        this.altriDati = {};

        // Strong check for phrases
        this.strongCheck = true;

        // Timed events list
        this.timedEvents = [];

        // Game is over flag
        this.gameOver = false;
        
        // Player died flag
        this.playerDied = false;
        
        // Pending yes/no question state for API-based interaction
        // When a yesNoQuestion is triggered, we store the context and return to the client
        // The next input will be treated as the yes/no answer
        this.pendingQuestion = null;

        // Thesaurus for commands/verbs
        this.Thesaurus = new Thesaurus();
        
        // Menu options (for reference, handled differently on server)
        this.menuOptions = {
            '1': 'START_GAME',
            '2': 'LOAD_GAME', 
            '3': 'DELETE_SAVES',
            '4': 'GET_INSTRUCTIONS',
            '5': 'QUIT'
        };

        // Setup commands
        this._setupCommands();
    }

    _setupCommands() {
        // Add default commands to Thesaurus
        this.Thesaurus.commands = {
            ...this.Thesaurus.commands,
            ...{
                salva: {
                    callback: async () => {
                        // Save handled at API level
                        return { needsSave: true };
                    }
                },
                carica: {
                    callback: async () => {
                        // Load handled at API level
                        return { needsLoad: true };
                    }
                },
                istruzioni: {
                    callback: async () => {
                        await this.istruzioni();
                        return true;
                    }
                },
                inventario: {
                    callback: async () => {
                        await this._inventario();
                        return true;
                    }
                },
                basta: {
                    callback: async () => {
                        this.print(this._getI18n().AvventuraNelCastelloJSEngine.commands.stop.defaultMessage);
                        this.gameOver = true;
                        return { gameOver: true };
                    }
                }
            }
        };
    }

    /**
     * Set the i18n data for this engine instance.
     * Must be called before processing each request to ensure the correct language.
     */
    setI18n(i18nData) {
        this.i18n = i18nData;
        // Also update Thesaurus so it uses instance i18n
        if (this.Thesaurus) {
            this.Thesaurus.setI18n(i18nData);
        }
    }

    /**
     * Get the current i18n data. Prefers instance-level, falls back to global.
     */
    _getI18n() {
        return this.i18n || global.i18n;
    }

    // ============== Output Methods ==============

    /**
     * Add text to output buffer (replaces CRT.printTyping)
     */
    print(text, options = {}) {
        if (text === undefined || text === null) return;
        
        const { nlBefore = 0, nlAfter = 0 } = options;
        
        // Add newlines before
        for (let i = 0; i < nlBefore; i++) {
            this.outputBuffer.push('');
        }
        
        // Add the text
        if (Array.isArray(text)) {
            this.outputBuffer.push(...text);
        } else {
            this.outputBuffer.push(String(text));
        }
        
        // Add newlines after
        for (let i = 0; i < nlAfter; i++) {
            this.outputBuffer.push('');
        }
    }

    /**
     * Clear output buffer
     */
    clearOutput() {
        this.outputBuffer = [];
    }

    /**
     * Get output as string
     */
    getOutput() {
        return this.outputBuffer.join('\n');
    }

    // ============== Game Initialization ==============

    /**
     * Initialize the game engine
     */
    start() {
        // Parser for actions
        this.Parser = new Parser(this.Thesaurus.verbs, this.Thesaurus.commands);

        if (this.datiAvventura === undefined) {
            throw new Error(this._getI18n().IFEngine.warnings.notLoaded);
        }

        // Set key value for each object
        for (let o in this.datiAvventura.objects) {
            this.datiAvventura.objects[o].key = o;
            this.datiAvventura.objects[o].type = "oggetto";
        }

        // Set key value for each room
        for (let s in this.datiAvventura.stanze) {
            this.datiAvventura.stanze[s].key = s;
        }

        // Store initial data for restart
        // Store initial state for reset - but DON'T stringify datiAvventura
        // because that loses the function references
        this.datiIniziali = {
            inventario: {},
            altriDati: JSON.parse(JSON.stringify(this.altriDati)),
            timedEvents: []
        };
    }

    /**
     * Restart the game - reset mutable state without touching datiAvventura
     * This preserves the function references in room overrides
     */
    async restart() {
        this.clearOutput();
        
        // Reset mutable state
        this.inventario = {};
        this.altriDati = JSON.parse(JSON.stringify(this.datiIniziali.altriDati));
        this.timedEvents = [];
        this.stanzaCorrente = null;
        this.gameOver = false;
        this.playerDied = false;
        
        // Reset object positions to their initial values
        for (let objKey in this.datiAvventura.objects) {
            const obj = this.datiAvventura.objects[objKey];
            // Reset to initial position stored in the object itself
            // (objects define their own initial position)
        }
        
        // Reset room visit flags
        for (let roomKey in this.datiAvventura.stanze) {
            delete this.datiAvventura.stanze[roomKey].primaEntrata;
        }
        
        // Reset timed event counters
        for (let eventKey in this.datiAvventura.timedEvents) {
            delete this.datiAvventura.timedEvents[eventKey].currentStep;
        }
    }

    // ============== Room Management ==============

    /**
     * Enter a room
     */
    async entra(labelStanza) {
        if (await this._breakRoomAction("onExit"))
            return false;

        this.stanzaCorrente = this.datiAvventura.stanze[labelStanza];
        this.Parser.setOverride(this.stanzaCorrente.override);

        if (await this._breakRoomAction("onEnter"))
            return false;

        if (this.stanzaCorrente.label !== undefined) {
            this.print(this.stanzaCorrente.label.toUpperCase());
        }
        
        this.refreshOggettiInStanza();
        await this.descriviStanzaCorrente();
        return true;
    }

    async _breakRoomAction(action) {
        if (this.stanzaCorrente && this.stanzaCorrente[action]) {
            // Bind 'this' to the engine so callbacks can access engine methods like stopTimedEvent
            let ret = await this.stanzaCorrente[action].call(this);
            return ret === false;
        }
        return false;
    }

    /**
     * Refresh objects in current room based on position
     */
    refreshOggettiInStanza() {
        this.stanzaCorrente.objects = this._filter(o => {
            return o.posizione == this.stanzaCorrente.key;
        }, this.datiAvventura.objects);
    }

    /**
     * Describe current room
     */
    async descriviStanzaCorrente(descrizioneLunga) {
        if (this.stanzaCorrente.interactors === undefined)
            this.stanzaCorrente.interactors = {};

        let description;
        if (this.stanzaCorrente.primaEntrata === undefined || descrizioneLunga) {
            this.stanzaCorrente.primaEntrata = true;
            description = this._descrizione(this.stanzaCorrente.description);
        } else {
            description = this._descrizione(this.stanzaCorrente.shortDescription || this.stanzaCorrente.description);
        }

        this.print(description);
        await this.elenca(this.stanzaCorrente.interactors);
        await this.elenca(this.stanzaCorrente.objects);
    }

    _descrizione(d) {
        return Array.isArray(d) ? d.join("\n") : d;
    }

    /**
     * List visible things
     */
    async elenca(lista) {
        if (lista == null) return;
        
        if (Object.keys(lista).length > 0) {
            for (let i in lista) {
                // Skip null entries
                if (lista[i] == null) continue;
                
                if (lista[i].visibile) {
                    let cosaVedo = Array.isArray(lista[i].label) ? 
                        lista[i].label[lista[i].status || 0] : 
                        lista[i].label;
                    this.print(this._getI18n().AvventuraNelCastelloJSEngine.prefixLabels.ISee + " " + cosaVedo.trim() + ".");
                }
            }
        }
    }

    // ============== Game Loop ==============
    
    /**
     * Stub for gameLoop - in client version this triggers the interactive loop
     * In API version, we don't need it - just a no-op
     */
    gameLoop(arg) {
        // No-op in API version - each API call is one action
        return;
    }

    /**
     * Process a single input command
     * Returns result object with output and state
     */
    async processInput(input) {
        this.clearOutput();
        
        if (!input || input.trim().length === 0) {
            this.print(this._getI18n().AvventuraNelCastelloJSEngine.messages.somethingSensible);
            return this._buildResult();
        }

        // Prepare input
        input = this._prepare(input);
        
        // Increment moves
        if (this.altriDati.mosse !== undefined) {
            this.altriDati.mosse++;
        }

        // Parse and execute command
        let result = await this._parse(input);

        // Process timed events
        if (this.timedEvents.length > 0 && result !== false) {
            await this._processTimedEvents();
        }

        return this._buildResult(result);
    }

    /**
     * Build result object
     */
    _buildResult(parseResult) {
        return {
            output: this.getOutput(),
            gameOver: this.gameOver,
            playerDied: this.playerDied,
            needsSave: parseResult?.needsSave || false,
            needsLoad: parseResult?.needsLoad || false,
            state: {
                room: this.stanzaCorrente?.key,
                roomLabel: this.stanzaCorrente?.label,
                points: this.altriDati.punti || 0,
                moves: this.altriDati.mosse || 0
            }
        };
    }

    /**
     * Prepare input text
     */
    _prepare(input) {
        input = input.trim().toLowerCase();
        // Remove accents
        input = input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        
        // Apply transformation steps
        for (let step of this._getI18n().AvventuraNelCastelloJSEngine.prepareInputSteps) {
            let pattern = RegExp(step.pattern, "g");
            input = input.replace(pattern, step.replaceWith);
        }
        
        return input.trim();
    }

    /**
     * Parse and execute command
     */
    async _parse(input) {
        let APO = this.Parser.parse(input);
        
        if (APO === false) {
            return this.inputNotUnderstood(input);
        }
        
        if (typeof APO == 'string') {
            // command = verb, missing the rest
            this.print(APO.charAt(0).toUpperCase() + APO.slice(1) + " " + this._getI18n().IFEngine.questions.what + " " + this.Thesaurus.defaultMessages.SII_PIU_SPECIFICO);
            return true;
        }
        
        // It's an imperative command with callback
        if (APO.command && APO.actionObject.callback !== undefined) {
            let ret = await this._callbackOrString(APO.actionObject.callback, input);
            if (ret !== null)
                return ret;
        }

        // Recognized action
        return await this._action(APO, input);
    }

    async _action(APO, input) {
        let actionObject = APO.actionObject;
        
        if (actionObject.movimento) {
            return await this._vai(APO.subjects[0], actionObject.defaultMessage);
        }

        // It's an action - check if feasible
        let testVerb = APO.subjects[0];
        if (testVerb !== undefined) {
            if (testVerb.indexOf(" ") >= 0)
                testVerb = testVerb.substring(0, testVerb.indexOf(" "));
            if (typeof this.Parser.parse(testVerb) == 'string') {
                this.print(this.Thesaurus.defaultMessages.NON_HO_CAPITO);
                return true;
            }
        }

        // Map subjects to interactors/objects
        let mSubjects = APO.subjects.map(subject => {
            let interattore = this._get(subject, this.stanzaCorrente.interactors);
            let oggettoInStanza = this._get(subject, this.stanzaCorrente.objects);
            let oggettoInInventario = this._get(subject, this.inventario);

            return interattore ? interattore : 
                (oggettoInStanza ? oggettoInStanza : 
                (oggettoInInventario ? oggettoInInventario : null));
        });

        // Couldn't map everything
        if (APO.subjects.length != mSubjects.filter(i => i != null).length) {
            let nullIndex = mSubjects.indexOf(null);
            let wtf = this.Thesaurus.verbs[APO.verb] === undefined ? input : APO.subjects[nullIndex];
            return await this.wtf(APO, wtf);
        }

        // Only verb written
        if (APO.subjects.length == 0) {
            if (actionObject.singolo === undefined || actionObject.singolo == false) {
                this.print(this.Thesaurus.defaultMessages.SII_PIU_SPECIFICO);
                return true;
            }

            if (actionObject.callback) {
                let ret = await this._callbackOrString(actionObject.callback);
                if (ret !== null)
                    return ret;
            }
            
            this.print(actionObject.defaultMessage === undefined ? this.Thesaurus.defaultMessages.PREFERISCO_DI_NO : actionObject.defaultMessage);
            return true;
        }

        // Override with callback defined
        if (actionObject.callback !== undefined) {
            let ret = await this._callbackOrString(actionObject.callback, mSubjects);
            if (ret !== null)
                return ret;
        }

        let visibile = mSubjects[0].visibile === undefined ? true : mSubjects[0].visibile;

        if (visibile) {
            let actionResult = await this._playAction(APO, mSubjects);
            if (actionResult != null)
                return actionResult;
        }

        if (visibile == false && actionObject.inventario == undefined) {
            return this._notSeen(mSubjects[0]);
        }

        switch (APO.verb) {
            case "guarda":
                let descrizione = mSubjects[0].description ?
                    (Array.isArray(mSubjects[0].description) ? mSubjects[0].description[mSubjects[0].status || 0] : mSubjects[0].description) :
                    actionObject.defaultMessage;
                this.print(descrizione);
                return true;

            case "prendi":
                let ret = await this._prendi(mSubjects[0]);
                return ret === undefined ? true : ret;

            case "lascia":
                if (this.inventario[mSubjects[0].key] !== undefined) {
                    this._rimuoviDaInventario(mSubjects[0]);
                    this.print(this.Thesaurus.defaultMessages.FATTO);
                    return true;
                }
                this.print(this.Thesaurus.defaultMessages.NON_NE_POSSIEDI);
                return true;
        }

        // Can't apply to subjects
        let errorMessage = 
            actionObject.defaultMessage === undefined ? 
            this.Thesaurus.defaultMessages.NON_HO_CAPITO : 
            actionObject.defaultMessage;

        this.print(errorMessage);
        return (errorMessage == this.Thesaurus.defaultMessages.NON_HO_CAPITO) ? undefined : true;
    }

    async _notSeen(s) {
        this.print(this.Thesaurus.defaultMessages.QUI_NON_NE_VEDO);
        return true;
    }

    async _playAction(APO, s) {
        let verb = APO.verb;
        s = [...s];

        let ai = await this._azioneInventario(APO, s);
        if (ai) return true;

        if (s[0] !== undefined && s[0].on !== undefined) {
            let play = this.Parser._getSource(verb, s[0].on);
            if (play)
                return await this._callbackOrString(play, s);
        }

        return null;
    }

    async _callbackOrString(source, arg) {
        if (typeof source == 'string') {
            this.print(source);
            return true;
        }

        let ret = await source.call(this, arg);

        if (typeof ret == 'string') {
            this.print(ret);
            return true;
        }

        if (ret === undefined)
            ret = true;

        return ret;
    }

    async _azioneInventario(APO, s) {
        if (APO.actionObject.inventario) {
            let inventarioKey = typeof APO.actionObject.inventario == 'boolean' ? [APO.actionObject.inventario] : APO.actionObject.inventario;
            for (let i in s) {
                if (inventarioKey[i] && this.inventario[s[i].key] === undefined) {
                    this.print(this.Thesaurus.defaultMessages.NON_NE_POSSIEDI);
                    return true;
                }
            }
        }
        return false;
    }

    inputNotUnderstood(input) {
        this.print(this.Thesaurus.defaultMessages.NON_HO_CAPITO);
        return true;
    }

    async wtf(APO, wtf) {
        if (wtf.indexOf(" ") >= 0)
            wtf = wtf.substring(0, wtf.indexOf(" "));
        this.print("   " + wtf.toUpperCase() + " " + this._getI18n().IFEngine.questionMark + this._getI18n().IFEngine.questionMark + this._getI18n().IFEngine.questionMark);
        return true;
    }

    // ============== Movement ==============

    async _vai(direzione, defaultMessage) {
        let direzioni = this.stanzaCorrente.directions;
        let direzioniBloccate = this.stanzaCorrente.unavaiableDirections === undefined ? [] : this.stanzaCorrente.unavaiableDirections;

        if (direzioni !== undefined && direzioni[direzione] !== undefined && direzioniBloccate.includes(direzione) === false) {
            if (typeof direzioni[direzione] == 'string') {
                await this.entra(direzioni[direzione]);
                return false;
            }
            let ret = await direzioni[direzione].call(this);
            if (typeof ret == 'string') {
                this.print(ret);
                return true;
            }
            return ret === undefined ? false : ret;
        }

        this.print(defaultMessage);
        return true;
    }

    // ============== Inventory ==============

    async _inventario() {
        let output;
        if (Object.keys(this.inventario).length == 0) {
            output = this._getI18n().IFEngine.messages.noObjects;
        } else {
            output = "* " + this._getI18n().IFEngine.messages.carriedObjectsLabel + " *";
            for (let i in this.inventario) {
                let label = Array.isArray(this.inventario[i].label) ?
                    this.inventario[i].label[this.inventario[i].status || 0] :
                    this.inventario[i].label;
                output += "\n- " + label.trim() + ".";
            }
        }
        this.print(output);
    }

    _aggiungiInInventario(oggetto) {
        this.scopri(oggetto);
        this.stanzaCorrente.objects[oggetto.key].posizione = null;
        this.inventario[oggetto.key] = oggetto;
        this.refreshOggettiInStanza();
    }

    _rimuoviDaInventario(oggetto, posizione) {
        oggetto.posizione = 
            posizione === undefined ? 
            this.stanzaCorrente.key :
            posizione;
        this.datiAvventura.objects[oggetto.key] = oggetto;
        delete this.inventario[oggetto.key];
        this.refreshOggettiInStanza();
    }

    async _prendi(oggetto) {
        if (this.stanzaCorrente.objects[oggetto.key] !== undefined) {
            this._aggiungiInInventario(oggetto);
            this.print(this.Thesaurus.defaultMessages.FATTO);
        } else if (this.inventario[oggetto.key] !== undefined) {
            this.print(this._getI18n().IFEngine.messages.alreadyHaveIt);
        } else {
            this.print(this.Thesaurus.verbs.prendi.defaultMessage);
        }
    }

    // ============== Game State ==============

    scopri(oggetto) {
        oggetto.visibile = true;
        this.refreshOggettiInStanza();
    }

    abilitaDirezione(direzione, stanza) {
        if (stanza === undefined) stanza = this.stanzaCorrente;
        delete stanza.unavaiableDirections[stanza.unavaiableDirections.indexOf(direzione)];
    }

    disabilitaDirezione(direzione, stanza) {
        if (stanza === undefined) stanza = this.stanzaCorrente;
        if (stanza.unavaiableDirections === undefined)
            stanza.unavaiableDirections = [];
        if (stanza.unavaiableDirections.indexOf(direzione) < 0)
            stanza.unavaiableDirections.push(direzione);
    }

    async runSequence(labelSequenza, args) {
        let sequence = this.datiAvventura.sequenze[labelSequenza];
        if (sequence) {
            return await sequence.call(this, args);
        }
    }

    // ============== Points ==============

    async _punti() {
        if (this.datiPunti === undefined || this.datiPunti.puntiAzione === undefined) {
            this.print(this._getI18n().IFEngine.messages.noPoints);
        } else {
            this.print(this._getI18n().IFEngine.messages.points(this.altriDati.punti, this.datiPunti.puntiMax) + ".");
        }
        return true;
    }

    async aggiungiPunti(action) {
        if (this.datiPunti === undefined || this.datiPunti.puntiAzione === undefined)
            return 0;
        let puntiAzione = this.datiPunti.puntiAzione;
        if (this.altriDati.puntiAzioneGiocati == undefined)
            this.altriDati.puntiAzioneGiocati = [];
        if (this.altriDati.puntiAzioneGiocati.indexOf(action) == -1) {
            this.altriDati.puntiAzioneGiocati.push(action);
            this.altriDati.punti += puntiAzione[action].i;
        }
    }

    // ============== Death ==============

    async die() {
        this.print(this._getI18n().IFEngine.messages.death);
        this.playerDied = true;
        this.gameOver = true;
        return false;
    }

    // ============== Timed Events ==============

    startTimedEvent(eventLabel) {
        if (this.timedEvents.indexOf(eventLabel) < 0)
            this.timedEvents.push(eventLabel);
    }

    stopTimedEvent(eventLabel, resetIndex) {
        if (resetIndex === undefined)
            resetIndex = true;

        let timedEvent = this.datiAvventura.timedEvents[eventLabel];

        if (timedEvent !== undefined) {
            if (resetIndex)
                timedEvent.currentStep = timedEvent.start;
            this.timedEvents = this.timedEvents.filter(e => e != eventLabel);
        }
    }

    async _processTimedEvents() {
        for (let i in this.timedEvents) {
            let timedEvent = this.datiAvventura.timedEvents[this.timedEvents[i]];
            if (timedEvent !== undefined) {
                var limit = 0;

                if (timedEvent.currentStep === undefined)
                    timedEvent.currentStep = timedEvent.start;

                if (timedEvent.currentStep <= limit) {
                    this.stopTimedEvent(this.timedEvents[i]);
                    let goOn = await timedEvent.onLimit.call(this);
                    if (goOn) break;
                    return;
                }

                if (timedEvent.steps && timedEvent.steps[timedEvent.currentStep] !== undefined)
                    await timedEvent.steps[timedEvent.currentStep].call(this);

                timedEvent.currentStep--;
            }
        }
    }

    // ============== Yes/No Questions ==============
    
    /**
     * Handle yes/no questions in API context
     * Since we can't block for user input, we have two modes:
     * 1. First call: store the question and throw PENDING_QUESTION error
     * 2. Second call (with answer): return the stored answer immediately
     */
    async yesNoQuestion(question, cr) {
        // Check if we already have an answer from a previous API call
        if (this.pendingQuestion && this.pendingQuestion.answer !== undefined) {
            const answer = this.pendingQuestion.answer;
            this.pendingQuestion = null; // Clear after using
            return answer;
        }
        
        // Print the question
        this.print(question + " (" + this._getI18n().IFEngine.yesOrNo.yes + "/" + this._getI18n().IFEngine.yesOrNo.no + ") ");
        
        // Store that we're waiting for a yes/no answer, along with the original input
        this.pendingQuestion = {
            type: 'yesno',
            question: question,
            originalInput: this._currentInput // Will be set by processInput
        };
        
        // Throw a special error to halt execution and return to client
        // This will be caught by the API layer
        const error = new Error('PENDING_QUESTION');
        error.isPendingQuestion = true;
        throw error;
    }
    
    /**
     * Parse a yes/no input and return true/false/null
     */
    parseYesNoInput(input) {
        const normalizedInput = input.toLowerCase().trim();
        
        if (normalizedInput === 's' || normalizedInput === 'si' || normalizedInput === 'sì' || 
            normalizedInput === this._getI18n().IFEngine.yesOrNo.yes.toLowerCase()) {
            return true;
        } else if (normalizedInput === 'n' || normalizedInput === 'no' ||
            normalizedInput === this._getI18n().IFEngine.yesOrNo.no.toLowerCase()) {
            return false;
        }
        
        return null; // Invalid input
    }
    
    /**
     * Set the answer for a pending question (called by API when answer received)
     */
    setQuestionAnswer(answer) {
        if (this.pendingQuestion) {
            this.pendingQuestion.answer = answer;
        }
    }
    
    /**
     * Check if there's a pending question waiting for an answer
     */
    hasPendingQuestion() {
        return this.pendingQuestion && this.pendingQuestion.answer === undefined;
    }
    
    /**
     * Get the original input that triggered the pending question
     */
    getPendingOriginalInput() {
        return this.pendingQuestion?.originalInput;
    }
    
    /**
     * Clear pending question without answering
     */
    clearPendingQuestion() {
        this.pendingQuestion = null;
    }

    // ============== Save/Load ==============

    /**
     * Get state To Be Saved - only mutable state, NOT functions
     * Functions are loaded once from game_data.json and should not be serialized
     */
    _getTbs() {
        // Extract only mutable parts of datiAvventura (same approach as saveEngineState)
        const mutableDatiAvventura = {
            objects: {},
            stanze: {},
            timedEvents: {}
        };
        
        // Save object positions, statuses, visibility
        for (let objKey in this.datiAvventura.objects) {
            const obj = this.datiAvventura.objects[objKey];
            if (obj) {
                mutableDatiAvventura.objects[objKey] = {
                    posizione: obj.posizione,
                    status: obj.status,
                    visibile: obj.visibile
                };
            }
        }
        
        // Save room visit flags and any mutable room state
        for (let roomKey in this.datiAvventura.stanze) {
            const room = this.datiAvventura.stanze[roomKey];
            if (room) {
                mutableDatiAvventura.stanze[roomKey] = {
                    primaEntrata: room.primaEntrata,
                    uscito: room.uscito  // For trap room
                };
                // Save interactor states (like portone.status, fantasma.neutralizzato)
                if (room.interactors) {
                    mutableDatiAvventura.stanze[roomKey].interactors = {};
                    for (let intKey in room.interactors) {
                        const int = room.interactors[intKey];
                        if (int && typeof int === 'object') {
                            mutableDatiAvventura.stanze[roomKey].interactors[intKey] = {
                                status: int.status,
                                visibile: int.visibile,
                                neutralizzato: int.neutralizzato,
                                aperto: int.aperto
                            };
                        }
                    }
                }
            }
        }
        
        // Save timed event current steps
        for (let eventKey in this.datiAvventura.timedEvents) {
            const event = this.datiAvventura.timedEvents[eventKey];
            if (event) {
                mutableDatiAvventura.timedEvents[eventKey] = {
                    currentStep: event.currentStep
                };
            }
        }
        
        return {
            stanzaCorrente: this.stanzaCorrente == null ?
                this.datiAvventura.stanzaIniziale :
                this.stanzaCorrente.key,
            timedEvents: this.timedEvents,
            mutableDatiAvventura: mutableDatiAvventura,
            inventario: this.inventario,
            altriDati: this.altriDati
        };
    }

    /**
     * Reload saved game state - restores only mutable state
     * Functions remain from the original game_data.json load
     */
    reload(stored) {
        let tbr = typeof stored === 'string' ? JSON.parse(stored) : stored;

        if (tbr.stanzaCorrente === undefined)
            tbr.stanzaCorrente = this.datiAvventura.stanzaIniziale;

        // Restore inventory
        this.inventario = tbr.inventario || {};
        
        // Restore altriDati (punti, mosse, iotaid, etc.)
        this.altriDati = tbr.altriDati || JSON.parse(JSON.stringify(this.datiIniziali?.altriDati || {}));
        
        // Restore active timed events list
        this.timedEvents = tbr.timedEvents || [];
        
        // Restore mutable datiAvventura parts (without overwriting functions)
        const mutableData = tbr.mutableDatiAvventura || tbr.datiAvventura;
        if (mutableData) {
            // Restore object states
            if (mutableData.objects) {
                for (let objKey in mutableData.objects) {
                    if (this.datiAvventura.objects[objKey]) {
                        const saved = mutableData.objects[objKey];
                        if (saved.posizione !== undefined) this.datiAvventura.objects[objKey].posizione = saved.posizione;
                        if (saved.status !== undefined) this.datiAvventura.objects[objKey].status = saved.status;
                        if (saved.visibile !== undefined) this.datiAvventura.objects[objKey].visibile = saved.visibile;
                    }
                }
            }
            
            // Restore room states
            if (mutableData.stanze) {
                for (let roomKey in mutableData.stanze) {
                    if (this.datiAvventura.stanze[roomKey]) {
                        const saved = mutableData.stanze[roomKey];
                        if (saved.primaEntrata !== undefined) this.datiAvventura.stanze[roomKey].primaEntrata = saved.primaEntrata;
                        if (saved.uscito !== undefined) this.datiAvventura.stanze[roomKey].uscito = saved.uscito;
                        
                        // Restore interactor states
                        if (saved.interactors && this.datiAvventura.stanze[roomKey].interactors) {
                            for (let intKey in saved.interactors) {
                                if (this.datiAvventura.stanze[roomKey].interactors[intKey]) {
                                    const savedInt = saved.interactors[intKey];
                                    const targetInt = this.datiAvventura.stanze[roomKey].interactors[intKey];
                                    if (savedInt.status !== undefined) targetInt.status = savedInt.status;
                                    if (savedInt.visibile !== undefined) targetInt.visibile = savedInt.visibile;
                                    if (savedInt.neutralizzato !== undefined) targetInt.neutralizzato = savedInt.neutralizzato;
                                    if (savedInt.aperto !== undefined) targetInt.aperto = savedInt.aperto;
                                }
                            }
                        }
                    }
                }
            }
            
            // Restore timed event steps
            if (mutableData.timedEvents) {
                for (let eventKey in mutableData.timedEvents) {
                    if (this.datiAvventura.timedEvents[eventKey]) {
                        const saved = mutableData.timedEvents[eventKey];
                        if (saved.currentStep !== undefined) this.datiAvventura.timedEvents[eventKey].currentStep = saved.currentStep;
                    }
                }
            }
        }

        return tbr;
    }

    // ============== Instructions ==============

    async istruzioni() {
        for (let instruction of this._getI18n().AvventuraNelCastelloJSEngine.instructions) {
            this.print(instruction);
        }
    }

    // ============== Utilities ==============

    _filter(callback, jsonObj) {
        let filtered = {};
        for (let k in jsonObj) {
            if (callback(jsonObj[k]) == false)
                continue;
            filtered[k] = jsonObj[k];
        }
        return filtered;
    }

    _get(needle, jsonObjList) {
        if (!jsonObjList) return false;
        
        for (let k in jsonObjList) {
            let jsonObj = jsonObjList[k];
            
            // Skip null or undefined entries
            if (jsonObj === null || jsonObj === undefined) {
                continue;
            }
            
            let res = this._match(needle, jsonObj, k);

            if (!res) {
                if (jsonObj.linkedObjects) {
                    for (let j in jsonObj.linkedObjects) {
                        let linkedKey = jsonObj.linkedObjects[j];
                        let linked = this.Parser._getSource(linkedKey, this.datiAvventura.objects);
                        if (linked) {
                            if (this._match(needle, linked, linkedKey))
                                return linked;
                        }
                    }
                }
                continue;
            } else {
                jsonObj.key = k;
                return jsonObj;
            }
        }
        return false;
    }

    _match(needle, obj, key) {
        // Handle null or undefined objects
        if (obj === null || obj === undefined) {
            return false;
        }
        
        let pattern;

        // Check for i18n pattern override (enables multilingual object/interactor matching)
        if (key) {
            const i18nPatterns = this._getI18n()?.AvventuraNelCastelloJS?.i18nPatterns;
            if (i18nPatterns && i18nPatterns[key]) {
                pattern = i18nPatterns[key];
            }
        }

        if (!pattern) {
            if (obj.pattern === undefined) {
                if (obj.label === undefined)
                    return false;
                pattern = this._simplePattern(obj.label);
            } else {
                pattern = obj.pattern;
            }
        }

        let regExp = new RegExp("^(?:" + pattern + ")$", "i");
        let res = needle.match(regExp);
        return res;
    }

    _simplePattern(string) {
        if (Array.isArray(string)) {
            string = string[0];
        }
        let chunks = string.split(/\s+/);
        chunks[0] = "(" + chunks[0] + "\\s+)?";
        return chunks[0] + chunks.slice(1).join("\\s+");
    }
}

module.exports = IFEngineServer;
