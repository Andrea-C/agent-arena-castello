import copy
import json
import re
from typing import Any, Dict, List, Tuple

from .data_loader import load_game_data
from .util import AttrDict
from .function_placeholder import FunctionPlaceholder
from .i18n import i18n
from .parser import Parser
from .thesaurus import Thesaurus


class GameCore:
    def __init__(self) -> None:
        self.game_data = load_game_data()
        self.thesaurus = Thesaurus()
        self.parser = Parser(self.thesaurus.verbs, self.thesaurus.commands)

    def menu_text(self) -> str:
        return "\n".join(
            [
                i18n.IFEngine.menu.choose,
                f"(1) {i18n.IFEngine.menu.new}",
                f"(2) {i18n.IFEngine.menu.load}",
                f"(3) {i18n.IFEngine.menu.delete}",
                f"(4) {i18n.IFEngine.menu.readInstructions}",
                "(5) Smettere prima ancora di cominciare",
            ]
        )

    def help_text(self) -> str:
        return "\n".join(
            [
                "Il tuo obbiettivo principale e' uscire vivo dal castello.",
                "Per farcela dovrai affrontare molti pericoli e risolvere problemi che metteranno a dura prova la tua astuzia.",
                "In questa avventura, io saro' il tuo alter ego, i tuoi occhi e le tue orecchie, ma tu dovrai prendere le decisioni (e subirne le conseguenze).",
                "Per muoverti usa:",
                "- NORD, SUD, EST, OVEST, ALTO, BASSO oppure soltanto:",
                "- N, S, E, O, A, B",
                "Io ti daro' la descrizione completa di ogni luogo la prima volta che vi entri, poi daro' solo una descrizione breve. Se vuoi la descrizione completa dimmi:",
                "- GUARDA o",
                "- GUARDA LA STANZA",
                "Azioni fondamentali sono:",
                "- PRENDI qualcosa",
                "- LASCIA qualcosa",
                "- GUARDA qualcosa, ad esempio GUARDA LO SCALONE.",
                "Io non sono molto furbo, per cui usa frasi come APRI LA PORTA o SALTA e non frasi elaborate come GUARDA DIETRO IL DIVANO o avverbi (GUARDA ATTENTAMENTE), che sono al di la' della mia comprensione.",
                "Per agire su un oggetto, di solito e' necessario possederlo. Inoltre, ricorda che un'azione che non ha effetto in un posto (es. CERCA) puo' averne da qualche altra parte.",
                "Altri comandi importanti:",
                "- DOVE ti ricorda dove ti trovi,",
                "- COSA elenca gli oggetti che possiedi,",
                "- MOSSE ti dice da quanto giochi,",
                "- PUNTI quanto sei riuscito a scoprire,",
                "- SAVE serve a registrare la situazione su disco,",
                "- LOAD ripristina la situazione su disco,",
                "- BASTA termina il gioco,",
                "- ISTRUZIONI ti ripete questa descrizione.",
                "Buona Fortuna! (ne avrai bisogno)",
            ]
        )

    def start_game(self) -> Tuple[Dict, str]:
        data = copy.deepcopy(self.game_data)
        stanza_iniziale = data.datiAvventura.stanzaIniziale
        state = {
            "turns": 0,
            "log": [],
            "dati_avventura": data.datiAvventura,
            "altri_dati": data.altriDati,
            "dati_punti": data.datiPunti,
            "stanza_corrente": stanza_iniziale,
            "inventario": {},
            "timed_events": [],
            "timed_event_steps": {},
            "visited": [],
        }
        prologue = self._run_sequence(state, "prologo")
        room_output = self._enter_room(state, stanza_iniziale, show_full=True)
        output = self._merge_output(prologue, room_output)
        return state, output

    def process(self, state: Dict, input_text: str) -> Tuple[Dict, str]:
        prepared = self._prepare(input_text)
        room = self._current_room(state)
        override = self._resolve_override_patterns(state, getattr(room, "override", None))
        self.parser.set_override(override)
        timed_output = self._tick_timed_events(state)
        pending = state.get("pending_question")
        if pending:
            output = self._handle_pending_question(state, prepared)
            return state, self._merge_output(timed_output, output)
        parse_result = self.parser.parse(prepared)

        if parse_result is False:
            output = self.thesaurus.default_messages["NON_HO_CAPITO"]
            return state, self._merge_output(timed_output, output)
        if isinstance(parse_result, str):
            verb = parse_result.capitalize()
            output = (
                f"{verb} {i18n.IFEngine.questions.what} "
                f"{self.thesaurus.default_messages['SII_PIU_SPECIFICO']}"
            )
            return state, self._merge_output(timed_output, output)

        state["turns"] = int(state.get("turns", 0)) + 1
        log = state.get("log", [])
        log.append(input_text)
        state["log"] = log[-50:]

        action_obj = parse_result["actionObject"]
        if action_obj.get("movimento"):
            state, output = self._move(state, parse_result["subjects"][0], action_obj.get("defaultMessage"))
            return state, self._merge_output(timed_output, output)

        if parse_result["command"]:
            if parse_result["verb"] == "dove":
                output = self._describe_room(state, show_full=True)
                return state, self._merge_output(timed_output, output)
            if parse_result["verb"] == "punti":
                output = self._points_text(state)
                return state, self._merge_output(timed_output, output)
            if parse_result["verb"] == "turni":
                output = self._moves_text(state)
                return state, self._merge_output(timed_output, output)
            if parse_result["verb"] == "istruzioni":
                output = self._instructions_text()
                return state, self._merge_output(timed_output, output)
            if parse_result["verb"] == "inventario":
                output = self._inventory_text(state)
                return state, self._merge_output(timed_output, output)
            if parse_result["verb"] == "senno":
                output = i18n.AvventuraNelCastelloJSEngine.commands.senno.defaultMessage
                return state, self._merge_output(timed_output, output)
            if parse_result["verb"] == "basta":
                state["pending_question"] = {"type": "quit"}
                question = i18n.IFEngine.questions.stopQuestion
                return state, self._merge_output(timed_output, question)
            if parse_result["verb"] == "muori":
                prefix = action_obj.get("defaultMessage") or ""
                output = self._merge_output(prefix, self._die(state))
                return state, self._merge_output(timed_output, output)
            if parse_result["verb"] == "chiama":
                target = parse_result["subjects"][0] if parse_result.get("subjects") else ""
                if target:
                    aiuto_pattern = i18n.AvventuraNelCastelloJSEngine.commands.help.pattern
                    if re.match(aiuto_pattern, target, re.IGNORECASE):
                        room = self._current_room(state)
                        if room and room.key == "aereo" and getattr(room, "override", None):
                            override_cmds = getattr(room.override, "commands", {}) or {}
                            aiuto = override_cmds.get("aiuto")
                            if aiuto:
                                output = self._call_action(state, aiuto, [])
                                return state, self._merge_output(timed_output, output or "")
                    return state, self._merge_output(timed_output, self.thesaurus.default_messages["NON_HO_CAPITO"])
                output = action_obj.get("defaultMessage") or ""
                return state, self._merge_output(timed_output, output)
            if parse_result["verb"] == "offesa":
                match = re.search(i18n.AvventuraNelCastelloJSEngine.commands.insult.pattern, prepared, re.IGNORECASE)
                insult = match.group(1) if match else prepared
                output = i18n.AvventuraNelCastelloJSEngine.insult.toMe(insult.upper())
                output = self._merge_output(output, i18n.AvventuraNelCastelloJSEngine.insult.nowYourTurn)
                output = self._merge_output(output, i18n.AvventuraNelCastelloJSEngine.insult.fuck)
                state["game_over"] = True
                return state, self._merge_output(timed_output, output)
            if parse_result["verb"] == "pronunciaSortilegio":
                output = self._resolve_spell(state, prefix=False)
                return state, self._merge_output(timed_output, output or "")
            if parse_result["verb"] == "leggiSortilegio":
                inv_spada = state.get("inventario", {}).get("spada")
                if inv_spada is None or getattr(inv_spada, "status", 0) == 0:
                    output = self._resolve_spell(state, prefix=False)
                    return state, self._merge_output(timed_output, output or "")
                question = i18n.AvventuraNelCastelloJS.objects.sword.spell.question
                state["pending_question"] = {"type": "sortilegio"}
                return state, self._merge_output(timed_output, question)
            if parse_result["verb"] == "bigmeow":
                output = self._handle_bigmeow(state)
                return state, self._merge_output(timed_output, output or "")
        if parse_result["command"] and action_obj.get("callback"):
            output = self._call_action(state, action_obj["callback"], parse_result["subjects"])
            if output is None:
                output = self.thesaurus.default_messages["NON_HO_CAPITO"]
            return state, self._merge_output(timed_output, output)
        if parse_result["command"] and not action_obj.get("callback"):
            default_msg = action_obj.get("defaultMessage")
            if default_msg:
                return state, self._merge_output(timed_output, default_msg)

        subjects = self._map_subjects(state, parse_result["subjects"])
        if subjects is None:
            return state, self.thesaurus.default_messages["NON_HO_CAPITO"]

        state["last_subjects"] = subjects
        if not subjects and not action_obj.get("singolo", False):
            return state, self.thesaurus.default_messages["SII_PIU_SPECIFICO"]
        if not subjects and parse_result["verb"] == "siedi":
            throne = self._current_interactor(state, "trono")
            if throne and getattr(throne, "on", None) and "siedi" in throne.on:
                output = self._call_action(state, throne.on["siedi"], [None])
                if output is not None:
                    return state, self._merge_output(timed_output, output)

        if action_obj.get("callback"):
            output = self._call_action(state, action_obj["callback"], subjects)
            if output is not None:
                return state, self._merge_output(timed_output, output)

        if subjects:
            result = self._play_action(state, parse_result["verb"], subjects, action_obj)
            if result is not None:
                return state, self._merge_output(timed_output, result)

        default_msg = action_obj.get("defaultMessage") or self.thesaurus.default_messages["NON_HO_CAPITO"]
        return state, self._merge_output(timed_output, default_msg)

    def serialize_state(self, state: Dict) -> str:
        return json.dumps(self._serialize_value(state), ensure_ascii=False)

    def deserialize_state(self, raw: str) -> Dict:
        return self._deserialize_value(json.loads(raw))

    def _prepare(self, input_text: str) -> str:
        cleaned = input_text.strip()
        cleaned = (
            cleaned.replace(",", "")
            .replace(".", "")
            .replace(":", "")
            .replace(";", "")
            .replace("!", "")
            .replace('"', "")
            .replace("£", "")
            .replace("$", "")
            .replace("%", "")
            .replace("&", "")
            .replace("/", "")
            .replace("(", "")
            .replace(")", "")
            .replace("=", "")
            .replace("à", "")
            .replace("°", "")
            .replace("è", "")
            .replace("é", "")
            .replace("+", "")
            .replace("*", "")
        )
        while "  " in cleaned:
            cleaned = cleaned.replace("  ", " ")
        return cleaned

    def _current_room(self, state: Dict) -> Any:
        return state["dati_avventura"].stanze[state["stanza_corrente"]]

    def _current_interactor(self, state: Dict, key: str) -> Any:
        room = self._current_room(state)
        interactors = getattr(room, "interactors", {}) or {}
        return interactors.get(key)

    def _refresh_room_objects(self, state: Dict) -> None:
        room = self._current_room(state)
        objects = state["dati_avventura"].objects
        room.objects = {k: v for k, v in objects.items() if v.posizione == room.key}

    def _enter_room(self, state: Dict, room_key: str, show_full: bool) -> str:
        current = state.get("stanza_corrente")
        if current:
            self._handle_room_exit(state)
        state["stanza_corrente"] = room_key
        room = self._current_room(state)
        room.key = room_key
        self._refresh_room_objects(state)
        enter_output = self._handle_room_enter(state)
        description = self._describe_room(state, show_full=show_full)
        return self._merge_output(enter_output, description)

    def _describe_room(self, state: Dict, show_full: bool) -> str:
        room = self._current_room(state)
        visited = set(state.get("visited", []))
        description = room.description
        if not show_full and room.shortDescription:
            description = room.shortDescription
        if isinstance(description, list):
            description = "\n".join(description)
        if show_full:
            visited.add(room.key)
        state["visited"] = list(visited)
        return description

    def _move(self, state: Dict, direction: str, default_message: str) -> Tuple[Dict, str]:
        room = self._current_room(state)
        directions = getattr(room, "directions", None) or {}
        blocked = getattr(room, "unavaiableDirections", []) or []
        if default_message is None:
            default_message = self.thesaurus.default_messages["NON_E_POSSIBILE"]
        if direction in blocked:
            return state, default_message
        if direction in directions:
            target = directions[direction]
            if isinstance(target, str):
                output = self._enter_room(state, target, show_full=target not in set(state.get("visited", [])))
                return state, output
            output = self._call_action(state, target, [])
            return state, output or ""
        return state, default_message

    def _map_subjects(self, state: Dict, subjects: List[str]) -> Any:
        if not subjects:
            return []
        room = self._current_room(state)
        mapped = []
        for subject in subjects:
            item = self._get(state, subject, getattr(room, "interactors", {}) or {})
            if not item:
                item = self._get(state, subject, getattr(room, "objects", {}) or {})
            if not item:
                item = self._get(state, subject, state.get("inventario", {}) or {})
            mapped.append(item)
        if any(m is False for m in mapped):
            return None
        return mapped

    def _get(self, state: Dict, needle: str, obj_list: Dict) -> Any:
        if not obj_list:
            return False
        for key, obj in obj_list.items():
            if self._match(needle, obj):
                obj.key = key
                return obj
            if getattr(obj, "linkedObjects", None):
                for linked_key in obj.linkedObjects:
                    linked = self._get_source(state["dati_avventura"].objects, linked_key)
                    if linked and self._match(needle, linked):
                        return linked
        return False

    def _get_source(self, source: Dict, key: str, separator: str = "|") -> Any:
        for k, value in source.items():
            parts = k.split(separator)
            if key in parts:
                return value
        return None

    def _match(self, needle: str, obj: Any) -> bool:
        pattern = getattr(obj, "pattern", None)
        label = getattr(obj, "label", None)
        if pattern is None:
            if label is None:
                return False
            pattern = self._simple_pattern(label)
        return bool(self._regex_match(needle, pattern))

    def _regex_match(self, needle: str, pattern: str) -> bool:
        return bool(__import__("re").match(f"^(?:{pattern})$", needle, __import__("re").IGNORECASE))

    def _simple_pattern(self, label: str) -> str:
        chunks = label.split()
        if not chunks:
            return ""
        chunks[0] = f"({chunks[0]}\\s+)?"
        return chunks[0] + "\\s+".join(chunks[1:])

    def _play_action(self, state: Dict, verb: str, subjects: List[Any], action_obj: Dict) -> Any:
        primary = subjects[0]
        if getattr(primary, "visibile", True) is False and not action_obj.get("inventario"):
            return getattr(primary, "invisibleMessage", None) or self.thesaurus.default_messages["QUI_NON_NE_VEDO"]
        if getattr(primary, "on", None):
            candidate = self._get_source(primary.on, verb)
            if candidate:
                return self._call_action(state, candidate, subjects)
        if verb == "guarda":
            description = getattr(primary, "description", None) or action_obj.get("defaultMessage")
            if isinstance(description, list):
                status = getattr(primary, "status", 0)
                description = description[status]
            return description
        if verb == "prendi":
            return self._take(state, primary)
        if verb == "lascia":
            return self._drop(state, primary)
        return action_obj.get("defaultMessage") or self.thesaurus.default_messages["NON_HO_CAPITO"]

    def _take(self, state: Dict, obj: Any) -> str:
        room = self._current_room(state)
        if getattr(room, "objects", {}).get(obj.key) is not None:
            self._add_to_inventory(state, obj)
            return self.thesaurus.default_messages["FATTO"]
        if state["inventario"].get(obj.key) is not None:
            return i18n.IFEngine.messages.alreadyHaveIt
        return self.thesaurus.verbs["prendi"]["defaultMessage"]

    def _drop(self, state: Dict, obj: Any) -> str:
        if state["inventario"].get(obj.key) is None:
            return self.thesaurus.default_messages["NON_NE_POSSIEDI"]
        self._remove_from_inventory(state, obj)
        return self.thesaurus.default_messages["FATTO"]

    def _add_to_inventory(self, state: Dict, obj: Any) -> None:
        self._ensure_object_key(state, obj)
        self._discover(state, obj)
        room = self._current_room(state)
        if getattr(room, "objects", None) and obj.key in room.objects:
            room.objects[obj.key].posizione = None
        state["inventario"][obj.key] = obj
        self._refresh_room_objects(state)

    def _remove_from_inventory(self, state: Dict, obj: Any, position: str = None) -> None:
        self._ensure_object_key(state, obj)
        room = self._current_room(state)
        obj.posizione = position if position is not None else room.key
        state["dati_avventura"].objects[obj.key] = obj
        state["inventario"].pop(obj.key, None)
        self._refresh_room_objects(state)

    def _discover(self, state: Dict, obj: Any) -> None:
        obj.visibile = True
        self._refresh_room_objects(state)

    def _ensure_object_key(self, state: Dict, obj: Any) -> None:
        if getattr(obj, "key", None):
            return
        obj_label = getattr(obj, "label", None)
        obj_pattern = getattr(obj, "pattern", None)
        for key, candidate in state["dati_avventura"].objects.items():
            if candidate is obj or candidate == obj:
                obj.key = key
                return
            if obj_label is not None and getattr(candidate, "label", None) == obj_label:
                if obj_pattern is None or getattr(candidate, "pattern", None) == obj_pattern:
                    obj.key = key
                    return

    def _call_action(self, state: Dict, action: Any, args: List[Any]) -> Any:
        if isinstance(action, FunctionPlaceholder):
            resolved = self._try_resolve_placeholder(state, action.source, args)
            if resolved is not None:
                return resolved
            return f"[TODO] Port function: {action.source[:80]}..."
        if callable(action):
            return action(args)
        if isinstance(action, str):
            return action
        if isinstance(action, list):
            return "\n".join([str(item) for item in action])
        return None

    def _try_resolve_placeholder(self, state: Dict, source: str, args: List[Any]) -> Any:
        source = source.strip()
        if "rooms.mirrorsHall.override.commands.getOut" in source:
            return i18n.AvventuraNelCastelloJS.rooms.mirrorsHall.override.commands.getOut
        if "bonk()" in source or "stanzaCorrente.bonk" in source or (
            "rooms.mirrorsHall.bonk" in source and "rooms.mirrorsHall.notADoor" in source
        ):
            if self._random_int_inclusive(1, 100) < 26:
                return self._enter_room(state, "stanzaRe", show_full=True)
            bonk = i18n.AvventuraNelCastelloJS.rooms.mirrorsHall.bonk
            not_a_door = i18n.AvventuraNelCastelloJS.rooms.mirrorsHall.notADoor
            return f"- >{bonk}< -\n{not_a_door}"
        if "rooms.columnsHall.interactors.column.onLook" in source:
            self._add_points(state, "lettoId")
            altri = state.get("altri_dati", {})
            iotaid = altri.get("iotaid", {})
            iotaid["id"] = True
            altri["iotaid"] = iotaid
            state["altri_dati"] = altri
            return None
        if "aggiungiPunti(\"lettoId\")" in source and "altriDati.iotaid.id = true" in source:
            self._add_points(state, "lettoId")
            altri = state.get("altri_dati", {})
            iotaid = altri.get("iotaid", {})
            iotaid["id"] = True
            altri["iotaid"] = iotaid
            state["altri_dati"] = altri
            colonna = self._current_interactor(state, "colonna")
            if colonna and getattr(colonna, "description", None):
                return colonna.description
            return i18n.AvventuraNelCastelloJS.rooms.columnsHall.interactors.column.description
        if "stanzaCorrente.risposteComuni[0]" in source:
            room = self._current_room(state)
            return room.risposteComuni[0] if getattr(room, "risposteComuni", None) else ""
        if "stanzaCorrente.risposteComuni[1]" in source:
            room = self._current_room(state)
            return room.risposteComuni[1] if getattr(room, "risposteComuni", None) else ""
        if "stanzaCorrente.HUGE" in source:
            room = self._current_room(state)
            return getattr(room, "HUGE", None)
        if "rooms.catapultRoom.interactors.balls.onBreak" in source:
            return i18n.AvventuraNelCastelloJS.rooms.catapultRoom.interactors.balls.onBreak
        if "rooms.hallway.interactors.spades.onTake.question" in source:
            state["pending_question"] = {"type": "picche"}
            return i18n.AvventuraNelCastelloJS.rooms.hallway.interactors.spades.onTake.question
        if "rooms.portraitsGallery.interactors.portrait.onLookQuestion" in source:
            state["pending_question"] = {"type": "ritratti"}
            return i18n.AvventuraNelCastelloJS.rooms.portraitsGallery.interactors.portrait.onLookQuestion
        if "rooms.trophiesRoom.interactors.armor.onLook" in source:
            spada = state["dati_avventura"].objects.spada
            was_visible = getattr(spada, "visibile", False)
            spade_text = ""
            if not was_visible:
                spade_text = i18n.AvventuraNelCastelloJS.rooms.trophiesRoom.interactors.armor.spadeText
            spada.visibile = True
            room = self._current_room(state)
            if getattr(room, "objects", None) and "spada" in room.objects:
                room.objects["spada"].visibile = True
            return i18n.AvventuraNelCastelloJS.rooms.trophiesRoom.interactors.armor.onLook(spade_text)
        if "rooms.throneRoom.interactors.throne.onSitDown.question" in source and "target" in source:
            target = args[0] if args else None
            if not target:
                state["pending_question"] = {"type": "trono_sit"}
                return i18n.AvventuraNelCastelloJS.rooms.throneRoom.interactors.throne.onSitDown.question
            throne = self._current_interactor(state, "trono")
            if target is throne:
                return self._try_resolve_placeholder(state, "rooms.throneRoom.interactors.throne.onSitDown.answer", [])
            return None
        if "rooms.throneRoom.interactors.throne.onSitDown.question" in source:
            state["pending_question"] = {"type": "trono_sit"}
            return i18n.AvventuraNelCastelloJS.rooms.throneRoom.interactors.throne.onSitDown.question
        if "rooms.tapestriesRoom.interactors.tapestries.onLook" in source:
            lines = i18n.AvventuraNelCastelloJS.rooms.tapestriesRoom.interactors.tapestries.onLook
            return "\n".join(lines)
        if "rooms.trophiesRoom.interactors.armor.onLook" in source and "spada" in source:
            spada = state["dati_avventura"].objects.spada
            spade_text = "" if getattr(spada, "visibile", False) else i18n.AvventuraNelCastelloJS.rooms.trophiesRoom.interactors.armor.spadeText
            if spade_text:
                spada.visibile = True
            on_look = i18n.AvventuraNelCastelloJS.rooms.trophiesRoom.interactors.armor.onLook
            return on_look(spade_text)
        if "rooms.throneRoom.interactors.throne.onSitDown.answer" in source:
            room = self._current_room(state)
            if getattr(room, "objects", None) and "cuscino" in room.objects:
                room.objects["cuscino"].visibile = False
            return i18n.AvventuraNelCastelloJS.rooms.throneRoom.interactors.throne.onSitDown.answer
        if "aggiungiPunti(\"entratoSalaTrono\")" in source:
            self._add_points(state, "entratoSalaTrono")
            return None
        if "aggiungiPunti(\"risoltoLabirinto\")" in source:
            self._add_points(state, "risoltoLabirinto")
            return None
        if "this.runSequence(\"braccio\")" in source:
            return self._run_sequence(state, "braccio")
        if "runSequence(\"segretaCastello\"" in source:
            return self._run_sequence(state, "segretaCastello", args)
        if "this.aggiungiPunti(\"uscitoDaSegreta\")" in source and "entra('depositoAttrezzi')" in source:
            self._add_points(state, "uscitoDaSegreta")
            return self._enter_room(state, "depositoAttrezzi", show_full=True)
        if "rooms.toolshed.directions.up" in source and "scalaChiocciolaSudOvest" in source:
            output = i18n.AvventuraNelCastelloJS.rooms.toolshed.directions.up
            room_output = self._enter_room(state, "scalaChiocciolaSudOvest", show_full=True)
            return self._merge_output(output, room_output)
        if "targets[0].key == \"portone\"" in source and "_vai(\"n\")" in source:
            if not args or (args and getattr(args[0], "key", None) == "portone"):
                return self._move(state, "n", None)[1]
            return None
        if "rooms.paradeGround.directions.north" in source:
            portone = self._current_interactor(state, "portone")
            if portone and getattr(portone, "status", 0) == 1:
                self._add_points(state, "entrato")
                success = i18n.AvventuraNelCastelloJS.rooms.paradeGround.directions.north.success
                room_output = self._enter_room(state, "atrioCastello", show_full=True)
                return self._merge_output(success, room_output)
            return i18n.AvventuraNelCastelloJS.rooms.paradeGround.directions.north.fail
        if "rooms.paradeGround.directions.south" in source:
            return i18n.AvventuraNelCastelloJS.rooms.paradeGround.directions.south
        if "rooms.paradeGround.directions.up" in source:
            return i18n.AvventuraNelCastelloJS.rooms.paradeGround.directions.up
        if "rooms.paradeGround.interactors.drawbridge.onLower" in source:
            output = i18n.AvventuraNelCastelloJS.rooms.paradeGround.interactors.drawbridge.onLower
            return self._merge_output(output, self._die(state))
        if "rooms.paradeGround.interactors.doorway.onClose" in source:
            return i18n.AvventuraNelCastelloJS.rooms.paradeGround.interactors.doorway.onClose
        if "rooms.paradeGround.interactors.stoneSlab.onLook" in source:
            lines = i18n.AvventuraNelCastelloJS.rooms.paradeGround.interactors.stoneSlab.onLook
            output = "\n".join(lines)
            return self._merge_output(output, self._die(state))
        if "rooms.atrium.interactors.blazon.onLook" in source:
            lines = i18n.AvventuraNelCastelloJS.rooms.atrium.interactors.blazon.onLook
            output = "\n\n\t".join([lines[0], lines[1]]) + "\n" + lines[2]
            self._add_points(state, "cadutoInSegreta")
            room_output = self._enter_room(state, "segretaCastello", show_full=True)
            return self._merge_output(output, room_output)
        if "rooms.library.override.commands.lookForDictionary" in source:
            return i18n.AvventuraNelCastelloJS.rooms.library.override.commands.lookForDictionary
        if "rooms.library.override.commands.iotid" in source:
            altri = state.get("altri_dati", {})
            iotaid = altri.get("iotaid", {})
            if iotaid.get("id") and iotaid.get("iota") and not iotaid.get("pronunciato"):
                lines = i18n.AvventuraNelCastelloJS.rooms.library.override.commands.iotid
                output = "\n".join(lines)
                self._enable_direction(state, "o")
                iotaid["pronunciato"] = True
                altri["iotaid"] = iotaid
                state["altri_dati"] = altri
                self._add_points(state, "pronunciatoIotaid")
                return output
            return self.thesaurus.commands["iotaid"]["defaultMessage"]
        if "rooms.library.interactors.book.onOpen" in source:
            libro = self._current_interactor(state, "libro")
            if libro is None:
                return None
            if getattr(libro, "status", 0) == 1:
                return self.thesaurus.default_messages["GIA_APERTO"]
            libro.status = 1
            self._add_points(state, "apertoLibro")
            foglio = state["dati_avventura"].objects.foglio
            self._discover(state, foglio)
            return i18n.AvventuraNelCastelloJS.rooms.library.interactors.book.onOpen
        if "rooms.library.interactors.book.onRead" in source:
            libro = self._current_interactor(state, "libro")
            if libro is None:
                return None
            if getattr(libro, "status", 0) == 0:
                return self.thesaurus.default_messages["E_CHIUSO"]
            self._add_points(state, "scopertoDizionario")
            dizionario = self._current_interactor(state, "dizionario")
            if dizionario is not None:
                dizionario.visibile = True
            return i18n.AvventuraNelCastelloJS.rooms.library.interactors.book.onRead
        if "rooms.wideTunnel.directions.north.fail" in source:
            room = self._current_room(state)
            if getattr(room, "objects", None) and "orco" in room.objects:
                output = i18n.AvventuraNelCastelloJS.rooms.wideTunnel.directions.north.fail
                return self._merge_output(output, self._die(state))
            target = "strettoCunicolo"
            show_full = target not in set(state.get("visited", []))
            room_output = self._enter_room(state, target, show_full=show_full)
            return room_output
        if "rooms.L29.dodgersHatch" in source:
            pergamena = state["dati_avventura"].objects.pergamena
            if getattr(pergamena, "tradotta", False):
                target = "stanzaSegreta"
                show_full = target not in set(state.get("visited", []))
                return self._enter_room(state, target, show_full=show_full)
            output = i18n.AvventuraNelCastelloJS.rooms.L29.dodgersHatch
            target = "atrioCastello"
            show_full = target not in set(state.get("visited", []))
            room_output = self._enter_room(state, target, show_full=show_full)
            return self._merge_output(output, room_output)
        if "rooms.trap.directions.west" in source:
            room = self._current_room(state)
            if getattr(room, "uscito", False) is False:
                room.uscito = True
                target = "cameraTesoro"
                show_full = target not in set(state.get("visited", []))
                return self._enter_room(state, target, show_full=show_full)
            lines = i18n.AvventuraNelCastelloJS.rooms.trap.directions.west
            output = "\n".join(lines)
            return self._merge_output(output, self._die(state))
        if "rooms.secretRoom.interactors.lever.onPush" in source:
            output = i18n.AvventuraNelCastelloJS.rooms.secretRoom.interactors.lever.onPush
            target = "corridoio"
            show_full = target not in set(state.get("visited", []))
            room_output = self._enter_room(state, target, show_full=show_full)
            return self._merge_output(output, room_output)
        if "rooms.secretRoom.interactors.pendulumClock.onLook" in source:
            orologio = self._current_interactor(state, "orologio")
            if orologio is None or getattr(orologio, "status", 0) == 0:
                return None
            if orologio.status < 5:
                orologio.status += 1
            if orologio.status == 5:
                lines = i18n.AvventuraNelCastelloJS.rooms.secretRoom.interactors.pendulumClock.onLook
                output = "\n".join(lines)
                self._add_points(state, "suonaMezzanotte")
                self._enable_direction(state, "a")
                orologio.status += 1
                return output
            return None
        if "rooms.secretRoom.interactors.pendulumClock.onCharge" in source:
            orologio = self._current_interactor(state, "orologio")
            if orologio is None:
                return None
            if "chiave" not in state.get("inventario", {}):
                return i18n.AvventuraNelCastelloJS.rooms.secretRoom.interactors.pendulumClock.onCharge.fail
            if getattr(orologio, "status", 0) == 0:
                self._add_points(state, "caricatoOrologio")
                orologio.status += 1
                return i18n.AvventuraNelCastelloJS.rooms.secretRoom.interactors.pendulumClock.onCharge.success
            if orologio.status < 5:
                return i18n.AvventuraNelCastelloJS.rooms.secretRoom.interactors.pendulumClock.onCharge.working
            return i18n.AvventuraNelCastelloJS.rooms.secretRoom.interactors.pendulumClock.onCharge.blocked
        if "rooms.woodshed.override.commands.helloPrefix" in source:
            output = i18n.AvventuraNelCastelloJS.rooms.woodshed.override.commands.helloPrefix
            greet = self._try_resolve_placeholder(state, "objects.dwarf.onGreet", [])
            return self._merge_output(output, greet or "")
        if "rooms.woodshed.override.commands.introduceYourself" in source:
            diamante = state["dati_avventura"].objects.diamante
            if getattr(diamante, "visibile", False):
                return i18n.AvventuraNelCastelloJS.rooms.woodshed.override.commands.introduceYourself[0]
            output = i18n.AvventuraNelCastelloJS.rooms.woodshed.override.commands.introduceYourself[1]
            greet = self._try_resolve_placeholder(state, "objects.dwarf.onGreet", [])
            return self._merge_output(output, greet or "")
        if "rooms.woodshed.override.verbs.askForDiamond" in source:
            target = args[0] if args else None
            diamante = state["dati_avventura"].objects.diamante
            if target is diamante:
                nano = state["dati_avventura"].objects.nano
                if getattr(nano, "status", 0) == 1:
                    return i18n.AvventuraNelCastelloJS.rooms.woodshed.override.verbs.askForDiamond[0]
                return i18n.AvventuraNelCastelloJS.rooms.woodshed.override.verbs.askForDiamond[1]
            return i18n.Thesaurus.verbs.ask.defaultMessage
        if "stanzaCorrente.objects.nano.on.saluta" in source:
            return self._try_resolve_placeholder(state, "objects.dwarf.onGreet", [])
        if "stanzaCorrente.override.verbs.chiedi(targets)" in source:
            if len(args) >= 2:
                diamante = state["dati_avventura"].objects.diamante
                nano = state["dati_avventura"].objects.nano
                if args[0] is diamante and args[1] is nano:
                    return self._try_resolve_placeholder(state, "rooms.woodshed.override.verbs.askForDiamond", args)
            return i18n.Thesaurus.verbs.ask.defaultMessage
        if "rooms.diningRoom.directions.down.question" in source:
            state["pending_question"] = {"type": "dining_down"}
            return i18n.AvventuraNelCastelloJS.rooms.diningRoom.directions.down.question
        if "rooms.winePantry.directions.north" in source:
            if "whisky" not in state.get("timed_events", []):
                target = "legnaia"
                show_full = target not in set(state.get("visited", []))
                return self._enter_room(state, target, show_full=show_full)
            lines = i18n.AvventuraNelCastelloJS.rooms.winePantry.directions.north
            output = "\n".join(lines)
            return self._merge_output(output, self._die(state))
        if "rooms.whiskeyPantry.interactors.keg.onOpenQuestion" in source:
            state["pending_question"] = {"type": "whiskey_keg"}
            return i18n.AvventuraNelCastelloJS.rooms.whiskeyPantry.interactors.keg.onOpenQuestion
        if "rooms.whiskeyPantry.interactors.whiskey.onTakeOrDrink" in source:
            self._start_timed_event(state, "whisky")
            return i18n.AvventuraNelCastelloJS.rooms.whiskeyPantry.interactors.whiskey.onTakeOrDrink
        if "rooms.alchemistCell.interactors.volume.onOpen" in source:
            volume = self._current_interactor(state, "volume")
            if volume and getattr(volume, "aperto", False):
                return self.thesaurus.default_messages["GIA_APERTO"]
            return i18n.AvventuraNelCastelloJS.rooms.alchemistCell.interactors.volume.onOpen
        if "rooms.alchemistCell.interactors.volume.onRead" in source:
            volume = self._current_interactor(state, "volume")
            if volume and getattr(volume, "aperto", False):
                altri = state.get("altri_dati", {})
                bigmeow = altri.get("bigmeow", {})
                bigmeow["attivo"] = True
                altri["bigmeow"] = bigmeow
                state["altri_dati"] = altri
                self._add_points(state, "lettoBigMeow")
                return "\n".join(i18n.AvventuraNelCastelloJS.rooms.alchemistCell.interactors.volume.onRead)
            return self.thesaurus.default_messages["E_CHIUSO"]
        if "rooms.treasureChamber.interactors.coffer.onLook" in source:
            forziere = self._current_interactor(state, "forziere")
            if forziere is None or getattr(forziere, "status", 0) == 0:
                return self.thesaurus.default_messages["E_CHIUSO"]
            corno = state["dati_avventura"].objects.corno
            self._discover(state, corno)
            self._add_points(state, "trovatoCorno")
            if getattr(self._current_room(state), "objects", None) and "corno" in self._current_room(state).objects:
                return i18n.AvventuraNelCastelloJS.rooms.treasureChamber.interactors.coffer.onLook[0]
            return i18n.AvventuraNelCastelloJS.rooms.treasureChamber.interactors.coffer.onLook[1]
        if "rooms.treasureChamber.interactors.coffer.onOpen" in source:
            fantasma = self._current_interactor(state, "fantasma")
            if fantasma and getattr(fantasma, "neutralizzato", False) is False:
                if getattr(fantasma, "visibile", False) is False:
                    fantasma.visibile = True
                    return i18n.AvventuraNelCastelloJS.rooms.treasureChamber.interactors.coffer.onOpen[0]
                output = i18n.AvventuraNelCastelloJS.rooms.treasureChamber.interactors.coffer.onOpen[1]
                return self._merge_output(output, self._die(state))
            forziere = self._current_interactor(state, "forziere")
            if forziere and getattr(forziere, "status", 0) == 1:
                return self.thesaurus.default_messages["GIA_APERTO"]
            if forziere:
                forziere.status = 1
            self._add_points(state, "apertoForziere")
            return self.thesaurus.default_messages["FATTO"]
        if "rooms.treasureChamber.interactors.coffer.onClose" in source:
            forziere = self._current_interactor(state, "forziere")
            if forziere is None or getattr(forziere, "status", 0) == 0:
                return self.thesaurus.default_messages["E_CHIUSO"]
            return i18n.AvventuraNelCastelloJS.rooms.treasureChamber.interactors.coffer.onClose
        if "rooms.treasureChamber.interactors.ghost.onTalk" in source:
            lines = i18n.AvventuraNelCastelloJS.rooms.treasureChamber.interactors.ghost.onTalk
            return "\n".join(lines)
        if "rooms.topOfStairs.interactors.walls.onPush" in source:
            lines = i18n.AvventuraNelCastelloJS.rooms.topOfStairs.interactors.walls.onPush
            output = "\n".join(lines)
            self._add_points(state, "entratoLabirinto")
            target = "entrataLabirinto"
            show_full = target not in set(state.get("visited", []))
            room_output = self._enter_room(state, target, show_full=show_full)
            return self._merge_output(output, room_output)
        if "rooms.topOfTower.interactors.flag.onTake" in source:
            lines = i18n.AvventuraNelCastelloJS.rooms.topOfTower.interactors.flag.onTake
            output = "\n".join(lines)
            return self._merge_output(output, self._die(state))
        if "rooms.topOfTower.override.verbs.jump" in source:
            output = i18n.AvventuraNelCastelloJS.rooms.topOfTower.override.verbs.jump
            return self._merge_output(output, self._die(state))
        if "commonRooms.ramparts.onJump" in source:
            lines = i18n.AvventuraNelCastelloJS.commonRooms.ramparts.onJump
            output = "\n".join(lines)
            return self._merge_output(output, self._die(state))
        if "commonRooms.labyrinth.onDrop" in source:
            if not args:
                return self.thesaurus.default_messages["NON_HO_CAPITO"]
            self._remove_from_inventory(state, args[0], position="entrataLabirinto")
            return i18n.AvventuraNelCastelloJS.commonRooms.labyrinth.onDrop
        if "commonRooms.labyrinth.onGetOut" in source:
            return i18n.AvventuraNelCastelloJS.commonRooms.labyrinth.onGetOut
        if "commonRooms.labyrinth.onThink" in source or "labyrinth.onThink" in source:
            altri = state.get("altri_dati", {})
            altri["pensa"] = altri.get("pensa", 0) + 1
            state["altri_dati"] = altri
            lines = i18n.AvventuraNelCastelloJS.commonRooms.labyrinth.onThink
            question = i18n.AvventuraNelCastelloJS.commonRooms.labyrinth.onThinkQuestion
            return "\n".join(lines + [question])
        if "stanzaCorrente.override.commands.pensa" in source:
            return self._try_resolve_placeholder(state, "commonRooms.labyrinth.onThink", [])
        if "rooms.rock.interactors.nessie.onGreet" in source:
            lines = i18n.AvventuraNelCastelloJS.rooms.rock.interactors.nessie.onGreet
            return f"{lines[0]} {lines[1]} {lines[2]}"
        if "rooms.rock.override.commands.swim" in source:
            lines = i18n.AvventuraNelCastelloJS.rooms.rock.override.commands.swim
            output = "\n".join(lines)
            return self._merge_output(output, self._die(state))
        if "startTimedEvent(\"nessie\")" in source and "altriDati.punti = 999" in source:
            self._start_timed_event(state, "nessie")
            altri = state.get("altri_dati", {})
            altri["punti"] = 999
            state["altri_dati"] = altri
            return None
        if "scesoInSotterranei" in source and "scalaChiocciolaSotterranei" in source:
            cat = state.get("inventario", {}).get("gatto")
            coppa = state.get("inventario", {}).get("coppaLattemiele")
            if cat and coppa and getattr(coppa, "status", 0) == 0 and getattr(cat, "on", None):
                self._try_resolve_placeholder(state, "objects.cat.onFeed", [])
            self._add_points(state, "scesoInSotterranei")
            return self._enter_room(state, "scalaChiocciolaSotterranei", show_full=True)
        if "objects.cat.onTake" in source:
            if "gatto" in state.get("inventario", {}):
                return i18n.AvventuraNelCastelloJS.objects.cat.onTake.alreadyIn
            cat = state["dati_avventura"].objects.gatto
            self._add_to_inventory(state, cat)
            cat.status = 1
            return i18n.AvventuraNelCastelloJS.objects.cat.onTake.gotIt
        if "objects.cat.onPet" in source:
            lines = i18n.AvventuraNelCastelloJS.objects.cat.onPet
            return "\n".join(lines)
        if "objects.cat.onKill" in source:
            if "gatto" in state.get("inventario", {}):
                state["inventario"].pop("gatto", None)
            cat = state["dati_avventura"].objects.gatto
            cat.posizione = None
            self._refresh_room_objects(state)
            return "\n".join(i18n.AvventuraNelCastelloJS.objects.cat.onKill)
        if "objects.cat.onFeed" in source:
            coppa = state.get("inventario", {}).get("coppaLattemiele")
            if coppa is None:
                return i18n.AvventuraNelCastelloJS.objects.cat.onFeed.nothingSuitable
            if getattr(coppa, "status", 0) == 0:
                lep = i18n.AvventuraNelCastelloJS.objects.cat.onFeed.lep
                finished = i18n.AvventuraNelCastelloJS.objects.cat.onFeed.finished
                output = "\n".join([lep] * 10 + finished)
                coppa.status = 1
                return output
            return getattr(coppa, "EMPTY", "")
        if "inventario.gatto.status=0" in source:
            cat = state.get("inventario", {}).get("gatto")
            if cat is None:
                return None
            cat.status = 0
            self._remove_from_inventory(state, cat)
            return ""
        if "objects.milkAndHoney.onDrink" in source:
            coppa = state.get("inventario", {}).get("coppaLattemiele")
            if coppa:
                if getattr(coppa, "status", 0) == 0:
                    coppa.status = 1
                    state["dati_avventura"].objects.latteMiele.bevuto = True
                    altri = state.get("altri_dati", {})
                    altri["golaSecca"] = False
                    state["altri_dati"] = altri
                    self._start_timed_event(state, "latteMiele")
                    return i18n.AvventuraNelCastelloJS.objects.milkAndHoney.onDrink.success
                return getattr(coppa, "EMPTY", "")
            return i18n.AvventuraNelCastelloJS.objects.milkAndHoney.onDrink.fail
        if "objects.milkAndHoney.onOffer" in source:
            room = self._current_room(state)
            cat = None
            if getattr(room, "objects", None) and "gatto" in room.objects:
                cat = room.objects["gatto"]
            if "gatto" in state.get("inventario", {}):
                cat = state["inventario"]["gatto"]
            if cat is not None and getattr(cat, "on", None):
                return self._try_resolve_placeholder(state, "objects.cat.onFeed", [])
            if getattr(room, "objects", None) and "fantasma" in room.objects:
                return i18n.AvventuraNelCastelloJS.objects.milkAndHoney.onOffer.toGhost
            if getattr(room, "objects", None) and "orco" in room.objects:
                return i18n.AvventuraNelCastelloJS.objects.milkAndHoney.onOffer.toOgre
            return i18n.AvventuraNelCastelloJS.objects.milkAndHoney.onOffer.toWho
        if "objects.bagpipe.onPlay" in source:
            room = self._current_room(state)
            if room.key != "cellaAlchimista":
                lines = i18n.AvventuraNelCastelloJS.objects.bagpipe.onPlay.fail
                return "\n".join(lines)
            volume = self._current_interactor(state, "volume")
            if volume and getattr(volume, "aperto", False):
                return self.thesaurus.default_messages["ANCORA"]
            self._add_points(state, "apertoVolume")
            if volume:
                volume.aperto = True
            return i18n.AvventuraNelCastelloJS.objects.bagpipe.onPlay.success
        if "objects.bone.onLookFor" in source:
            if "osso" in state.get("inventario", {}):
                return i18n.AvventuraNelCastelloJS.objects.bone.onLookFor.inYourHand
            return i18n.AvventuraNelCastelloJS.objects.bone.onLookFor.dontHaveIt
        if "objects.horn.onPlay" in source:
            room = self._current_room(state)
            if room.key == "cimaTorre":
                self._add_points(state, "presoDaAquila")
                return self._run_sequence(state, "aquila")
            if room.key == "scoglio":
                return self._run_sequence(state, "finale")
            return i18n.AvventuraNelCastelloJS.objects.horn.onPlay
        if "objects.sword.onLook" in source:
            if "spada" in state.get("inventario", {}):
                state["inventario"]["spada"].status = 1
                self._add_points(state, "vistoSortilegio")
                return i18n.AvventuraNelCastelloJS.objects.sword.onLook
            return None
        if "objects.sword.spell" in source:
            return self._resolve_spell(state, prefix=False)
        if "objects.spell.onLook" in source:
            if "spada" in state.get("inventario", {}) and getattr(state["inventario"]["spada"], "status", 0) == 1:
                return i18n.AvventuraNelCastelloJS.objects.spell.onLook
            return self.thesaurus.default_messages["QUI_NON_NE_VEDO"]
        if "objects.cushion.onLiftUp" in source:
            cuscino = state["dati_avventura"].objects.cuscino
            if cuscino.posizione != "salaTrono":
                return i18n.Thesaurus.verbs.liftUp.defaultMessage
            self._discover(state, state["dati_avventura"].objects.astuccio)
            self._add_points(state, "trovatoAstuccio")
            return i18n.AvventuraNelCastelloJS.objects.cushion.onLiftUp
        if "stanzaCorrente.objects.cuscino.on['alza|spingi']" in source:
            return self._try_resolve_placeholder(state, "objects.cushion.onLiftUp", [])
        if "objects.case.onOpen" in source:
            self._discover(state, state["dati_avventura"].objects.pergamena)
            self._add_points(state, "trovataPergamena")
            return i18n.AvventuraNelCastelloJS.objects.case.onOpen
        if "objects.scroll.onRead" in source:
            if "pergamena" not in state.get("inventario", {}):
                return i18n.AvventuraNelCastelloJS.objects.scroll.onRead.dontHaveIt
            return i18n.AvventuraNelCastelloJS.objects.scroll.onRead.fail
        if "objects.scroll.onTranslate" in source:
            dizionario = self._current_interactor(state, "dizionario")
            if dizionario and getattr(dizionario, "visibile", True) is not False:
                self._add_points(state, "tradottaPergamena")
                state["dati_avventura"].objects.pergamena.tradotta = True
                return "\n".join(i18n.AvventuraNelCastelloJS.objects.scroll.onTranslate.success)
            return i18n.AvventuraNelCastelloJS.objects.scroll.onTranslate.fail
        if "objects.sheet.onRead" in source:
            if "foglio" not in state.get("inventario", {}):
                return i18n.AvventuraNelCastelloJS.objects.sheet.onRead.dontHaveIt
            altri = state.get("altri_dati", {})
            iotaid = altri.get("iotaid", {})
            iotaid["iota"] = True
            altri["iotaid"] = iotaid
            state["altri_dati"] = altri
            self._add_points(state, "lettoIota")
            return i18n.AvventuraNelCastelloJS.objects.sheet.onRead.success
        if "objects.ogre.onLook" in source:
            lines = i18n.AvventuraNelCastelloJS.objects.ogre.onLook
            return "\n".join(lines)
        if "objects.ogre.onTalkOrGreet" in source:
            return i18n.AvventuraNelCastelloJS.objects.ogre.onTalkOrGreet
        if "objects.dwarf.onGreet" in source:
            diamante = state["dati_avventura"].objects.diamante
            if getattr(diamante, "visibile", False):
                return i18n.AvventuraNelCastelloJS.objects.dwarf.onGreet.withoutDiamond
            self._discover(state, diamante)
            nano = state["dati_avventura"].objects.nano
            nano.status = 1
            self._add_points(state, "salutatoNano")
            return i18n.AvventuraNelCastelloJS.objects.dwarf.onGreet.withDiamond
        if "objects.dwarf.onKill" in source:
            output = "\n".join(i18n.AvventuraNelCastelloJS.objects.dwarf.onKill)
            return self._merge_output(output, self._die(state))
        if "objects.diamond.MINE" in source and "objects.diamond.onBreak" not in source:
            nano = state["dati_avventura"].objects.nano
            if getattr(nano, "status", 0) == 0:
                return i18n.AvventuraNelCastelloJS.objects.diamond.MINE
            diamante = state["dati_avventura"].objects.diamante
            self._add_to_inventory(state, diamante)
            self._add_points(state, "presoDiamante")
            return self.thesaurus.default_messages["FATTO"]
        if "objects.diamond.onBreak" in source:
            nano = state["dati_avventura"].objects.nano
            if getattr(nano, "status", 0) == 0:
                return i18n.AvventuraNelCastelloJS.objects.diamond.MINE
            if "mazza" not in state.get("inventario", {}):
                return i18n.AvventuraNelCastelloJS.objects.diamond.onBreak.needSomethingHard
            state["inventario"].pop("diamante", None)
            state["dati_avventura"].objects.diamante.posizione = None
            chiave = state["dati_avventura"].objects.chiave
            chiave.posizione = state["stanza_corrente"]
            self._discover(state, chiave)
            self._add_points(state, "trovataChiave")
            return i18n.AvventuraNelCastelloJS.objects.diamond.onBreak.success
        if "objects.diamond.onLook" in source:
            diamante = state["dati_avventura"].objects.diamante
            if getattr(diamante, "visibile", False):
                return i18n.AvventuraNelCastelloJS.objects.diamond.onLook
            return None
        if "apertoPortone" in source and "GIA_APERTO" in source:
            portone = self._current_interactor(state, "portone")
            if portone and getattr(portone, "status", 0) == 0:
                portone.status = 1
                self._add_points(state, "apertoPortone")
                return self.thesaurus.default_messages["FATTO"]
            return self.thesaurus.default_messages["GIA_APERTO"]
        if "interactors.portone.status == 1" in source and "return this.Thesaurus.defaultMessages.FATTO" in source:
            portone = self._current_interactor(state, "portone")
            if portone and getattr(portone, "status", 0) == 1:
                portone.status = 0
                return self.thesaurus.default_messages["FATTO"]
            return i18n.AvventuraNelCastelloJS.rooms.paradeGround.interactors.doorway.onClose
        if "rooms.plane.verbs.jump" in source and "runSequence(\"volo\")" in source and "runSequence(\"saltoAereo\")" in source:
            target = args[0] if args else None
            paracadute_obj = state["dati_avventura"].objects.paracadute
            have_paracadute = "paracadute" in state["inventario"] or any(
                item is paracadute_obj or getattr(item, "key", None) == "paracadute"
                for item in state["inventario"].values()
            )
            if target is not None and target == paracadute_obj and not have_paracadute:
                return i18n.AvventuraNelCastelloJS.rooms.plane.verbs.jump
            if not have_paracadute:
                return self._run_sequence(state, "volo")
            self._add_points(state, "saltoAereo")
            return self._run_sequence(state, "saltoAereo")
        if "rooms.plane.verbs.look" in source and "inventario.paracadute" in source:
            target = args[0] if args else None
            if target == state["dati_avventura"].objects.paracadute and "paracadute" in state["inventario"]:
                return state["inventario"]["paracadute"].on.guarda
            return i18n.AvventuraNelCastelloJS.rooms.plane.verbs.look
        if "objects.parachute.onWear" in source and "runSequence(\"paracadute\")" in source:
            if "paracadute" in state["inventario"]:
                return i18n.AvventuraNelCastelloJS.objects.parachute.onWear
            if state["stanza_corrente"] == "aereo":
                return self._run_sequence(state, "paracadute")
            return None
        if "objects.parachute.onOpen.notHere" in source and "objects.parachute.onOpen.dontHaveIt" in source:
            if "paracadute" in state["inventario"]:
                return i18n.AvventuraNelCastelloJS.objects.parachute.onOpen.notHere
            return i18n.AvventuraNelCastelloJS.objects.parachute.onOpen.dontHaveIt
        if "this.runSequence(\"paracadute\")" in source:
            return self._run_sequence(state, "paracadute")
        if "this.runSequence(\"intro\")" in source:
            return self._run_sequence(state, "intro")
        if "this.runSequence(\"volo\")" in source:
            return self._run_sequence(state, "volo")
        if "this.runSequence(\"saltoAereo\")" in source:
            return self._run_sequence(state, "saltoAereo")
        if "this.stopTimedEvent(\"aereo\")" in source:
            self._stop_timed_event(state, "aereo")
            return None
        if "this.startTimedEvent(\"aereo\")" in source:
            self._start_timed_event(state, "aereo")
            return None
        if "this.startTimedEvent(\"nessie\")" in source:
            self._start_timed_event(state, "nessie")
            return None
        if "this.die()" in source:
            return self._die(state)
        if "rooms.plane.commands.help" in source:
            return "\n".join(i18n.AvventuraNelCastelloJS.rooms.plane.commands.help)
        if "rooms.plane.verbs.jump" in source:
            return i18n.AvventuraNelCastelloJS.rooms.plane.verbs.jump
        if "rooms.plane.verbs.look" in source:
            return i18n.AvventuraNelCastelloJS.rooms.plane.verbs.look
        if "rooms.plane.verbs.land" in source:
            return i18n.AvventuraNelCastelloJS.rooms.plane.verbs.land
        if "rooms.plane.interactors.cloche.onPullOrPush" in source:
            return "\n".join(i18n.AvventuraNelCastelloJS.rooms.plane.interactors.cloche.onPullOrPush)
        move_match = __import__("re").search(r'_vai\\?\\(\"([a-z])\"\\)', source)
        if move_match:
            direction = move_match.group(1)
            default_msg = self._resolve_thesaurus_default(source)
            return self._move(state, direction, default_msg)[1]

        i18n_match = __import__("re").search(r"i18n\\.([A-Za-z0-9_\\.]+)", source)
        if i18n_match:
            path = i18n_match.group(1)
            resolved = self._resolve_path(i18n, path)
            if resolved is not None:
                if isinstance(resolved, list):
                    return "\n".join(resolved)
                return resolved

        room_match = __import__("re").search(r"stanzaCorrente\\.interactors\\.([A-Za-z0-9_]+)\\.description", source)
        if room_match:
            key = room_match.group(1)
            room = self._current_room(state)
            return getattr(room.interactors.get(key), "description", None)

        return None

    def _resolve_thesaurus_default(self, source: str) -> str:
        match = __import__("re").search(r"Thesaurus\\.commands\\.([A-Za-z0-9_]+)\\.defaultMessage", source)
        if match:
            key = match.group(1)
            command = self.thesaurus.commands.get(key)
            if command:
                return command.get("defaultMessage")
        return self.thesaurus.default_messages["NON_HO_CAPITO"]

    def _resolve_path(self, root: Any, path: str) -> Any:
        current = root
        for part in path.split("."):
            if hasattr(current, part):
                current = getattr(current, part)
            elif isinstance(current, dict) and part in current:
                current = current[part]
            else:
                return None
        return current

    def _merge_output(self, prefix: str, output: str) -> str:
        if prefix and output:
            return f"{prefix}\n{output}"
        return prefix or output or ""

    def _handle_room_enter(self, state: Dict) -> str:
        room = self._current_room(state)
        on_enter = getattr(room, "onEnter", None)
        if on_enter:
            return self._call_action(state, on_enter, []) or ""
        return ""

    def _handle_room_exit(self, state: Dict) -> None:
        room = self._current_room(state)
        on_exit = getattr(room, "onExit", None)
        if on_exit:
            self._call_action(state, on_exit, [])

    def _run_sequence(self, state: Dict, name: str, args: List[Any] | None = None) -> str:
        if args is not None:
            state["last_subjects"] = args
        if name == "intro":
            self._start_timed_event(state, "aereo")
            return "\n".join(i18n.AvventuraNelCastelloJS.sequences.intro)
        if name == "prologo":
            return "\n".join(i18n.AvventuraNelCastelloJS.sequences.prologue)
        if name == "paracadute":
            if state["inventario"].get("paracadute") is None:
                obj = state["dati_avventura"].objects.paracadute
                self._add_to_inventory(state, obj)
                self._add_points(state, "paracaduteIndossato")
                return "\n".join(i18n.AvventuraNelCastelloJS.sequences.parachute)
            return self.thesaurus.default_messages.get("GIA_ADDOSSO", "")
        if name == "volo":
            output = "\n".join(i18n.AvventuraNelCastelloJS.sequences.fly.string)
            death = self._die(state)
            return self._merge_output(output, death)
        if name == "saltoAereo":
            output = "\n".join(i18n.AvventuraNelCastelloJS.sequences.jumpFromPlane)
            room_output = self._enter_room(state, "piazzaArmi", show_full=True)
            return self._merge_output(output, room_output)
        if name == "ritratti":
            lines = i18n.AvventuraNelCastelloJS.sequences.portrait
            output = "\n".join(lines)
            room_output = self._enter_room(state, "salaSpecchi", show_full=True)
            return self._merge_output(output, room_output)
        if name == "braccio":
            question = i18n.AvventuraNelCastelloJS.sequences.arm.question
            state["pending_question"] = {"type": "braccio"}
            return question
        if name == "segretaCastello":
            return self._sequence_segreta_castello(state)
        if name == "aquila":
            lines = i18n.AvventuraNelCastelloJS.sequences.eagle
            output = "\n".join(lines)
            if "paracadute" in state.get("inventario", {}):
                follow = self._run_sequence(state, "scoglio")
            else:
                follow = self._run_sequence(state, "ancora")
            return self._merge_output(output, follow)
        if name == "scoglio":
            lines = i18n.AvventuraNelCastelloJS.sequences.rock
            output = "\n".join(lines)
            room_output = self._enter_room(state, "scoglio", show_full=True)
            return self._merge_output(output, room_output)
        if name == "ancora":
            lines = i18n.AvventuraNelCastelloJS.sequences.again.string
            output = "\n".join(lines)
            return self._merge_output(output, self._die(state))
        if name == "finale":
            lines = i18n.AvventuraNelCastelloJS.sequences.final
            state["game_over"] = True
            return "\n".join(lines)
        if name == "mangia":
            lines = i18n.AvventuraNelCastelloJS.sequences.eat
            return "\n".join(lines)
        return ""

    def _start_timed_event(self, state: Dict, name: str) -> None:
        active = state.get("timed_events", [])
        if name not in active:
            active.append(name)
        state["timed_events"] = active
        counters = state.get("timed_event_steps", {})
        event = state["dati_avventura"].timedEvents.get(name)
        counters[name] = getattr(event, "start", 0) if event else 0
        state["timed_event_steps"] = counters

    def _stop_timed_event(self, state: Dict, name: str) -> None:
        active = state.get("timed_events", [])
        if name in active:
            active.remove(name)
        state["timed_events"] = active
        counters = state.get("timed_event_steps", {})
        counters.pop(name, None)
        state["timed_event_steps"] = counters

    def _tick_timed_events(self, state: Dict) -> str:
        outputs = []
        active = list(state.get("timed_events", []))
        counters = state.get("timed_event_steps", {})
        for name in active:
            step = counters.get(name, 0)
            if step <= 0:
                outputs.append(self._handle_timed_limit(state, name))
                self._stop_timed_event(state, name)
                continue
            outputs.append(self._handle_timed_step(state, name, step))
            counters[name] = step - 1
        state["timed_event_steps"] = counters
        return "\n".join([o for o in outputs if o])

    def _handle_timed_step(self, state: Dict, name: str, step: int) -> str:
        if name == "aereo":
            if step == 3:
                return i18n.AvventuraNelCastelloJS.timedEvents.plane[0]
            if step == 2:
                return i18n.AvventuraNelCastelloJS.timedEvents.plane[1]
            if step == 1:
                return i18n.AvventuraNelCastelloJS.timedEvents.plane[2]
        if name == "nessie":
            if step == 2:
                return i18n.AvventuraNelCastelloJS.timedEvents.nessie[0]
            if step == 1:
                return i18n.AvventuraNelCastelloJS.timedEvents.nessie[1]
        if name == "whisky":
            if step == 1:
                if self._random_int_inclusive(1, 3) == 1:
                    return i18n.AvventuraNelCastelloJS.timedEvents.whiskey
        return ""

    def _handle_timed_limit(self, state: Dict, name: str) -> str:
        if name == "aereo":
            output = i18n.AvventuraNelCastelloJS.timedEvents.plane[3]
            return self._merge_output(output, self._die(state))
        if name == "nessie":
            lines = i18n.AvventuraNelCastelloJS.timedEvents.nessie
            output = "\n".join([lines[2], lines[3]])
            return self._merge_output(output, self._die(state))
        if name == "latteMiele":
            altri = state.get("altri_dati", {})
            altri["golaSecca"] = True
            state["altri_dati"] = altri
            return ""
        return ""

    def _add_points(self, state: Dict, action: str) -> None:
        punti = getattr(state.get("dati_punti"), "puntiAzione", None)
        if punti is None:
            return
        altri = state.get("altri_dati")
        if altri.get("puntiAzioneGiocati") is None:
            altri["puntiAzioneGiocati"] = []
        if action in altri["puntiAzioneGiocati"]:
            return
        altri["puntiAzioneGiocati"].append(action)
        value = punti[action]["i"] if isinstance(punti[action], dict) else punti[action].i
        altri["punti"] = altri.get("punti", 0) + value

    def _die(self, state: Dict) -> str:
        state["game_over"] = True
        return i18n.IFEngine.messages.death

    def _resolve_override_patterns(self, state: Dict, override: Any) -> Dict:
        if not override:
            return {}
        resolved = {}
        for key, entry in override.items():
            if isinstance(entry, dict):
                inner = {}
                for inner_key, inner_val in entry.items():
                    if inner_key == "pattern" and isinstance(inner_val, FunctionPlaceholder):
                        pattern = self._resolve_override_pattern(state, inner_val.source)
                        inner[inner_key] = pattern or inner_val
                    else:
                        inner[inner_key] = inner_val
                resolved[key] = inner
            else:
                resolved[key] = entry
        return resolved

    def _resolve_override_pattern(self, state: Dict, source: str) -> Any:
        say = i18n.AvventuraNelCastelloJSEngine.commonPatterns.say
        if "Thesaurus.verbs.ciao.pattern" in source:
            greeting = self.thesaurus.verbs["ciao"]["pattern"]
        elif "Thesaurus.verbs.buongiorno.pattern" in source:
            greeting = self.thesaurus.verbs["buongiorno"]["pattern"]
        else:
            return None
        nano_pattern = state["dati_avventura"].objects.nano.pattern
        return f"(?:{say})?{greeting}( {nano_pattern})?"

    def _resolve_spell(self, state: Dict, prefix: bool) -> str:
        spada = state["dati_avventura"].objects.spada
        inv_spada = state.get("inventario", {}).get("spada")
        if inv_spada is None:
            if getattr(spada, "status", 0) == 0:
                return i18n.AvventuraNelCastelloJS.objects.sword.spell.dontKnow
            return i18n.AvventuraNelCastelloJS.objects.sword.spell.dontRemember
        if getattr(inv_spada, "status", 0) == 0:
            return i18n.AvventuraNelCastelloJS.objects.sword.spell.dontKnow
        pre = "\n" if prefix else ""
        fantasma = self._current_interactor(state, "fantasma")
        if fantasma is not None and getattr(fantasma, "visibile", False):
            if state.get("altri_dati", {}).get("golaSecca"):
                output = "\n".join(i18n.AvventuraNelCastelloJS.objects.sword.spell.fail)
                return self._merge_output(pre + output, self._die(state))
            fantasma.neutralizzato = True
            fantasma.visibile = False
            self._add_points(state, "eliminatoFantasma")
            return pre + i18n.AvventuraNelCastelloJS.objects.sword.spell.success
        return pre + self.thesaurus.default_messages["NON_SUCCEDE_NIENTE"]

    def _handle_bigmeow(self, state: Dict) -> str:
        altri = state.get("altri_dati", {})
        bigmeow = altri.get("bigmeow", {})
        if not bigmeow.get("attivo", False):
            return self.thesaurus.default_messages["NON_CONOSCI"]
        room = self._current_room(state)
        has_cat = "gatto" in state.get("inventario", {})
        if getattr(room, "objects", None) and "gatto" in room.objects:
            has_cat = True
        if not has_cat:
            return self.thesaurus.default_messages["NON_SUCCEDE_NIENTE"]
        prelude = i18n.AvventuraNelCastelloJSEngine.commands.bigmeow.defaultMessage.prelude
        output = "\n".join(prelude)
        if getattr(room, "objects", None) and "orco" in room.objects:
            success = i18n.AvventuraNelCastelloJSEngine.commands.bigmeow.defaultMessage.success
            state["inventario"].pop("gatto", None)
            state["dati_avventura"].objects.gatto.posizione = None
            state["dati_avventura"].objects.orco.posizione = None
            self._add_points(state, "eliminatoOrco")
            self._refresh_room_objects(state)
            return self._merge_output(output, "\n".join(success))
        fail = i18n.AvventuraNelCastelloJSEngine.commands.bigmeow.defaultMessage.fail
        return self._merge_output(self._merge_output(output, fail), self._die(state))

    def _random_int_inclusive(self, min_value: int, max_value: int) -> int:
        import random

        return random.randint(min_value, max_value)

    def _handle_pending_question(self, state: Dict, input_text: str) -> str:
        pending = state.get("pending_question")
        if not pending:
            return ""
        normalized = input_text.strip().lower()
        yes = i18n.IFEngine.yesOrNo.yes
        no = i18n.IFEngine.yesOrNo.no
        if normalized not in {yes, no}:
            return f"{yes}/{no}?"
        state["pending_question"] = None
        if pending["type"] == "braccio":
            if normalized == yes:
                lines = i18n.AvventuraNelCastelloJS.sequences.arm.answer
                output = "\n".join(lines)
                return self._merge_output(output, self._die(state))
            return ""
        if pending["type"] == "picche":
            if normalized == yes:
                lines = i18n.AvventuraNelCastelloJS.rooms.hallway.interactors.spades.onTake.answer
                output = "\n".join(lines)
                return self._merge_output(output, self._die(state))
            return ""
        if pending["type"] == "ritratti":
            if normalized == yes:
                return self._run_sequence(state, "ritratti")
            return ""
        if pending["type"] == "trono_sit":
            if normalized == yes:
                return self._try_resolve_placeholder(state, "rooms.throneRoom.interactors.throne.onSitDown.answer", [])
            return ""
        if pending["type"] == "sortilegio":
            if normalized == yes:
                return self._resolve_spell(state, prefix=True)
            return ""
        if pending["type"] == "dining_down":
            if normalized == yes:
                return i18n.AvventuraNelCastelloJS.rooms.diningRoom.interactors.window.onJump
            return ""
        if pending["type"] == "whiskey_keg":
            if normalized == yes:
                return self._try_resolve_placeholder(
                    state, "rooms.whiskeyPantry.interactors.whiskey.onTakeOrDrink", []
                )
            return ""
        if pending["type"] == "quit":
            if normalized == yes:
                output = i18n.AvventuraNelCastelloJSEngine.commands.stop.defaultMessage
                points = self._points_text(state)
                state["game_over"] = True
                return self._merge_output(output, points)
            return ""
        return ""

    def _points_text(self, state: Dict) -> str:
        punti_data = state.get("dati_punti")
        if not punti_data or getattr(punti_data, "puntiAzione", None) is None:
            return i18n.IFEngine.messages.noPoints
        punti = state.get("altri_dati", {}).get("punti", 0)
        max_points = getattr(punti_data, "puntiMax", 0)
        points_msg = i18n.AvventuraNelCastelloJSEngine.messages.points(punti, max_points)
        livello = None
        punti_level = getattr(punti_data, "puntiLevel", {})
        for threshold, label in punti_level.items():
            try:
                if punti <= int(threshold):
                    livello = label
                    break
            except Exception:
                continue
        if livello is None and punti_level:
            livello = list(punti_level.values())[-1]
        lines = [points_msg]
        title_prefix = i18n.AvventuraNelCastelloJSEngine.prefixLabels.title
        if title_prefix:
            lines.append(title_prefix)
        if livello:
            lines.append(str(livello).upper())
            if (
                hasattr(i18n.AvventuraNelCastelloJSEngine, "pointsLabel")
                and len(i18n.AvventuraNelCastelloJSEngine.pointsLabel) > 7
                and livello == i18n.AvventuraNelCastelloJSEngine.pointsLabel[6]
            ):
                lines.append(i18n.AvventuraNelCastelloJSEngine.pointsLabel[7])
        return "\n".join(lines)

    def _moves_text(self, state: Dict) -> str:
        turns = int(state.get("turns", 0))
        return i18n.AvventuraNelCastelloJSEngine.commands.moves.defaultMessage(turns)

    def _inventory_text(self, state: Dict) -> str:
        inventory = state.get("inventario", {})
        if not inventory:
            return i18n.IFEngine.messages.noObjects
        lines = [f"* {i18n.IFEngine.messages.carriedObjectsLabel} *"]
        for item in inventory.values():
            label = getattr(item, "label", None)
            status = getattr(item, "status", 0)
            if isinstance(label, list):
                label = label[status] if status < len(label) else label[-1]
            if not label:
                label = getattr(item, "key", "")
            lines.append(f"- {str(label).strip()}.")
        return "\n".join(lines)

    def _instructions_text(self) -> str:
        instructions = i18n.AvventuraNelCastelloJSEngine.instructions
        if not instructions:
            return i18n.IFEngine.messages.noInstructions
        return "\n".join(instructions)

    def _sequence_segreta_castello(self, state: Dict) -> str:
        if not state.get("last_subjects"):
            return self.thesaurus.default_messages["NON_HO_CAPITO"]
        subjects = state["last_subjects"]
        cosa = subjects[0] if len(subjects) > 0 else None
        target = subjects[1] if len(subjects) > 1 else self._current_interactor(state, "foro")
        braccio = self._current_interactor(state, "braccio")
        foro = self._current_interactor(state, "foro")
        if cosa is braccio and target is foro:
            return self._run_sequence(state, "braccio")
        osso = state["inventario"].get("osso")
        if cosa is osso and target is foro:
            if getattr(osso, "status", 0) == 0:
                osso.status = 1
                self._add_points(state, "apertaFessura")
                lines = i18n.AvventuraNelCastelloJS.sequences.castleDungeon.success
                fessura = self._current_interactor(state, "fessura")
                if fessura:
                    fessura.visibile = True
                self._enable_direction(state, "o")
                return "\n".join(lines)
            return self.thesaurus.default_messages["ANCORA"]
        if cosa is None or state["inventario"].get(getattr(cosa, "key", "")) is None:
            return None
        return i18n.AvventuraNelCastelloJS.sequences.castleDungeon.fail

    def _enable_direction(self, state: Dict, direction: str) -> None:
        room = self._current_room(state)
        blocked = getattr(room, "unavaiableDirections", None)
        if blocked and direction in blocked:
            blocked.remove(direction)

    def _serialize_value(self, value: Any) -> Any:
        if isinstance(value, FunctionPlaceholder):
            return {"__fn__": True, "source": value.source}
        if isinstance(value, set):
            return list(value)
        if isinstance(value, dict):
            return {key: self._serialize_value(val) for key, val in value.items()}
        if isinstance(value, list):
            return [self._serialize_value(val) for val in value]
        if hasattr(value, "__dict__") and not isinstance(value, str):
            return {key: self._serialize_value(val) for key, val in value.__dict__.items()}
        return value

    def _deserialize_value(self, value: Any) -> Any:
        if isinstance(value, dict) and value.get("__fn__"):
            return FunctionPlaceholder(value.get("source", ""))
        if isinstance(value, dict):
            return AttrDict({key: self._deserialize_value(val) for key, val in value.items()})
        if isinstance(value, list):
            return [self._deserialize_value(val) for val in value]
        return value
