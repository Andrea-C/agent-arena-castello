/**
 * Italian localization for Avventura nel Castello
 * Adapted from source_app/it-it.i18n.js for server-side use
 */

const i18n = {
	htmlTitle: `Avventura nel Castello - API Server`,
	title: `   AVVENTURA NEL CASTELLO JS   `,
	IFEngine: {
		warnings: {
			mustBeExtended: `IFEngine deve essere esteso`,
			notLoaded: `Nessuna avventura caricata`,
			noData: `Nessun dato salvato...`,
			notFound: (filename) => `Salvataggio "${filename}" non trovato.`
		},
		menu: {
			choose: `Vuoi:`,
			new: `Iniziare una nuova avventura`,
			load: `Riprendere una situazione salvata`,
			delete: `Cancellare tutti i salvataggi`,
			readInstructions: `Ripassare le istruzioni`,
			quit: `Uscire dal gioco`,
			restart: `Rincominciare dall'inizio`,
			stop: `Smettere di giocare`
		},
		questions: {
			stopQuestion: `Vuoi smettere di giocare`,
			areYouSureQuestion: `Sei sicuro`,
			saveLabel: `Etichetta salvataggio:`,
			restoreLabel: `Etichetta:`,
			what: `che cosa?`
		},
		yesOrNo:{
			yes: `si`,
			no: `no`
		},
		messages: {
			tanksForPlaying: `Grazie per aver giocato. Ciao! :)`,
			saved: `Dati salvati!`,
			loaded: `Dati caricati...`,
			noInstructions: `Nessuna istruzione qui...`,
			death: `SEI MORTO!!!`,
			noPoints: `Quest'avventura non prevede un punteggio`,
			points: (points, maxPoints) => `Hai conquistato ${points} punti su ${maxPoints}`,
			noObjects: `Non hai con te nessun oggetto.`,
			carriedObjectsLabel: `Attualmente possiedi:`,
			alreadyHaveIt: `Ce l'hai già`
		},
		questionMark: `?`
	},
	Thesaurus: {
		defaultMessages: {
			done: `Fatto!`,
			preferNot: `Preferisco di no.`,
			notFound: `Ricerca infruttuosa.`,
			didNotUnderstand: `Non ho capito...`,
			dontNoticeAnythingInParticular: `Non noto nulla di particolare.`,
			notSeenHere: `Qui non ne vedo.`, 
			dontHaveAny: `Non ne possiedi.`, 
			nothingHappens: `Non succede niente.`,
			beMoreSpecific: `Sii più specifico.`,
			notPossible: `Non è possibile.`
		},
		commands: {
			north: {
				pattern: `(vai verso |vai a |vai )?(n(ord)?)`,
				defaultMessage: `A nord non puoi andare.`
			},
			south: {
				pattern: `(vai verso |vai a |vai )?(s(ud|outh)?)`,
				defaultMessage: `A sud non puoi andare.`
			},
			east: {
				pattern: `(vai verso |vai a |vai )?(e(st)?|east)`,
				defaultMessage: `A est non puoi andare.`
			},
			west: {
				pattern: `(vai verso |vai a |vai )?(o(vest)?|w(est)?)`,
				defaultMessage: `Ad ovest non puoi andare.`
			},
			up: {
				pattern: `(sali|(vai verso |vai in |vai )?a(lto)?|u(p)?|su)`,
				defaultMessage: `In alto non puoi andare.`
			},
			down: {
				pattern: `(scendi|(vai verso |vai in |vai )?b(asso)?|d(own)?|giu)`,
				defaultMessage: `In basso non puoi andare.`
			}
		},
		verbs: {
			open: {
				pattern: `apri`,
				defaultMessage: `Non si apre`
			},
			close: {
				pattern: `chiudi`,
				defaultMessage: `Non si chiude`
			},
			pull: {
				pattern: `tira`,
			},
			press: {
				pattern: `premi`
			},
			push: {
				pattern: `spingi`,
				defaultMessage: `Non si muove.`
			},
			take: {
				pattern: `prendi`
			},		
			drop: {
				pattern: `lascia`
			},
			give: {
				pattern: `(dai) (.+) (?:a) (.+)`,
			},
			look: {
				pattern: `(guarda|esamina)`
			},
			useWith: {
				pattern: `(usa) (.+) (?:con) (.+)`,
				defaultMessage: `Non posso usarli insieme.`
			},
			use:{
				pattern: `usa`
			},
			lookFor:{
				pattern: `(cerca|trova)`
			},
			goUp: {
				pattern: `sali`
			}, 
			goDown: {
				pattern: `scendi`
			}
		}
	},
	AvventuraNelCastelloJSEngine: {
		warnings: {
			mustBeExtended: `AvventuraNelCastelloEngine deve essere esteso`
		},
		defaultInput: `Cosa devo fare ?`,
		prefixLabels: {
			ISee: `Vedo`,
			cantSeeHere: `Qui non vedo`,
			youDontOwn: `Non possiedi`,
			title: `Hai il diritto di fregiarti del titolo di:`
		},
		pointsLabel: [
			`Avventuriero dei miei stivali`,
			`Scemo del villaggio`,
			`Servo della gleba`,
			`Vile Meccanico`,
			`Vice Palafreniere aggiunto`,
			`Lanzichenecco`,
			`Arcivescovo  di Canterbury`,
			`(disarcivescoviscanterburyzzato)`,
			`Barone Rampante`,
			`Visconte dimezzato`,
			`Conte della malora`
		],
		menuOption4LabelOverride: `Smettere prima ancora di cominciare`,
		commonPatterns: {
			say: `(pronuncia|di)`,
			wall: `(muro|mura|pareti|parete)`
		},
		defaultMessages: {
			beSerious: `Sii Serio!`,
			notUseful: `Non serve a niente.`,
			alreadyHaveIt: `Ce l'hai già.`,
			inYourHand: `Ce l'hai in mano.`,
			wearing: `L'hai già addosso`, 
			didNotUnderstand: `- Non capisco.`,
			again: `Cos'altro speri di ottenere ?`, 
			youDontKnow: `Tu non conosci questa parola.`,
			isOpened: `E' già aperto.`,
			isClosed: `E' chiuso.`, 
			notFound: `Chi cerca trova.`,
		},
		messages: {
			huh: `Eh?`,
			somethingSensible: `Dimmi qualcosa di sensato.`,
			dontBeFormal: `Dammi del tu, per favore.`,
			overloaded: `Sei già troppo carico; devi lasciare qualcosa.`,
			points: (points, maxPoints) => `Hai duramente conquistato ${points} punti, su un possibile massimo di ${maxPoints}.`,
			tough: `Peggio per te!`
		},
		verbs: {
			look: { pattern: `(guarda|osserva|esamina)` },
			drop: { pattern: `(lascia|posa|molla|getta)` },
			press: { pattern: `(premi|schiaccia)` },
			push: { pattern: `(spingi|sposta|muovi)` },
			offer: { pattern: `(offri|dai)` },
			repair: { pattern: `(aggiusta|ripara)` },
			translate: { pattern: `traduci` },
			play: { pattern: `suona` },
			enter: { pattern: `entra(?: in)?`, defaultMessage: `Da che parte ? (N/S/E/O/A/B)` },
			wear: { pattern: `(mettiti|indossa|metti|infilati)` },
			liftUp: { pattern: `(alza|solleva)`, defaultMessage: `Non c'è sotto niente.` },
			lower: { pattern: `abbassa`, defaultMessage: `Non si abbassa.` },
			take: { pattern: `(prendi|ruba|afferra)` },
			read: { pattern: `leggi` },
			insert: { pattern: `(infila|inserisci)` },
			insertInto: { pattern: `(infila|inserisci) (.+) (?:in) (.+)` },
			pray: { pattern: `prega`, defaultMessage: `  Aiutati che Dio ti aiuterà.` },
			land: { pattern: `(atterra|cabra|plana|picchia|vira|manovra)`, defaultMessage: `Più a terra di così!` },
			jump: { pattern: `(lanciati|gettati|buttati|salta)(?: .+)?`, defaultMessage: `Faccio già ginnastica tutte le mattine.` },
			sitDown: { pattern: `(siedi(?:ti)?|sdraiati)(?: su )?(.+)?`, defaultMessage: `Un po' di riposo fa sempre bene.` },
			greet: { pattern: `saluta`, defaultMessage: `Nessuna risposta.` },
			dig: { pattern: `scava`, defaultMessage: `Non sono tagliato per i lavori di bassa manovalanza.` },
			eat: { pattern: `(mangia|divora)`, defaultMessage: `Non mi sembra molto digeribile.` },
			knock: { pattern: `bussa`, defaultMessage: `Nessuna risposta.` },
			thank: { pattern: `(grazie|ringrazia)`, defaultMessage: `Prego.` },
			wait: { pattern: `aspetta`, defaultMessage: `D'accordo` },
			talk: { pattern: `(parla(?: con)?|interroga)`, defaultMessage: `Se una volta tanto pensassi invece di parlare, non sarebbe meglio?` },
			listen: { pattern: `ascolta`, defaultMessage: `Restando immobile con l'orecchio teso, ti par di udire lontano un rumore come di catene strascicate. Ma forse è solo uno scherzo giocato alla tua fantasia dal remoto sibilare del vento.` },
			buy: { pattern: `(compra|compera|acquista)`, defaultMessage: `Non hai una lira.` },
			break: { pattern: `(rompi|spacca|spezza|frantuma|distruggi|sfonda|strappa)` },
			drink: { pattern: `bevi` },
			wind: { pattern: `(carica|ricarica)` },
			kill: { pattern: `(uccidi|attacca|colpisci|ferisci|ammazza|picchia)` },
			feed: { pattern: `(nutri|sfama|ciba)` },
			pet: { pattern: `(carezza|accarezza|coccola)` },
			mount: { pattern: `(monta|rimonta|costruisci|ricostruisci)` },
			ask: { pattern: `(chiedi|domanda)`, defaultMessage: `Nessuno è disposto ad offrirti l'oggetto del tuo desiderio.` },
			askTo: { pattern: `(chiedi|domanda) (.+) (?:a) (.+)`, defaultMessage: `Nessuno è disposto ad offrirti l'oggetto del tuo desiderio.` },
			skrewOff: { pattern: `svita` },
			hello: { pattern: `ciao` },
			greeting: { pattern: `(buongiorno|buonasera|buonanotte)` }
		},
		commands: {
			where: { pattern: `(dove|guarda|esamina|osserva)( (stanza|camera|sala|pavimento|soffitto|locale))?` },
			points: { pattern: `(punti|quanto)` },
			stop: { pattern: `(basta|stop|fine|abbandono)`, defaultMessage: `Mi spiace che tu voglia abbandonare la tua esplorazione, proprio quando...` },
			instructions: { pattern: `istruzioni` },
			inventory: { pattern: `(cosa|inv(?:en(?:tario)?)?|\\?)` },
			save: { pattern: `(salva|save|registra)` },
			load: { pattern: `(carica|load|riprendi)` },
			insult: { pattern: `(idiota|scemo|cretino|merda|inculati|pirla|vaffanculo|deficiente|stupido|stronzo|imbecille)` },
			help: { pattern: `(aiuto|sos|help|soccors(?:o|i))`, defaultMessage: `Arrangiati!` },
			call: { pattern: `(chiama|grida|urla)(?: (.+))?`, defaultMessage: `Senti in risposta un lontano suono cavernoso, e ti ci vuole qualche secondo per capire che è solo l'eco della tua voce roca.` },
			cry: { pattern: `piangi`, defaultMessage: `Ora che ti sei sfogato, alzati e combatti da uomo!` },
			moves: { pattern: `(turni|mosse)`, defaultMessage: (moves) => `Sei giunto or ora a ${moves} mosse.` },
			idiot: { pattern: `(id|iota)`, defaultMessage: `T cpsc sltnt a mt'` },
			abracadabra: { pattern: `abracadabra`, defaultMessage: `Temo che questa vecchia parola magica sia ormai consunta dal troppo uso.` },
			die: { pattern: `(muori|impiccati|crepa|sparati)`, defaultMessage: `D'accordo.` },
			think: { pattern: `(pensa|ragiona|cogita|medita|deduci|ingegnati)`, defaultMessage: `Non mi sembra il posto adatto` },
			getOut: { pattern: `(esci(?: da)?|corri|scappa|fuggi|cammina|torna|ritorna|vai)( (?:a )?(?:n(ord)?|s(ud)?|e(st)?|o(vest)?|a(lto)?|b(asso)?))?`, defaultMessage: `Sono indeciso: da che parte ? (N/S/E/O/A/B)` },
			sleep: { pattern: `(dormi|riposa(?:ti)?)`, defaultMessage: `Z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z` },
			maybe: { pattern: `(boh|mah|forse|probabilmente)`, defaultMessage: `Non essere così indeciso!` },
			good: { pattern: `bravo`, defaultMessage: `Grazie!` },
			youAreWelcome: { pattern: `prego`, defaultMessage: `Non c'è di che.` },
			openSesame: { pattern: `apriti sesamo`, defaultMessage: `Guarda che questa è AVVENTURA NEL CASTELLO, non LE MILLE E UNA NOTTE.` },
			waitForMidnight: { pattern: `aspetta mezzanotte`, defaultMessage: `E' strano: quando aspetti qualcosa, sembra davvero che il tempo non passi mai.` },
			sayHello: { pattern: `saluta` },
			greeting: { defaultMessage: `Ciao. Bella giornata, vero?` },
			hello: { defaultMessage: `Ciao. Bella giornata, vero?` },
			senno: { pattern: (sayPattern) => `(?:${sayPattern} )?senno`, defaultMessage: `Non è una parola magica, stupido!` },
			useSenno: { pattern: `usa senno`, defaultMessage: `Non mi sembra il posto adatto!` },
			lookForDictionary: { pattern: `cerca dizionario`, defaultMessage: `Non pretenderai che lo cerchi per tutto il castello!` },
			saySpell: { pattern: (sayPattern) => `(${sayPattern} )?(sortilegio|incantesimo)` },
			introduceYourself: { pattern: `presentati`, defaultMessage: `Elenchi doviziosamente i tuoi numerosi titoli onorifici, ma pare che non vi sia nessuno disposto a prestarti ascolto.` },
			yes: { pattern: `(si|certo|certamente|sicuro)`, defaultMessage: `O forse no.` },
			no: { pattern: `(no|mai)`, defaultMessage: `O forse si` },
			bigmeow: {
				pattern: (sayPattern) => `(${sayPattern} )?bigmeow`,
				defaultMessage: {
					prelude: [
						`Il gatto cresce fino a diventare enorme............`,
						`ti osserva con attenzione............`
					],
					success: [
						`osserva con attenzione l'orco..........`,
						`Il gatto divora l'orco e muore di indigestione.`,
					],
					fail: `e ti divora.`
				}
			},
			iotid: { pattern: (sayPattern) => `(${sayPattern} )?iotaid` },
			readSpell: { pattern: `leggi (incantesimo|sortilegio)` },
			swim: { pattern: `nuota` }
		},
		dieText: `Sono molto addolorato per la tua prematura scomparsa... D'altronde sono sempre i migliori che se ne vanno (non è vero?). Consolati comunque pensando che:`,
		instructions: [
			`Il tuo obbiettivo principale è uscire vivo dal castello.`,
			`Per farcela dovrai affrontare molti pericoli e risolvere problemi che metteranno a dura prova la tua astuzia.`,
			`In questa avventura, io sarò il tuo alter ego, i tuoi occhi e le tue orecchie, ma tu dovrai prendere le decisioni (e subirne le conseguenze).`,
			`Per muoverti usa:`,
			`- NORD, SUD, EST, OVEST, ALTO, BASSO oppure soltanto:`,
			`- N, S, E, O, A, B`,
			`Io ti darò la descrizione completa di ogni luogo la prima volta che vi entri, poi darò solo una descrizione breve. Se vuoi la descrizione completa dimmi:`,
			`- GUARDA o`,
			`- GUARDA LA STANZA`,
			`Azioni fondamentali sono:`,
			`- PRENDI qualcosa`,
			`- LASCIA qualcosa`,
			`- GUARDA qualcosa, ad esempio GUARDA LO SCALONE.`,
			`Io non sono molto furbo, per cui usa frasi come APRI LA PORTA o SALTA e non frasi elaborate come GUARDA DIETRO IL DIVANO o avverbi (GUARDA ATTENTAMENTE), che sono al di là della mia comprensione.`,
			`Per agire su un oggetto, di solito è necessario possederlo. Inoltre, ricorda che un'azione che non ha effetto in un posto (es. CERCA) può averne da qualche altra parte.`,
			`Altri comandi importanti:`,
			`- DOVE ti ricorda dove ti trovi,`,
			`- COSA elenca gli oggetti che possiedi,`,
			`- MOSSE ti dice da quanto giochi,`,
			`- PUNTI quanto sei riuscito a scoprire,`,
			`- SAVE serve a registrare la situazione,`,
			`- LOAD ripristina una situazione salvata,`,
			`- BASTA termina il gioco,`,
			`- ISTRUZIONI ti ripete questa descrizione.`,
			`Buona Fortuna! (ne avrai bisogno)`
		],
		insult: {
			toMe: (insult) => ` ${insult} A ME???? `,
			nowYourTurn: `ADESSO TI FACCIO VEDERE IO!!!!`,
			fuck: ` Tié! `
		},
		prepareInputSteps: [
			{ pattern: `[\\.,:;!"£\\$%&\\/\\(\\)=°\\+\\*]*`, replaceWith: `` },
			{ pattern: `'`, replaceWith: ` ` },
			{ pattern: ` (il|la|lo|le|li|l|gli|un|uno|una) `, replaceWith: ` ` },
			{ pattern: ` +`, replaceWith: ` ` },
			{ pattern: ` (del|dell|dello|degli|dei|della|delle) `, replaceWith: ` di ` },
			{ pattern: ` (al|all|allo|agli|alla|alle) `, replaceWith: ` a ` },
			{ pattern: ` (dal|dall|dallo|dagli|dalla|dalle) `, replaceWith: ` da ` },
			{ pattern: ` (nel|nell|nello|negli|nella|nelle|dentro) `, replaceWith: ` in ` },
			{ pattern: ` (col|coi) `, replaceWith: ` con ` },
			{ pattern: ` (sul|sull|sullo|sugli|sulla|sulle|sopra) `, replaceWith: ` su ` },
			{ pattern: ` (tra|fra) `, replaceWith: ` tra ` }
		]
	}
};

module.exports = i18n;
