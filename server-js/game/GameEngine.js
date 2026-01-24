/**
 * GameEngine - Avventura nel Castello specific game engine
 * Adapted from source_app/AvventuraNelCastelloJSEngine.js for server-side use
 */

const IFEngineServer = require('./IFEngineServer');
const i18n = require('./i18n');
const { loadAllGameData } = require('./GameDataLoader');
const fs = require('fs');
const path = require('path');

class GameEngine extends IFEngineServer {
    constructor() {
        super();

        // Override save key
        this.SAVED = "AvventuraNelCastello";

        // Override additional data
        this.altriDati = {
            mosse: 0,
            punti: 0,
            bigmeow: {
                attivo: false,
            },
            iotaid: {
                iota: false,
                id: false,
                pronunciato: false
            },
            pensa: 0,
            golaSecca: true
        };

        this.pesoMassimoInventario = 4;
        
        // Flag for "not understood" response - changes prompt to "Eh?"
        this.nonhocapito = 0;
        
        // Default prompt text
        this.defaultInputOverride = i18n.AvventuraNelCastelloJSEngine.defaultInput;

        // Points configuration
        this.datiPunti = {
            puntiMax: 1000,
            puntiLevel: {
                34: i18n.AvventuraNelCastelloJSEngine.pointsLabel[0],
                58: i18n.AvventuraNelCastelloJSEngine.pointsLabel[1],
                149: i18n.AvventuraNelCastelloJSEngine.pointsLabel[2],
                299: i18n.AvventuraNelCastelloJSEngine.pointsLabel[3],
                449: i18n.AvventuraNelCastelloJSEngine.pointsLabel[4],
                649: i18n.AvventuraNelCastelloJSEngine.pointsLabel[5],
                898: i18n.AvventuraNelCastelloJSEngine.pointsLabel[6],
                948: i18n.AvventuraNelCastelloJSEngine.pointsLabel[8],
                998: i18n.AvventuraNelCastelloJSEngine.pointsLabel[9],
                999: i18n.AvventuraNelCastelloJSEngine.pointsLabel[10]
            },
            puntiAzione: { 
                paracaduteIndossato: { i: 15 },
                saltoAereo: { i: 20 },
                apertoPortone: { i: 6 },
                entrato: { i: 18 },
                cadutoInSegreta: { i: 17 },
                apertaFessura: { i: 35 },
                uscitoDaSegreta: { i: 15 },
                apertoVolume: { i: 35 },
                lettoBigMeow: { i: 28 },
                scesoInSotterranei: { i: 33 },
                eliminatoOrco: { i: 50 },
                vistoSortilegio: { i: 40 },
                eliminatoFantasma: { i: 50 },
                apertoForziere: { i: 15 },
                trovatoCorno: { i: 12 },
                salutatoNano: { i: 50 },
                presoDiamante: { i: 5 },
                lettoId: { i: 23 },
                apertoLibro: { i: 10 },
                lettoIota: { i: 18 },
                pronunciatoIotaid: { i: 25 },
                entratoSalaTrono: { i: 25 },
                trovatoAstuccio: { i: 15 },
                trovataPergamena: { i: 20 },
                scopertoDizionario: { i: 25 },
                tradottaPergamena: { i: 53 },
                entratoLabirinto: { i: 31 },
                risoltoLabirinto: { i: 75 },
                trovataChiave: { i: 50 },
                caricatoOrologio: { i: 30 },
                suonaMezzanotte: { i: 50 },
                salitoTorre: { i: 5 },
                presoDaAquila: { i: 50 }
            }
        };

        // Common patterns
        this.commonPatterns = {
            pronuncia: i18n.AvventuraNelCastelloJSEngine.commonPatterns.say,
            muro: i18n.AvventuraNelCastelloJSEngine.commonPatterns.wall
        };

        // Add default messages
        this.Thesaurus.defaultMessages = {
            ...this.Thesaurus.defaultMessages,
            ...{
                SII_SERIO: i18n.AvventuraNelCastelloJSEngine.defaultMessages.beSerious,
                NON_SERVE_A_NIENTE: i18n.AvventuraNelCastelloJSEngine.defaultMessages.notUseful,
                CE_LHAI_GIA: i18n.AvventuraNelCastelloJSEngine.defaultMessages.alreadyHaveIt,
                NON_HO_CAPITO: i18n.AvventuraNelCastelloJSEngine.defaultMessages.didNotUnderstand,
                ANCORA: i18n.AvventuraNelCastelloJSEngine.defaultMessages.again,
                NON_CONOSCI: i18n.AvventuraNelCastelloJSEngine.defaultMessages.youDontKnow,
                GIA_APERTO: i18n.AvventuraNelCastelloJSEngine.defaultMessages.isOpened,
                GIA_ADDOSSO: i18n.AvventuraNelCastelloJSEngine.defaultMessages.wearing,
                E_CHIUSO: i18n.AvventuraNelCastelloJSEngine.defaultMessages.isClosed,
                NON_TROVATO: i18n.AvventuraNelCastelloJSEngine.defaultMessages.notFound,
            }
        };

        // Refresh verbs with new dictionary
        this.Thesaurus.loadVerbs();

        // Override some verb patterns
        this.Thesaurus.verbs.guarda.pattern = i18n.AvventuraNelCastelloJSEngine.verbs.look.pattern;
        this.Thesaurus.verbs.lascia.pattern = i18n.AvventuraNelCastelloJSEngine.verbs.drop.pattern;
        this.Thesaurus.verbs.premi.pattern = i18n.AvventuraNelCastelloJSEngine.verbs.press.pattern;

        // Remove "dai a" verb
        delete this.Thesaurus.verbs.dai;

        // Add additional verbs and commands
        this._setupAdditionalVerbs();
        this._setupAdditionalCommands();

        // Load game data and i18n data
        this._loadGameData();
    }

