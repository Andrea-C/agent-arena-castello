from .i18n import i18n


class Thesaurus:
    def __init__(self) -> None:
        self.default_messages = {
            "FATTO": i18n.Thesaurus.defaultMessages.done,
            "PREFERISCO_DI_NO": i18n.Thesaurus.defaultMessages.preferNot,
            "NON_TROVATO": i18n.Thesaurus.defaultMessages.notFound,
            "NON_HO_CAPITO": i18n.Thesaurus.defaultMessages.didNotUnderstand,
            "NULLA_DI_PARTICOLARE": i18n.Thesaurus.defaultMessages.dontNoticeAnythingInParticular,
            "QUI_NON_NE_VEDO": i18n.Thesaurus.defaultMessages.notSeenHere,
            "NON_NE_POSSIEDI": i18n.Thesaurus.defaultMessages.dontHaveAny,
            "NON_SUCCEDE_NIENTE": i18n.Thesaurus.defaultMessages.nothingHappens,
            "SII_PIU_SPECIFICO": i18n.Thesaurus.defaultMessages.beMoreSpecific,
            "NON_E_POSSIBILE": i18n.Thesaurus.defaultMessages.notPossible,
            "SII_SERIO": i18n.AvventuraNelCastelloJSEngine.defaultMessages.beSerious,
            "GIA_ADDOSSO": i18n.AvventuraNelCastelloJSEngine.defaultMessages.wearing,
            "ANCORA": i18n.AvventuraNelCastelloJSEngine.defaultMessages.again,
            "GIA_APERTO": i18n.AvventuraNelCastelloJSEngine.defaultMessages.isOpened,
            "E_CHIUSO": i18n.AvventuraNelCastelloJSEngine.defaultMessages.isClosed,
            "NON_CONOSCI": i18n.AvventuraNelCastelloJSEngine.defaultMessages.youDontKnow,
        }
        self.load_commands()
        self.load_verbs()

    def load_commands(self) -> None:
        self.commands = {
            "nord": {
                "movimento": True,
                "pattern": i18n.Thesaurus.commands.north.pattern,
                "defaultMessage": i18n.Thesaurus.commands.north.defaultMessage,
                "direzione": "n",
            },
            "sud": {
                "movimento": True,
                "pattern": i18n.Thesaurus.commands.south.pattern,
                "defaultMessage": i18n.Thesaurus.commands.south.defaultMessage,
                "direzione": "s",
            },
            "est": {
                "movimento": True,
                "pattern": i18n.Thesaurus.commands.east.pattern,
                "defaultMessage": i18n.Thesaurus.commands.east.defaultMessage,
                "direzione": "e",
            },
            "ovest": {
                "movimento": True,
                "pattern": i18n.Thesaurus.commands.west.pattern,
                "defaultMessage": i18n.Thesaurus.commands.west.defaultMessage,
                "direzione": "o",
            },
            "alto": {
                "movimento": True,
                "pattern": i18n.Thesaurus.commands.up.pattern,
                "defaultMessage": i18n.Thesaurus.commands.up.defaultMessage,
                "direzione": "a",
            },
            "basso": {
                "movimento": True,
                "pattern": i18n.Thesaurus.commands.down.pattern,
                "defaultMessage": i18n.Thesaurus.commands.down.defaultMessage,
                "direzione": "b",
            },
            "aiuto": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.help.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.help.defaultMessage,
            },
            "punti": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.points.pattern,
                "defaultMessage": None,
            },
            "turni": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.moves.pattern,
                "defaultMessage": None,
            },
            "istruzioni": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.instructions.pattern,
                "defaultMessage": None,
            },
            "inventario": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.inventory.pattern,
                "defaultMessage": None,
            },
            "salva": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.save.pattern,
                "defaultMessage": None,
            },
            "carica": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.load.pattern,
                "defaultMessage": None,
            },
            "basta": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.stop.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.stop.defaultMessage,
            },
            "boh": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.maybe.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.maybe.defaultMessage,
            },
            "bravo": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.good.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.good.defaultMessage,
            },
            "prego": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.youAreWelcome.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.youAreWelcome.defaultMessage,
            },
            "idiota": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.idiot.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.idiot.defaultMessage,
            },
            "abracadabra": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.abracadabra.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.abracadabra.defaultMessage,
            },
            "apritiSesamo": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.openSesame.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.openSesame.defaultMessage,
            },
            "aspettaMezzanotte": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.waitForMidnight.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.waitForMidnight.defaultMessage,
            },
            "piangi": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.cry.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.cry.defaultMessage,
            },
            "dormi": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.sleep.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.sleep.defaultMessage,
            },
            "muori": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.die.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.die.defaultMessage,
            },
            "chiama": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.call.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.call.defaultMessage,
            },
            "offesa": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.insult.pattern,
                "defaultMessage": None,
            },
            "saluta": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.greet.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.verbs.greet.defaultMessage,
            },
            "si": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.yes.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.yes.defaultMessage,
            },
            "no": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.no.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.no.defaultMessage,
            },
            "cercaDizionario": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.lookForDictionary.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.lookForDictionary.defaultMessage,
            },
            "iotaid": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.iotid.pattern(
                    i18n.AvventuraNelCastelloJSEngine.commonPatterns.say
                ),
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.defaultMessages.youDontKnow,
            },
            "nuota": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.swim.pattern,
                "defaultMessage": self.default_messages["NON_HO_CAPITO"],
            },
            "pronunciaSortilegio": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.saySpell.pattern(
                    i18n.AvventuraNelCastelloJSEngine.commonPatterns.say
                ),
                "defaultMessage": self.default_messages["NON_HO_CAPITO"],
            },
            "leggiSortilegio": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.readSpell.pattern,
                "defaultMessage": self.default_messages["NON_HO_CAPITO"],
            },
            "bigmeow": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.bigmeow.pattern(
                    i18n.AvventuraNelCastelloJSEngine.commonPatterns.say
                ),
                "defaultMessage": self.default_messages["NON_HO_CAPITO"],
            },
            "ciao": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.hello.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.hello.defaultMessage,
            },
            "buongiorno": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.greeting.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.greeting.defaultMessage,
            },
            "presentati": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.introduceYourself.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.introduceYourself.defaultMessage,
            },
            "esci": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.getOut.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.getOut.defaultMessage,
            },
            "pensa": {
                "pattern": "pensa",
                "defaultMessage": self.default_messages["NON_HO_CAPITO"],
            },
            "senno": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.senno.pattern(
                    i18n.AvventuraNelCastelloJSEngine.commonPatterns.say
                ),
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.senno.defaultMessage,
            },
            "usaSenno": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.useSenno.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.useSenno.defaultMessage,
            },
            "dove": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.commands.where.pattern,
                "defaultMessage": self.default_messages["NON_HO_CAPITO"],
            },
        }

    def load_verbs(self) -> None:
        self.verbs = {
            "apri": {
                "pattern": i18n.Thesaurus.verbs.open.pattern,
                "defaultMessage": i18n.Thesaurus.verbs.open.defaultMessage,
            },
            "chiudi": {
                "pattern": i18n.Thesaurus.verbs.close.pattern,
                "defaultMessage": i18n.Thesaurus.verbs.close.defaultMessage,
            },
            "tira": {
                "pattern": i18n.Thesaurus.verbs.pull.pattern,
                "defaultMessage": self.default_messages["PREFERISCO_DI_NO"],
            },
            "premi": {
                "pattern": i18n.Thesaurus.verbs.press.pattern,
                "defaultMessage": self.default_messages["PREFERISCO_DI_NO"],
            },
            "spingi": {
                "pattern": i18n.Thesaurus.verbs.push.pattern,
                "defaultMessage": i18n.Thesaurus.verbs.push.defaultMessage,
            },
            "prendi": {
                "pattern": i18n.Thesaurus.verbs.take.pattern,
                "defaultMessage": self.default_messages["PREFERISCO_DI_NO"],
            },
            "lascia": {
                "inventario": True,
                "pattern": i18n.Thesaurus.verbs.drop.pattern,
                "defaultMessage": self.default_messages["PREFERISCO_DI_NO"],
            },
            "dai": {
                "inventario": True,
                "pattern": i18n.Thesaurus.verbs.give.pattern,
                "complex": True,
                "defaultMessage": self.default_messages["PREFERISCO_DI_NO"],
            },
            "cerca": {
                "pattern": i18n.Thesaurus.verbs.lookFor.pattern,
                "defaultMessage": self.default_messages["NON_TROVATO"],
            },
            "guarda": {
                "pattern": i18n.Thesaurus.verbs.look.pattern,
                "defaultMessage": self.default_messages["NULLA_DI_PARTICOLARE"],
            },
            "usaCon": {
                "pattern": i18n.Thesaurus.verbs.useWith.pattern,
                "complex": True,
                "defaultMessage": i18n.Thesaurus.verbs.useWith.defaultMessage,
            },
            "usa": {
                "pattern": i18n.Thesaurus.verbs.use.pattern,
                "defaultMessage": self.default_messages["SII_PIU_SPECIFICO"],
            },
            "sali": {
                "pattern": i18n.Thesaurus.verbs.goUp.pattern,
                "defaultMessage": self.default_messages["NON_HO_CAPITO"],
            },
            "scendi": {
                "pattern": i18n.Thesaurus.verbs.goDown.pattern,
                "defaultMessage": self.default_messages["NON_HO_CAPITO"],
            },
            "salta": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.jump.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.verbs.jump.defaultMessage,
                "singolo": True,
            },
            "atterra": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.land.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.verbs.land.defaultMessage,
                "singolo": True,
            },
            "siedi": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.sitDown.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.verbs.sitDown.defaultMessage,
                "singolo": True,
            },
            "leggi": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.read.pattern,
                "defaultMessage": self.default_messages["NON_HO_CAPITO"],
            },
            "alza": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.liftUp.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.verbs.liftUp.defaultMessage,
            },
            "svita": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.skrewOff.pattern,
                "defaultMessage": self.default_messages["NON_HO_CAPITO"],
            },
            "indossa": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.wear.pattern,
                "defaultMessage": self.default_messages["SII_PIU_SPECIFICO"],
            },
            "aggiusta": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.repair.pattern,
                "defaultMessage": self.default_messages["NON_HO_CAPITO"],
            },
            "traduci": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.translate.pattern,
                "defaultMessage": self.default_messages["NON_SUCCEDE_NIENTE"],
            },
            "carica": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.wind.pattern,
                "defaultMessage": self.default_messages["NON_SUCCEDE_NIENTE"],
            },
            "nutri": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.feed.pattern,
                "defaultMessage": self.default_messages["NON_HO_CAPITO"],
            },
            "rompi": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs["break"]["pattern"],
                "defaultMessage": self.default_messages["NON_HO_CAPITO"],
            },
            "bevi": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.drink.pattern,
                "defaultMessage": self.default_messages["NON_HO_CAPITO"],
            },
            "suona": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.play.pattern,
                "defaultMessage": self.default_messages["NON_HO_CAPITO"],
            },
            "offri": {
                "pattern": "(offri)",
                "defaultMessage": self.default_messages["NON_HO_CAPITO"],
            },
            "parla": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.talk.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.verbs.talk.defaultMessage,
            },
            "chiedi": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.ask.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.verbs.ask.defaultMessage,
            },
            "chiediA": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.askTo.pattern,
                "complex": True,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.verbs.askTo.defaultMessage,
            },
            "ciao": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.hello.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.hello.defaultMessage,
            },
            "buongiorno": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.greeting.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.commands.greeting.defaultMessage,
            },
            "saluta": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.greet.pattern,
                "defaultMessage": i18n.AvventuraNelCastelloJSEngine.verbs.greet.defaultMessage,
            },
            "uccidi": {
                "pattern": i18n.AvventuraNelCastelloJSEngine.verbs.kill.pattern,
                "defaultMessage": self.default_messages["PREFERISCO_DI_NO"],
            },
            "infila": {
                "pattern": r"(infila|inserisci) (.+) (?:in|nel|nell|nello|nella|nei|negli|nelle|dentro) (.+)",
                "complex": True,
                "defaultMessage": self.default_messages["NON_HO_CAPITO"],
            },
        }
