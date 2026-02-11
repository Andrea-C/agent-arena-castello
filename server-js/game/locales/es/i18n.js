/**
 * Spanish localization for Avventura nel Castello
 * Adapted from source_app/it-it.i18n.js for server-side use
 */

const i18n = {
	htmlTitle: `Aventura en el Castillo - Servidor API`,
	title: `   AVENTURA EN EL CASTILLO JS   `,
	IFEngine: {
		warnings: {
			mustBeExtended: `IFEngine debe ser extendido`,
			notLoaded: `No se ha cargado ninguna aventura`,
			noData: `No hay datos guardados...`,
			notFound: (filename) => `No se encontró la partida guardada "${filename}".`
		},
		menu: {
			choose: `¿Quieres:`,
			new: `Iniciar una nueva aventura`,
			load: `Reanudar una partida guardada`,
			delete: `Borrar todos los guardados`,
			readInstructions: `Repasar las instrucciones`,
			quit: `Salir del juego`,
			restart: `Empezar de nuevo desde el principio`,
			stop: `Dejar de jugar`
		},
		questions: {
			stopQuestion: `¿Quieres dejar de jugar`,
			areYouSureQuestion: `¿Estás seguro`,
			saveLabel: `Etiqueta del guardado:`,
			restoreLabel: `Etiqueta:`,
			what: `¿qué?`
		},
		yesOrNo:{
			yes: `sí`,
			no: `no`
		},
		messages: {
			tanksForPlaying: `Gracias por jugar. ¡Hasta luego! :)`,
			saved: `¡Guardado!`,
			loaded: `Cargado...`,
			noInstructions: `Aquí no hay instrucciones...`,
			death: `¡¡¡HAS MUERTO!!!`,
			noPoints: `Esta aventura no tiene puntuación`,
			points: (points, maxPoints) => `Has conseguido ${points} puntos de ${maxPoints}`,
			noObjects: `No llevas ningún objeto.`,
			carriedObjectsLabel: `Ahora mismo llevas:`,
			alreadyHaveIt: `Ya lo tienes`
		},
		questionMark: `?`
	},
	Thesaurus: {
		defaultMessages: {
			done: `¡Hecho!`,
			preferNot: `Prefiero que no.`,
			notFound: `Búsqueda infructuosa.`,
			didNotUnderstand: `No he entendido...`,
			dontNoticeAnythingInParticular: `No noto nada en particular.`,
			notSeenHere: `Aquí no veo ninguno.`, 
			dontHaveAny: `No tienes ninguno.`, 
			nothingHappens: `No pasa nada.`,
			beMoreSpecific: `Sé más específico.`,
			notPossible: `No es posible.`
		},
		commands: {
			north: {
				pattern: `(vai verso |vai a |vai )?(n(ord)?)`,
				defaultMessage: `No puedes ir al norte.`
			},
			south: {
				pattern: `(vai verso |vai a |vai )?(s(ud|outh)?)`,
				defaultMessage: `No puedes ir al sur.`
			},
			east: {
				pattern: `(vai verso |vai a |vai )?(e(st)?|east)`,
				defaultMessage: `No puedes ir al este.`
			},
			west: {
				pattern: `(vai verso |vai a |vai )?(o(vest)?|w(est)?)`,
				defaultMessage: `No puedes ir al oeste.`
			},
			up: {
				pattern: `(sali|(vai verso |vai in |vai )?a(lto)?|u(p)?|su)`,
				defaultMessage: `No puedes subir.`
			},
			down: {
				pattern: `(scendi|(vai verso |vai in |vai )?b(asso)?|d(own)?|giu)`,
				defaultMessage: `No puedes bajar.`
			}
		},
		verbs: {
			open: {
				pattern: `apri`,
				defaultMessage: `No se abre`
			},
			close: {
				pattern: `chiudi`,
				defaultMessage: `No se cierra`
			},
			pull: {
				pattern: `tira`,
			},
			press: {
				pattern: `premi`
			},
			push: {
				pattern: `spingi`,
				defaultMessage: `No se mueve.`
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
				defaultMessage: `No puedo usarlos juntos.`
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
			mustBeExtended: `AvventuraNelCastelloEngine debe ser extendido`
		},
		defaultInput: `¿Qué debo hacer?`,
		prefixLabels: {
			ISee: `Veo`,
			cantSeeHere: `Aquí no veo`,
			youDontOwn: `No tienes`,
			title: `Tienes derecho a ostentar el título de:`
		},
		pointsLabel: [
			`Aventurero de pacotilla`,
			`Tonto del pueblo`,
			`Siervo de la gleba`,
			`Vil mecánico`,
			`Sub-sub-ayudante de palafrenero`,
			`Lanzichenecco`,
			`Arzobispo de Canterbury`,
			`(desarzobispocanterburizado)`,
			`Barón rampante`,
			`Vizconde a medias`,
			`Conde de la desgracia`
		],
		menuOption4LabelOverride: `Rendirse antes incluso de empezar`,
		commonPatterns: {
			say: `(pronuncia|di)`,
			wall: `(muro|mura|pareti|parete)`
		},
		defaultMessages: {
			beSerious: `¡Sé serio!`,
			notUseful: `No sirve de nada.`,
			alreadyHaveIt: `Ya lo tienes.`,
			inYourHand: `Ya lo tienes en la mano.`,
			wearing: `Ya lo llevas puesto`, 
			didNotUnderstand: `- No entiendo.`,
			again: `¿Qué más esperas conseguir?`, 
			youDontKnow: `No conoces esa palabra.`,
			isOpened: `Ya está abierto.`,
			isClosed: `Está cerrado.`, 
			notFound: `Quien busca, encuentra.`,
		},
		messages: {
			huh: `¿Eh?`,
			somethingSensible: `Dime algo con sentido.`,
			dontBeFormal: `Tuteame, por favor.`,
			overloaded: `Ya vas demasiado cargado; tienes que soltar algo.`,
			points: (points, maxPoints) => `Has conseguido a pulso ${points} puntos, de un máximo posible de ${maxPoints}.`,
			tough: `¡Peor para ti!`
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
			enter: { pattern: `entra(?: in)?`, defaultMessage: `¿Por dónde? (N/S/E/O/A/B)` },
			wear: { pattern: `(mettiti|indossa|metti|infilati)` },
			liftUp: { pattern: `(alza|solleva)`, defaultMessage: `No hay nada debajo.` },
			lower: { pattern: `abbassa`, defaultMessage: `No se baja.` },
			take: { pattern: `(prendi|ruba|afferra)` },
			read: { pattern: `leggi` },
			insert: { pattern: `(infila|inserisci)` },
			insertInto: { pattern: `(infila|inserisci) (.+) (?:in) (.+)` },
			pray: { pattern: `prega`, defaultMessage: `  Ayúdate y Dios te ayudará.` },
			land: { pattern: `(atterra|cabra|plana|picchia|vira|manovra)`, defaultMessage: `¡Más a tierra que esto!` },
			jump: { pattern: `(lanciati|gettati|buttati|salta)(?: .+)?`, defaultMessage: `Ya hago gimnasia todas las mañanas.` },
			sitDown: { pattern: `(siedi(?:ti)?|sdraiati)(?: su )?(.+)?`, defaultMessage: `Un poco de descanso siempre viene bien.` },
			greet: { pattern: `saluta`, defaultMessage: `No hay respuesta.` },
			dig: { pattern: `scava`, defaultMessage: `No estoy hecho para trabajos de baja estofa.` },
			eat: { pattern: `(mangia|divora)`, defaultMessage: `No me parece muy digerible.` },
			knock: { pattern: `bussa`, defaultMessage: `No hay respuesta.` },
			thank: { pattern: `(grazie|ringrazia)`, defaultMessage: `De nada.` },
			wait: { pattern: `aspetta`, defaultMessage: `De acuerdo.` },
			talk: { pattern: `(parla(?: con)?|interroga)`, defaultMessage: `Si por una vez pensaras en vez de hablar, ¿no sería mejor?` },
			listen: { pattern: `ascolta`, defaultMessage: `Quedándote inmóvil con el oído atento, te parece oír a lo lejos un ruido como de cadenas arrastradas. Pero quizá solo sea una broma de tu imaginación, provocada por el remoto silbido del viento.` },
			buy: { pattern: `(compra|compera|acquista)`, defaultMessage: `No tienes ni una moneda.` },
			break: { pattern: `(rompi|spacca|spezza|frantuma|distruggi|sfonda|strappa)` },
			drink: { pattern: `bevi` },
			wind: { pattern: `(carica|ricarica)` },
			kill: { pattern: `(uccidi|attacca|colpisci|ferisci|ammazza|picchia)` },
			feed: { pattern: `(nutri|sfama|ciba)` },
			pet: { pattern: `(carezza|accarezza|coccola)` },
			mount: { pattern: `(monta|rimonta|costruisci|ricostruisci)` },
			ask: { pattern: `(chiedi|domanda)`, defaultMessage: `Nadie está dispuesto a ofrecerte el objeto de tu deseo.` },
			askTo: { pattern: `(chiedi|domanda) (.+) (?:a) (.+)`, defaultMessage: `Nadie está dispuesto a ofrecerte el objeto de tu deseo.` },
			skrewOff: { pattern: `svita` },
			hello: { pattern: `ciao` },
			greeting: { pattern: `(buongiorno|buonasera|buonanotte)` }
		},
		commands: {
			where: { pattern: `(dove|guarda|esamina|osserva)( (stanza|camera|sala|pavimento|soffitto|locale))?` },
			points: { pattern: `(punti|quanto)` },
			stop: { pattern: `(basta|stop|fine|abbandono)`, defaultMessage: `Me apena que quieras abandonar tu exploración, justo cuando...` },
			instructions: { pattern: `istruzioni` },
			inventory: { pattern: `(cosa|inv(?:en(?:tario)?)?|\\?)` },
			save: { pattern: `(salva|save|registra)` },
			load: { pattern: `(carica|load|riprendi)` },
			insult: { pattern: `(idiota|scemo|cretino|merda|inculati|pirla|vaffanculo|deficiente|stupido|stronzo|imbecille)` },
			help: { pattern: `(aiuto|sos|help|soccors(?:o|i))`, defaultMessage: `¡Apáñatelas!` },
			call: { pattern: `(chiama|grida|urla)(?: (.+))?`, defaultMessage: `Como respuesta oyes un lejano sonido cavernoso, y tardas unos segundos en entender que solo es el eco de tu voz ronca.` },
			cry: { pattern: `piangi`, defaultMessage: `Ahora que ya te has desahogado, ¡levántate y lucha como un hombre!` },
			moves: { pattern: `(turni|mosse)`, defaultMessage: (moves) => `Has llegado justo ahora a ${moves} movimientos.` },
			idiot: { pattern: `(id|iota)`, defaultMessage: `T cpsc sltnt a mt'` },
			abracadabra: { pattern: `abracadabra`, defaultMessage: `Me temo que esa vieja palabra mágica ya está gastada de tanto usarla.` },
			die: { pattern: `(muori|impiccati|crepa|sparati)`, defaultMessage: `De acuerdo.` },
			think: { pattern: `(pensa|ragiona|cogita|medita|deduci|ingegnati)`, defaultMessage: `No me parece el lugar adecuado` },
			getOut: { pattern: `(esci(?: da)?|corri|scappa|fuggi|cammina|torna|ritorna|vai)( (?:a )?(?:n(ord)?|s(ud)?|e(st)?|o(vest)?|a(lto)?|b(asso)?))?`, defaultMessage: `Estoy indeciso: ¿por dónde? (N/S/E/O/A/B)` },
			sleep: { pattern: `(dormi|riposa(?:ti)?)`, defaultMessage: `Z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z z` },
			maybe: { pattern: `(boh|mah|forse|probabilmente)`, defaultMessage: `¡No seas tan indeciso!` },
			good: { pattern: `bravo`, defaultMessage: `¡Gracias!` },
			youAreWelcome: { pattern: `prego`, defaultMessage: `No hay de qué.` },
			openSesame: { pattern: `apriti sesamo`, defaultMessage: `Oye, que esto es AVENTURA EN EL CASTILLO, no LAS MIL Y UNA NOCHES.` },
			waitForMidnight: { pattern: `aspetta mezzanotte`, defaultMessage: `Es curioso: cuando esperas algo, de verdad parece que el tiempo no pasa nunca.` },
			sayHello: { pattern: `saluta` },
			greeting: { defaultMessage: `Hola. Bonito día, ¿verdad?` },
			hello: { defaultMessage: `Hola. Bonito día, ¿verdad?` },
			senno: { pattern: (sayPattern) => `(?:${sayPattern} )?senno`, defaultMessage: `¡No es una palabra mágica, idiota!` },
			useSenno: { pattern: `usa senno`, defaultMessage: `¡No me parece el lugar adecuado!` },
			lookForDictionary: { pattern: `cerca dizionario`, defaultMessage: `¡No pretenderás que lo busque por todo el castillo!` },
			saySpell: { pattern: (sayPattern) => `(${sayPattern} )?(sortilegio|incantesimo)` },
			introduceYourself: { pattern: `presentati`, defaultMessage: `Enumeras con esmero tus numerosos títulos honoríficos, pero parece que no hay nadie dispuesto a escucharte.` },
			yes: { pattern: `(si|certo|certamente|sicuro)`, defaultMessage: `O quizá no.` },
			no: { pattern: `(no|mai)`, defaultMessage: `O quizá sí` },
			bigmeow: {
				pattern: (sayPattern) => `(${sayPattern} )?bigmeow`,
				defaultMessage: {
					prelude: [
						`El gato crece hasta volverse enorme............`,
						`te observa con atención............`
					],
					success: [
						`observa atentamente al ogro..........`,
						`El gato devora al ogro y muere de indigestión.`,
					],
					fail: `y te devora.`
				}
			},
			iotid: { pattern: (sayPattern) => `(${sayPattern} )?iotaid` },
			readSpell: { pattern: `leggi (incantesimo|sortilegio)` },
			swim: { pattern: `nuota` }
		},
		dieText: `Estoy muy apenado por tu prematura desaparición... Al fin y al cabo, siempre se van los mejores (¿verdad?). Consuélate pensando que:`,
		instructions: [
			`Tu objetivo principal es salir vivo del castillo.`,
			`Para lograrlo tendrás que afrontar muchos peligros y resolver problemas que pondrán a prueba tu astucia.`,
			`En esta aventura, yo seré tu alter ego, tus ojos y tus oídos, pero tú tomarás las decisiones (y sufrirás las consecuencias).`,
			`Para moverte usa:`,
			`- NORD, SUD, EST, OVEST, ALTO, BASSO o simplemente:`,
			`- N, S, E, O, A, B`,
			`Te daré la descripción completa de cada lugar la primera vez que entres, y luego solo una breve. Si quieres la descripción completa, dime:`,
			`- GUARDA o`,
			`- GUARDA LA STANZA`,
			`Acciones fundamentales:`,
			`- PRENDI algo`,
			`- LASCIA algo`,
			`- GUARDA algo, por ejemplo GUARDA LO SCALONE.`,
			`No soy muy listo, así que usa frases como APRI LA PORTA o SALTA y no frases elaboradas como GUARDA DIETRO IL DIVANO o adverbios (GUARDA ATTENTAMENTE), que están más allá de mi comprensión.`,
			`Para actuar sobre un objeto, normalmente hay que poseerlo. Además, recuerda que una acción que no tiene efecto en un lugar (por ejemplo CERCA) puede tenerlo en otro.`,
			`Otros comandos importantes:`,
			`- DOVE te recuerda dónde estás,`,
			`- COSA enumera los objetos que llevas,`,
			`- MOSSE te dice cuánto llevas jugando,`,
			`- PUNTI cuánto has conseguido descubrir,`,
			`- SAVE guarda la situación,`,
			`- LOAD recupera una situación guardada,`,
			`- BASTA termina el juego,`,
			`- ISTRUZIONI repite esta explicación.`,
			`¡Buena suerte! (la necesitarás)`
		],
		insult: {
			toMe: (insult) => ` ¿¿¿${insult} A MÍ???? `,
			nowYourTurn: `¡¡¡¡AHORA TE VOY A ENSEÑAR YO!!!!`,
			fuck: ` ¡Toma! `
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