    _setupAdditionalVerbs() {
        const self = this;
        
        this.Thesaurus.verbs = {
            ...this.Thesaurus.verbs,
            ...{
                spingi: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.push.pattern,
                    defaultMessage: this.Thesaurus.defaultMessages.NON_SERVE_A_NIENTE,
                    callback: async function(targets) {
                        let target = targets[0];
                        if (self.Parser._getSource("spingi", target.on))
                            return null;
                        if (self.inventario[target.key])
                            return i18n.AvventuraNelCastelloJSEngine.defaultMessages.inYourHand;
                        if (target.peso !== undefined) {
                            switch (target.peso) {
                                case -1:
                                    return self.Thesaurus.defaultMessages.SII_SERIO;
                                case 99:
                                    return self.Thesaurus.verbs.spingi.defaultMessage;
                            }
                        }
                        return null;
                    }
                },
                offri: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.offer.pattern,
                    defaultMessage: this.Thesaurus.defaultMessages.SII_SERIO
                },
                aggiusta: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.repair.pattern,
                    defaultMessage: this.Thesaurus.defaultMessages.NON_HO_CAPITO
                },
                traduci: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.translate.pattern,
                    inventario: true,
                    defaultMessage: this.Thesaurus.defaultMessages.NON_HO_CAPITO
                },
                suona: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.play.pattern,
                    inventario: true,
                    defaultMessage: this.Thesaurus.defaultMessages.SII_SERIO
                },
                entra: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.enter.pattern,
                    singolo: true,
                    defaultMessage: i18n.AvventuraNelCastelloJSEngine.verbs.enter.defaultMessage
                },
                indossa: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.wear.pattern,
                    defaultMessage: this.Thesaurus.defaultMessages.SII_SERIO
                },
                alza: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.liftUp.pattern,
                    defaultMessage: i18n.AvventuraNelCastelloJSEngine.verbs.liftUp.defaultMessage
                },
                abbassa: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.lower.pattern,
                    defaultMessage: i18n.AvventuraNelCastelloJSEngine.verbs.lower.defaultMessage
                },
                prendi: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.take.pattern,
                    defaultMessage: this.Thesaurus.defaultMessages.SII_SERIO,
                    callback: async function(targets) {
                        let target = targets[0];
                        if (self.Parser._getSource("prendi", target.on))
                            return null;
                        if (self.inventario[target.key])
                            return target.key == "paracadute" ? 
                                i18n.AvventuraNelCastelloJSEngine.defaultMessages.wearing : 
                                i18n.AvventuraNelCastelloJSEngine.defaultMessages.inYourHand;
                        if (target.peso !== undefined) {
                            switch (target.peso) {
                                case -1:
                                    return self.Thesaurus.defaultMessages.SII_SERIO;
                                case 99:
                                    return self.Thesaurus.defaultMessages.NON_E_POSSIBILE;
                            }
                        }
                        return null;
                    }
                },
                leggi: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.read.pattern,
                    defaultMessage: this.Thesaurus.defaultMessages.NON_HO_CAPITO
                },
                infilaIn: {
                    inventario: true,
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.insertInto.pattern,
                    complex: true,
                    defaultMessage: this.Thesaurus.defaultMessages.SII_SERIO
                },
                infila: {
                    inventario: true,
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.insert.pattern,
                    defaultMessage: this.Thesaurus.defaultMessages.SII_SERIO
                },
                prega: {
                    singolo: true,
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.pray.pattern,
                    defaultMessage: i18n.AvventuraNelCastelloJSEngine.verbs.pray.defaultMessage
                },
                atterra: {
                    singolo: true,
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.land.pattern,
                    defaultMessage: i18n.AvventuraNelCastelloJSEngine.verbs.land.defaultMessage
                },
                salta: {
                    singolo: true,
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.jump.pattern,
                    defaultMessage: i18n.AvventuraNelCastelloJSEngine.verbs.jump.defaultMessage
                },
                siedi: {
                    singolo: true,
                    complex: true,
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.sitDown.pattern,
                    defaultMessage: i18n.AvventuraNelCastelloJSEngine.verbs.sitDown.defaultMessage
                },
                saluta: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.greet.pattern,
                    defaultMessage: i18n.AvventuraNelCastelloJSEngine.verbs.greet.defaultMessage
                },
                scava: {
                    singolo: true,
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.dig.pattern,
                    defaultMessage: i18n.AvventuraNelCastelloJSEngine.verbs.dig.defaultMessage
                },
                mangia: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.eat.pattern,
                    defaultMessage: i18n.AvventuraNelCastelloJSEngine.verbs.eat.defaultMessage
                },
                bussa: {
                    singolo: true,
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.knock.pattern,
                    defaultMessage: i18n.AvventuraNelCastelloJSEngine.verbs.knock.defaultMessage
                },
                grazie: {
                    singolo: true,
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.thank.pattern,
                    defaultMessage: i18n.AvventuraNelCastelloJSEngine.verbs.thank.defaultMessage
                },
                aspetta: {
                    singolo: true,
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.wait.pattern,
                    defaultMessage: i18n.AvventuraNelCastelloJSEngine.verbs.wait.defaultMessage
                },
                parla: {
                    singolo: true,
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.talk.pattern,
                    defaultMessage: i18n.AvventuraNelCastelloJSEngine.verbs.talk.defaultMessage
                },
                ascolta: {
                    singolo: true,
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.listen.pattern,
                    defaultMessage: i18n.AvventuraNelCastelloJSEngine.verbs.listen.defaultMessage
                },
                compra: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.buy.pattern,
                    defaultMessage: i18n.AvventuraNelCastelloJSEngine.verbs.buy.defaultMessage
                },
                rompi: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.break.pattern,
                    defaultMessage: this.Thesaurus.defaultMessages.SII_SERIO
                },
                bevi: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.drink.pattern,
                    defaultMessage: this.Thesaurus.defaultMessages.SII_SERIO
                },
                carica: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.wind.pattern,
                    defaultMessage: this.Thesaurus.defaultMessages.SII_SERIO
                },
                uccidi: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.kill.pattern,
                    defaultMessage: this.Thesaurus.defaultMessages.SII_SERIO
                },
                nutri: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.feed.pattern,
                    defaultMessage: this.Thesaurus.defaultMessages.SII_SERIO
                },
                accarezza: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.pet.pattern,
                    defaultMessage: this.Thesaurus.defaultMessages.SII_SERIO
                },
                monta: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.mount.pattern,
                    defaultMessage: this.Thesaurus.defaultMessages.SII_SERIO
                },
                chiediA: {
                    complex: true,
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.askTo.pattern,
                    defaultMessage: i18n.AvventuraNelCastelloJSEngine.verbs.askTo.defaultMessage
                },
                chiedi: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.ask.pattern,
                    defaultMessage: i18n.AvventuraNelCastelloJSEngine.verbs.ask.defaultMessage
                },
                svita: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.skrewOff.pattern,
                    defaultMessage: this.Thesaurus.defaultMessages.SII_SERIO
                },
                ciao: {
                    singolo: true,
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.hello.pattern,
                    defaultMessage: this.Thesaurus.defaultMessages.NON_HO_CAPITO
                },
                buongiorno: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.verbs.greeting.pattern,
                    defaultMessage: this.Thesaurus.defaultMessages.NON_HO_CAPITO
                },
                // Special verb for "cerca" (search)
                cerca: {
                    pattern: i18n.Thesaurus.verbs.lookFor.pattern,
                    defaultMessage: this.Thesaurus.defaultMessages.NON_TROVATO
                }
            }
        };
    }

    _setupAdditionalCommands() {
        const self = this;
        
        this.Thesaurus.commands = {
            ...this.Thesaurus.commands,
            ...{
                dove: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.commands.where.pattern,
                    callback: async function() {
                        await self.descriviStanzaCorrente(true);
                        return true;
                    }
                },
                punti: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.commands.points.pattern,
                    callback: async function() {
                        await self._punti();
                        return true;
                    }
                },
                istruzioni: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.commands.instructions.pattern,
                    callback: async function() {
                        await self.istruzioni();
                        return true;
                    }
                },
                basta: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.commands.stop.pattern,
                    callback: async function() {
                        self.print(i18n.AvventuraNelCastelloJSEngine.commands.stop.defaultMessage);
                        await self._punti();
                        self.gameOver = true;
                        return { gameOver: true };
                    }
                },
                inventario: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.commands.inventory.pattern,
                    callback: async function() {
                        await self._inventario();
                        return true;
                    }
                },
                salva: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.commands.save.pattern,
                    callback: async function() {
                        return { needsSave: true };
                    }
                },
                carica: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.commands.load.pattern,
                    callback: async function() {
                        return { needsLoad: true };
                    }
                },
                aiuto: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.commands.help.pattern,
                    callback: i18n.AvventuraNelCastelloJSEngine.commands.help.defaultMessage
                },
                turni: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.commands.moves.pattern,
                    callback: async function() {
                        return i18n.AvventuraNelCastelloJSEngine.commands.moves.defaultMessage(self.altriDati.mosse);
                    }
                },
                muori: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.commands.die.pattern,
                    callback: async function() {
                        self.print(i18n.AvventuraNelCastelloJSEngine.commands.die.defaultMessage);
                        await self.die();
                        return false;
                    }
                },
                pensa: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.commands.think.pattern,
                    callback: i18n.AvventuraNelCastelloJSEngine.commands.think.defaultMessage
                },
                esci: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.commands.getOut.pattern,
                    callback: i18n.AvventuraNelCastelloJSEngine.commands.getOut.defaultMessage
                },
                dormi: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.commands.sleep.pattern,
                    callback: async function() {
                        self.print(i18n.AvventuraNelCastelloJSEngine.commands.sleep.defaultMessage);
                        return true;
                    }
                },
                abracadabra: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.commands.abracadabra.pattern,
                    callback: i18n.AvventuraNelCastelloJSEngine.commands.abracadabra.defaultMessage
                },
                si: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.commands.yes.pattern,
                    callback: i18n.AvventuraNelCastelloJSEngine.commands.yes.defaultMessage
                },
                no: {
                    pattern: i18n.AvventuraNelCastelloJSEngine.commands.no.pattern,
                    callback: i18n.AvventuraNelCastelloJSEngine.commands.no.defaultMessage
                }
            }
        };
    }

    _loadGameData() {
        try {
            const { gameData, i18nData } = loadAllGameData();
            
            // Store i18n data for use in sequences and functions
            // The i18nData already has the full structure with AvventuraNelCastelloJS key
            this.i18nJS = i18nData.AvventuraNelCastelloJS || i18nData;
            
            // Make i18n available as a global for function evaluation
            // The functions in game_data.json reference i18n.AvventuraNelCastelloJS.xxx
            global.i18n = i18nData;
            
            // Check if gameData has the datiAvventura structure
            if (gameData.datiAvventura) {
                this.datiAvventura = {
                    stanzaIniziale: gameData.datiAvventura.stanzaIniziale || 'aereo',
                    stanze: gameData.datiAvventura.stanze || {},
                    objects: gameData.datiAvventura.objects || {},
                    sequenze: gameData.datiAvventura.sequenze || {},
                    timedEvents: gameData.datiAvventura.timedEvents || {}
                };
            } else {
                this.datiAvventura = {
                    stanzaIniziale: 'aereo',
                    stanze: gameData.stanze || {},
                    objects: gameData.objects || {},
                    sequenze: gameData.sequenze || {},
                    timedEvents: gameData.timedEvents || {}
                };
            }
            
            // Store common interactors for reference
            this.commonInteractors = gameData.commonInteractors || {};
            
            // Setup CRT compatibility for game data functions
            this._setupCRTCompatibility();
            
            console.log('Game data loaded. Initial room:', this.datiAvventura.stanzaIniziale);
            console.log('Available rooms:', Object.keys(this.datiAvventura.stanze).length);
            
        } catch (err) {
            console.error('Error loading game data:', err);
            this.datiAvventura = {
                stanzaIniziale: 'aereo',
                stanze: {},
                objects: {},
                sequenze: {},
                timedEvents: {}
            };
            this.commonInteractors = {};
            this.i18nJS = {};
        }
    }
    
    /**
     * Setup CRT compatibility - create stub methods that the game functions expect
     */
    _setupCRTCompatibility() {
        const self = this;
        this.CRT = {
            printTyping: function(text, options) {
                self.print(text, options);
                return Promise.resolve();
            },
            println: function(text, options) {
                self.print(text, options);
                return Promise.resolve();
            },
            print: function(text, options) {
                if (options && options.nlBefore) {
                    for (let i = 0; i < options.nlBefore; i++) self.outputBuffer.push('');
                }
                if (text) self.outputBuffer.push(String(text));
                if (options && options.nlAfter) {
                    for (let i = 0; i < options.nlAfter; i++) self.outputBuffer.push('');
                }
                return Promise.resolve();
            },
            sleep: function(ms) {
                return Promise.resolve();
            },
            wait: function() {
                return Promise.resolve();
            },
            clear: function() {
                return Promise.resolve();
            }
        };
        
        // Sound stub methods (no-op in server environment)
        this.Sound = {
            playTone: function() { return Promise.resolve(); }
        };
        
        // Sound effect method stubs
        this.s0 = async function(times) { return Promise.resolve(); };
        this.s1 = async function() { return Promise.resolve(); };
        this.s2 = async function() { return Promise.resolve(); };
        this.s3 = async function() { return Promise.resolve(); };
        this.s4 = async function() { return Promise.resolve(); };
        
        // Input stub (server doesn't have interactive input during sequences)
        this.fakeInput = async function() { return Promise.resolve(); };
    }

    /**
     * Start a new game with prologue and intro sequences
     */
    async startNewGame() {
        this.clearOutput();
        
        // Reset state
        await this.restart();
        
        // Run prologue sequence
        await this._runPrologueSequence();
        
        // Enter the initial room (airplane)
        await this.entra(this.datiAvventura.stanzaIniziale);
        
        // Add prompt
        this._addPrompt();
        
        return this.getOutput();
    }
    
    /**
     * Run the prologue sequence
     */
    async _runPrologueSequence() {
        const sequences = this.i18nJS?.sequences || {};
        
        // Prologue
        if (sequences.prologue) {
            this.print(' PROLOGO: ');
            for (const line of sequences.prologue.slice(1)) {
                this.print(line);
            }
            this.print('');
        }
        
        // Intro
        if (sequences.intro) {
            this.print(' * AVVENTURA NEL CASTELLO! * ');
            for (const line of sequences.intro.slice(1)) {
                this.print(line);
            }
            this.print('');
        }
        
        // Start the airplane timed event
        this.startTimedEvent('aereo');
    }

    /**
     * Enter a room - override to run onEnter sequence
     */
    async entra(labelStanza) {
        if (await this._breakRoomAction("onExit"))
            return false;

        this.stanzaCorrente = this.datiAvventura.stanze[labelStanza];
        
        if (!this.stanzaCorrente) {
            console.error('Room not found:', labelStanza);
            return false;
        }
        
        this.Parser.setOverride(this.stanzaCorrente.override);

        // Run onEnter but don't run intro sequence again (we handle it in startNewGame)
        // Only run other onEnter actions
        if (this.stanzaCorrente.onEnter && labelStanza !== 'aereo') {
            try {
                await this.stanzaCorrente.onEnter.call(this);
            } catch (err) {
                console.error('Error in onEnter:', err);
            }
        }

        if (this.stanzaCorrente.label !== undefined) {
            this.print(this.stanzaCorrente.label.toUpperCase());
        }
        
        this.refreshOggettiInStanza();
        await this.descriviStanzaCorrente();
        return true;
    }

    /**
     * Override describe room to handle extended vs short descriptions
     */
    async descriviStanzaCorrente(descrizioneLunga) {
        if (!this.stanzaCorrente) return;
        
        if (this.stanzaCorrente.interactors === undefined)
            this.stanzaCorrente.interactors = {};

        // Add common walls interactor if not present
        if (this.stanzaCorrente.interactors.pareti === undefined && this.commonInteractors.pareti) {
            this.stanzaCorrente.interactors.pareti = { ...this.commonInteractors.pareti };
        }

        let description;
        // First time entering room or explicitly asked for long description -> extended
        if (this.stanzaCorrente.primaEntrata === undefined || descrizioneLunga) {
            this.stanzaCorrente.primaEntrata = true;
            description = this._descrizione(this.stanzaCorrente.description);
        } else {
            // Already visited -> short description
            description = this._descrizione(this.stanzaCorrente.shortDescription || this.stanzaCorrente.description);
        }

        this.print(description);
        await this.elenca(this.stanzaCorrente.interactors);
        await this.elenca(this.stanzaCorrente.objects);
    }

    /**
     * Process input and add prompt
     */
    async processInput(input) {
        this.clearOutput();
        this.nonhocapito = 0;
        
        if (!input || input.trim().length === 0) {
            this.print(i18n.AvventuraNelCastelloJSEngine.messages.somethingSensible);
            this._addPrompt();
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

        // Add prompt at end of response (unless game over)
        if (!this.gameOver && !this.playerDied) {
            this._addPrompt();
        }

        return this._buildResult(result);
    }

    /**
     * Add prompt to output
     */
    _addPrompt() {
        if (this.nonhocapito) {
            this.print('');
            this.print(i18n.AvventuraNelCastelloJSEngine.messages.huh);
        } else {
            this.print('');
            this.print(this.defaultInputOverride);
        }
    }

    /**
     * Override inputNotUnderstood to set flag
     */
    inputNotUnderstood(input) {
        this.nonhocapito = 1;
        this.print(this.Thesaurus.defaultMessages.NON_HO_CAPITO);
        return true;
    }

    /**
     * Override wtf for unknown words
     */
    async wtf(APO, wtf) {
        // Check if it's a known interactor or object
        let interattore = this._getInterattore(wtf);
        let oggetto = this._get(wtf, this.datiAvventura.objects);
        
        let s = interattore ? interattore : (oggetto ? oggetto : false);

        if (s) {
            let label = s.dlabel ? s.dlabel : (Array.isArray(s.label) ? s.label[0] : s.label);
            let msg;
            
            if (APO.verb == "cerca") {
                msg = this.Thesaurus.verbs.cerca.defaultMessage;
            } else if (APO.actionObject.inventario === undefined) {
                msg = (s == interattore && s.peso === undefined) || s.label === undefined ? 
                    this.Thesaurus.defaultMessages.QUI_NON_NE_VEDO : 
                    i18n.AvventuraNelCastelloJSEngine.prefixLabels.cantSeeHere + " " + label + ".";
            } else {
                msg = (s == interattore && s.peso === undefined) || s.label === undefined ? 
                    this.Thesaurus.defaultMessages.NON_NE_POSSIEDI : 
                    i18n.AvventuraNelCastelloJSEngine.prefixLabels.youDontOwn + " " + label + ".";
            }
            
            this.print(msg);
        } else {
            if (wtf.indexOf(" ") >= 0)
                wtf = wtf.substring(0, wtf.indexOf(" "));
            this.print("   " + wtf.toUpperCase() + " " + i18n.IFEngine.questionMark + i18n.IFEngine.questionMark + i18n.IFEngine.questionMark);
        }
        return true;
    }

    /**
     * Get interactor from any room
     */
    _getInterattore(key) {
        let stanze = this.datiAvventura.stanze;
        for (let i in stanze) {
            if (stanze[i].interactors !== undefined) {
                let int = this._get(key, stanze[i].interactors);
                if (int)
                    return int;
            }
        }
        return false;
    }

    /**
     * Process timed events - properly execute step callbacks
     */
    async _processTimedEvents() {
        for (let i in this.timedEvents) {
            let eventLabel = this.timedEvents[i];
            let timedEvent = this.datiAvventura.timedEvents[eventLabel];
            
            if (timedEvent !== undefined) {
                var limit = 0;

                if (timedEvent.currentStep === undefined)
                    timedEvent.currentStep = timedEvent.start;

                // Check if we've reached the limit
                if (timedEvent.currentStep <= limit) {
                    this.stopTimedEvent(eventLabel);
                    if (timedEvent.onLimit) {
                        try {
                            let goOn = await timedEvent.onLimit.call(this);
                            if (goOn) break;
                        } catch (err) {
                            console.error('Error in timed event onLimit:', err);
                        }
                    }
                    return;
                }

                // Execute the current step if it exists
                if (timedEvent.steps && timedEvent.steps[timedEvent.currentStep] !== undefined) {
                    try {
                        await timedEvent.steps[timedEvent.currentStep].call(this);
                    } catch (err) {
                        console.error('Error in timed event step:', err);
                        // Fallback: print the i18n message directly
                        if (eventLabel === 'aereo' && this.i18nJS?.timedEvents?.plane) {
                            const stepIndex = timedEvent.start - timedEvent.currentStep;
                            if (this.i18nJS.timedEvents.plane[stepIndex]) {
                                this.print('');
                                this.print(this.i18nJS.timedEvents.plane[stepIndex]);
                            }
                        }
                    }
                }

                timedEvent.currentStep--;
            }
        }
    }

    // Override prendi to check inventory weight
    async _prendi(oggetto) {
        if (await this.canITakeThat(oggetto))
            return await super._prendi(oggetto);
        return false;
    }

    async canITakeThat(oggetto) {
        if (this.stanzaCorrente.objects[oggetto.key] !== undefined) {
            let peso = 0;
            for (let item in this.inventario) {
                peso += this.inventario[item].peso === undefined ? 1 : this.inventario[item].peso;
            }
            if (peso < this.pesoMassimoInventario) {
                return true;
            }

            this.print(i18n.AvventuraNelCastelloJSEngine.messages.overloaded);
            await this._inventario();
            return false;
        }
        return true;
    }

    // Override points display
    async _punti() {
        let livello;
        for (let p in this.datiPunti.puntiLevel) {
            if (this.altriDati.punti <= p) {
                livello = this.datiPunti.puntiLevel[p];
                break;
            }
        }
        if (!livello) {
            livello = this.datiPunti.puntiLevel[999];
        }
        
        this.print(i18n.AvventuraNelCastelloJSEngine.messages.points(this.altriDati.punti, this.datiPunti.puntiMax));
        this.print('');
        this.print(i18n.AvventuraNelCastelloJSEngine.prefixLabels.title);
        this.print('');
        this.print("   " + livello.toUpperCase() + "   ");

        if (livello == i18n.AvventuraNelCastelloJSEngine.pointsLabel[6]) {
            this.print(i18n.AvventuraNelCastelloJSEngine.pointsLabel[7]);
        }

        return true;
    }

    // Override die
    async die() {
        this.print("           @     ");
        this.print("           @     ");
        this.print("        @@@@@@@  ");
        this.print("           @     ");
        this.print("           @     ");
        this.print("           @     ");
        this.print("       ____#____ ");
        this.print("      /        / ");
        this.print("     /  ~~~~  /  ");
        this.print("    /  ~~~~  /   ");
        this.print("   /  ~~~~  /   ");
        this.print(i18n.AvventuraNelCastelloJSEngine.dieText);
        await this._punti();
        
        this.playerDied = true;
        this.gameOver = true;
        return false;
    }

    // Override prepare input
    _prepare(input) {
        input = input.trim().toLowerCase();
        // Remove accents
        input = input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        for (let step of i18n.AvventuraNelCastelloJSEngine.prepareInputSteps) {
            let pattern = RegExp(step.pattern, "g");
            input = input.replace(pattern, step.replaceWith);
        }

        return input.trim();
    }

    // Instructions
    async istruzioni() {
        for (let instruction of i18n.AvventuraNelCastelloJSEngine.instructions) {
            this.print(instruction);
        }
    }

    // Get menu text for NOT_PLAYING status
    getMenuText() {
        return [
            i18n.IFEngine.menu.choose,
            "(1) " + i18n.IFEngine.menu.new,
            "(2) " + i18n.IFEngine.menu.load,
            "(3) " + i18n.IFEngine.menu.delete,
            "(4) " + i18n.IFEngine.menu.readInstructions,
            "(5) " + i18n.AvventuraNelCastelloJSEngine.menuOption4LabelOverride
        ].join('\n');
    }
}

module.exports = GameEngine;
