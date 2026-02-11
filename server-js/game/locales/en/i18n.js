/**
 * English localization for Avventura nel Castello
 * Adapted from source_app/it-it.i18n.js for server-side use
 */

const i18n = {
	htmlTitle: `Adventure in the Castle - API Server`,
	title: `   ADVENTURE IN THE CASTLE JS   `,
	IFEngine: {
		warnings: {
			mustBeExtended: `IFEngine must be extended`,
			notLoaded: `No adventure loaded`,
			noData: `No saved data...`,
			notFound: (filename) => `Save "${filename}" not found.`
		},
		menu: {
			choose: `Do you want to:`,
			new: `Start a new adventure`,
			load: `Resume a saved game`,
			delete: `Delete all saves`,
			readInstructions: `Review the instructions`,
			quit: `Exit the game`,
			restart: `Restart from the beginning`,
			stop: `Stop playing`
		},
		questions: {
			stopQuestion: `Do you want to stop playing`,
			areYouSureQuestion: `Are you sure`,
			saveLabel: `Save label:`,
			restoreLabel: `Label:`,
			what: `what?`
		},
		yesOrNo:{
			yes: `yes`,
			no: `no`
		},
		messages: {
			tanksForPlaying: `Thanks for playing. Bye! :)`,
			saved: `Saved!`,
			loaded: `Loaded...`,
			noInstructions: `No instructions here...`,
			death: `YOU ARE DEAD!!!`,
			noPoints: `This adventure has no score`,
			points: (points, maxPoints) => `You earned ${points} points out of ${maxPoints}`,
			noObjects: `You're not carrying any objects.`,
			carriedObjectsLabel: `You're currently carrying:`,
			alreadyHaveIt: `You already have it`
		},
		questionMark: `?`
	},
	Thesaurus: {
		defaultMessages: {
			done: `Done!`,
			preferNot: `I'd rather not.`,
			notFound: `Fruitless search.`,
			didNotUnderstand: `I didn't understand...`,
			dontNoticeAnythingInParticular: `I don't notice anything in particular.`,
			notSeenHere: `I don't see any here.`, 
			dontHaveAny: `You don't have any.`, 
			nothingHappens: `Nothing happens.`,
			beMoreSpecific: `Be more specific.`,
			notPossible: `That's not possible.`
		},
		commands: {
			north: {
				pattern: `(vai verso |vai a |vai )?(n(ord)?)`,
				defaultMessage: `You can't go north.`
			},
			south: {
				pattern: `(vai verso |vai a |vai )?(s(ud|outh)?)`,
				defaultMessage: `You can't go south.`
			},
			east: {
				pattern: `(vai verso |vai a |vai )?(e(st)?|east)`,
				defaultMessage: `You can't go east.`
			},
			west: {
				pattern: `(vai verso |vai a |vai )?(o(vest)?|w(est)?)`,
				defaultMessage: `You can't go west.`
			},
			up: {
				pattern: `(sali|(vai verso |vai in |vai )?a(lto)?|u(p)?|su)`,
				defaultMessage: `You can't go up.`
			},
			down: {
				pattern: `(scendi|(vai verso |vai in |vai )?b(asso)?|d(own)?|giu)`,
				defaultMessage: `You can't go down.`
			}
		},
		verbs: {
			open: {
				pattern: `apri`,
				defaultMessage: `It won't open.`
			},
			close: {
				pattern: `chiudi`,
				defaultMessage: `It won't close.`
			},
			pull: {
				pattern: `tira`,
			},
			press: {
				pattern: `premi`
			},
			push: {
				pattern: `spingi`,
				defaultMessage: `It doesn't move.`
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
				defaultMessage: `I can't use them together.`
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
			mustBeExtended: `AvventuraNelCastelloEngine must be extended`
		},
		defaultInput: `What should I do?`,
		prefixLabels: {
			ISee: `I see`,
			cantSeeHere: `I don't see`,
			youDontOwn: `You don't have`,
			title: `You have earned the right to bear the title of:`
		},
		pointsLabel: [
			`A so-called adventurer`,
			`Village idiot`,
			`Lowly serf`,
			`Wretched mechanic`,
			`Assistant deputy groom`,
			`Lanzichenecco`,
			`Archbishop of Canterbury`,
			`(de-archbishop-of-canterbury-fied)`,
			`Roving Baron`,
			`Halved Viscount`,
			`Count of Doom`
		],
		menuOption4LabelOverride: `Quit before even starting`,
		commonPatterns: {
			say: `(pronuncia|di)`,
			wall: `(muro|mura|pareti|parete)`
		},
		defaultMessages: {
			beSerious: `Be serious!`,
			notUseful: `That won't help.`,
			alreadyHaveIt: `You already have it.`,
			inYourHand: `You're already holding it.`,
			wearing: `You're already wearing it.`, 
			didNotUnderstand: `- I don't understand.`,
			again: `What else do you hope to achieve?`, 
			youDontKnow: `You don't know that word.`,
			isOpened: `It's already open.`,
			isClosed: `It's closed.`, 
			notFound: `Seek and you shall find.`,
		},
		messages: {
			huh: `Huh?`,
			somethingSensible: `Tell me something sensible.`,
			dontBeFormal: `No need to be formal. Just talk to me.`,
			overloaded: `You're carrying too much; you need to drop something.`,
			points: (points, maxPoints) => `You painfully earned ${points} points, out of a possible maximum of ${maxPoints}.`,
			tough: `Too bad for you!`
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
			enter: { pattern: `entra(?: in)?`, defaultMessage: `Which way? (N/S/E/O/U/D)` },
			wear: { pattern: `(mettiti|indossa|metti|infilati)` },
			liftUp: { pattern: `(alza|solleva)`, defaultMessage: `There's nothing underneath.` },
			lower: { pattern: `abbassa`, defaultMessage: `It won't go down.` },
			take: { pattern: `(prendi|ruba|afferra)` },
			read: { pattern: `leggi` },
			insert: { pattern: `(infila|inserisci)` },
			insertInto: { pattern: `(infila|inserisci) (.+) (?:in) (.+)` },
			pray: { pattern: `prega`, defaultMessage: `  Heaven helps those who help themselves.` },
			land: { pattern: `(atterra|cabra|plana|picchia|vira|manovra)`, defaultMessage: `Lower than this?!` },
			jump: { pattern: `(lanciati|gettati|buttati|salta)(?: .+)?`, defaultMessage: `I do my morning workout already.` },
			sitDown: { pattern: `(siedi(?:ti)?|sdraiati)(?: su )?(.+)?`, defaultMessage: `A bit of rest never hurt anyone.` },
			greet: { pattern: `saluta`, defaultMessage: `No answer.` },
			dig: { pattern: `scava`, defaultMessage: `I'm not cut out for menial labor.` },
			eat: { pattern: `(mangia|divora)`, defaultMessage: `Doesn't look very digestible.` },
			knock: { pattern: `bussa`, defaultMessage: `No answer.` },
			thank: { pattern: `(grazie|ringrazia)`, defaultMessage: `You're welcome.` },
			wait: { pattern: `aspetta`, defaultMessage: `All right.` },
			talk: { pattern: `(parla(?: con)?|interroga)`, defaultMessage: `If you thought for once instead of talking, wouldn't that be better?` },
			listen: { pattern: `ascolta`, defaultMessage: `Standing perfectly still with your ear cocked, you think you hear, far away, something like chains being dragged. But perhaps it's just your imagination playing tricks, stirred by the distant hiss of the wind.` },
			buy: { pattern: `(compra|compera|acquista)`, defaultMessage: `You don't have a penny.` },
			break: { pattern: `(rompi|spacca|spezza|frantuma|distruggi|sfonda|strappa)` },
			drink: { pattern: `bevi` },
			wind: { pattern: `(carica|ricarica)` },
			kill: { pattern: `(uccidi|attacca|colpisci|ferisci|ammazza|picchia)` },
			feed: { pattern: `(nutri|sfama|ciba)` },
			pet: { pattern: `(carezza|accarezza|coccola)` },
			mount: { pattern: `(monta|rimonta|costruisci|ricostruisci)` },
			ask: { pattern: `(chiedi|domanda)`, defaultMessage: `No one seems willing to offer you the object of your desire.` },
			askTo: { pattern: `(chiedi|domanda) (.+) (?:a) (.+)`, defaultMessage: `No one seems willing to offer you the object of your desire.` },
			skrewOff: { pattern: `svita` },
			hello: { pattern: `ciao` },
			greeting: { pattern: `(buongiorno|buonasera|buonanotte)` }
		},
		commands: {
			where: { pattern: `(dove|guarda|esamina|osserva)( (stanza|camera|sala|pavimento|soffitto|locale))?` },
			points: { pattern: `(punti|quanto)` },
			stop: { pattern: `(basta|stop|fine|abbandono)`, defaultMessage: `I'm sorry you want to abandon your exploration, just when...` },
			instructions: { pattern: `istruzioni` },
			inventory: { pattern: `(cosa|inv(?:en(?:tario)?)?|\\?)` },
			save: { pattern: `(salva|save|registra)` },
			load: { pattern: `(carica|load|riprendi)` },
			insult: { pattern: `(idiota|scemo|cretino|merda|inculati|pirla|vaffanculo|deficiente|stupido|stronzo|imbecille)` },
			help: { pattern: `(aiuto|sos|help|soccors(?:o|i))`, defaultMessage: `Figure it out!` },
			call: { pattern: `(chiama|grida|urla)(?: (.+))?`, defaultMessage: `In reply you hear a distant cavernous sound, and it takes you a few seconds to realize it's only the echo of your hoarse voice.` },
			cry: { pattern: `piangi`, defaultMessage: `Now that you've had your cry, get up and fight like a proper hero!` },
			moves: { pattern: `(turni|mosse)`, defaultMessage: (moves) => `You have now reached ${moves} moves.` },
			idiot: { pattern: `(id|iota)`, defaultMessage: `T cpsc sltnt a mt'` },
			abracadabra: { pattern: `abracadabra`, defaultMessage: `I'm afraid that old magic word is worn out from overuse.` },
			die: { pattern: `(muori|impiccati|crepa|sparati)`, defaultMessage: `All right.` },
			think: { pattern: `(pensa|ragiona|cogita|medita|deduci|ingegnati)`, defaultMessage: `Doesn't seem like the right place.` },
			getOut: { pattern: `(esci(?: da)?|corri|scappa|fuggi|cammina|torna|ritorna|vai)( (?:a )?(?:n(ord)?|s(ud)?|e(st)?|o(vest)?|a(lto)?|b(asso)?))?`, defaultMessage: `I'm torn: which way? (N/S/E/W/U/D)` },
			sleep: { pattern: `(dormi|riposa(?:ti)?)`, defaultMessage: `Z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z` },
			maybe: { pattern: `(boh|mah|forse|probabilmente)`, defaultMessage: `Don't be so indecisive!` },
			good: { pattern: `bravo`, defaultMessage: `Thanks!` },
			youAreWelcome: { pattern: `prego`, defaultMessage: `Don't mention it.` },
			openSesame: { pattern: `apriti sesamo`, defaultMessage: `This is ADVENTURE IN THE CASTLE, not ONE THOUSAND AND ONE NIGHTS.` },
			waitForMidnight: { pattern: `aspetta mezzanotte`, defaultMessage: `Funny: when you're waiting for something, time truly seems to stand still.` },
			sayHello: { pattern: `saluta` },
			greeting: { defaultMessage: `Hi. Lovely day, isn't it?` },
			hello: { defaultMessage: `Hi. Lovely day, isn't it?` },
			senno: { pattern: (sayPattern) => `(?:${sayPattern} )?senno`, defaultMessage: `That's not a magic word, you fool!` },
			useSenno: { pattern: `usa senno`, defaultMessage: `Doesn't seem like the right place!` },
			lookForDictionary: { pattern: `cerca dizionario`, defaultMessage: `You don't expect me to search the whole castle for it, do you?` },
			saySpell: { pattern: (sayPattern) => `(${sayPattern} )?(sortilegio|incantesimo)` },
			introduceYourself: { pattern: `presentati`, defaultMessage: `You dutifully list your many honorary titles, but it seems no one is willing to listen.` },
			yes: { pattern: `(si|certo|certamente|sicuro)`, defaultMessage: `Or maybe not.` },
			no: { pattern: `(no|mai)`, defaultMessage: `Or maybe yes.` },
			bigmeow: {
				pattern: (sayPattern) => `(${sayPattern} )?bigmeow`,
				defaultMessage: {
					prelude: [
						`The cat grows until it becomes enormous............`,
						`it watches you closely............`
					],
					success: [
						`it watches the ogre carefully..........`,
						`The cat devours the ogre and dies of indigestion.`,
					],
					fail: `and devours you.`
				}
			},
			iotid: { pattern: (sayPattern) => `(${sayPattern} )?iotaid` },
			readSpell: { pattern: `leggi (incantesimo|sortilegio)` },
			swim: { pattern: `nuota` }
		},
		dieText: `I am deeply saddened by your untimely demise... Then again, it's always the best who go first (isn't it?). Take comfort, however, in the thought that:`,
		instructions: [
			`Your main objective is to leave the castle alive.`,
			`To do so you will face many dangers and solve problems that will put your wits to the test.`,
			`In this adventure, I will be your alter ego—your eyes and ears—but you will make the decisions (and suffer the consequences).`,
			`To move, use:`,
			`- NORD, SUD, EST, OVEST, ALTO, BASSO or simply:`,
			`- N, S, E, O, A, B`,
			`I will give you the full description of each location the first time you enter it, then only a short one. If you want the full description, tell me:`,
			`- GUARDA or`,
			`- GUARDA LA STANZA`,
			`Basic actions are:`,
			`- PRENDI something`,
			`- LASCIA something`,
			`- GUARDA something, e.g. GUARDA LO SCALONE.`,
			`I'm not very clever, so use phrases like APRI LA PORTA or SALTA and not elaborate ones like GUARDA DIETRO IL DIVANO or adverbs (GUARDA ATTENTAMENTE), which are beyond my understanding.`,
			`To act on an object, you usually need to possess it. Also remember that an action that has no effect in one place (e.g. CERCA) may have an effect elsewhere.`,
			`Other important commands:`,
			`- DOVE reminds you where you are,`,
			`- COSA lists the objects you carry,`,
			`- MOSSE tells you how long you've played,`,
			`- PUNTI tells you how much you've discovered,`,
			`- SAVE saves your current situation,`,
			`- LOAD restores a saved situation,`,
			`- BASTA ends the game,`,
			`- ISTRUZIONI repeats this description.`,
			`Good luck! (you'll need it)`
		],
		insult: {
			toMe: (insult) => ` ${insult} TO ME???? `,
			nowYourTurn: `NOW I'LL SHOW YOU!!!!`,
			fuck: ` There! `
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
