import re
import secrets

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field

from . import db
from .engine import GameEngine
from .game.i18n import i18n


app = FastAPI(title="Avventura nel Castello API", version="0.1.0")
engine = GameEngine()


class RegisterRequest(BaseModel):
    playerName: str = Field(..., min_length=1, max_length=64)


class PlayRequest(BaseModel):
    playerKey: str = Field(..., min_length=1, max_length=128)
    input: str = Field(..., min_length=0, max_length=1024)


class PlayResponse(BaseModel):
    output: str


@app.on_event("startup")
def startup() -> None:
    db.init_db()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


def _generate_player_key() -> str:
    return "castello-" + secrets.token_urlsafe(40)


@app.post("/register")
def register(payload: RegisterRequest) -> dict:
    player = db.get_player(payload.playerName)
    if player is not None:
        raise HTTPException(status_code=409, detail="player name not available")
    player_key = _generate_player_key()
    try:
        player = db.create_player(payload.playerName, player_key)
    except Exception:
        raise HTTPException(status_code=409, detail="player name not available")
    return {"status": "created", "playerName": player["name_display"], "playerKey": player_key}


@app.post("/play", response_model=PlayResponse)
def play(payload: PlayRequest, request: Request) -> PlayResponse:
    player = db.get_player_by_key(payload.playerKey)
    if player is None:
        raise HTTPException(status_code=401, detail="Invalid player key.")

    client_host = request.client.host if request.client else "unknown"
    input_text = payload.input.strip()

    if player["status"] == "NOT_PLAYING":
        output = _handle_menu(player, input_text, client_host)
        db.log_interaction(player["id"], None, input_text, output)
        return PlayResponse(output=output)

    session = db.get_active_session(player["id"])
    if session is None:
        state, _ = engine.start_game()
        session = db.create_session(player["id"], client_host, engine.serialize_state(state))
    elif session["client_host"] != client_host:
        raise HTTPException(status_code=409, detail="Player already active from another client.")

    if session.get("pending_action") == "SAVE_LABEL":
        output = _handle_save_label(session, player, input_text, client_host)
        db.log_interaction(player["id"], session["id"], input_text, output)
        return PlayResponse(output=output)
    if session.get("pending_action") == "LOAD_SELECT":
        output = _handle_load_selection(session, player, input_text, client_host)
        db.log_interaction(player["id"], session["id"], input_text, output)
        return PlayResponse(output=output)

    if not input_text:
        output = engine.help_text()
        db.log_interaction(player["id"], session["id"], input_text, output)
        return PlayResponse(output=output)

    upper = input_text.upper()
    if _matches_command(i18n.AvventuraNelCastelloJSEngine.commands.save.pattern, input_text):
        name = _strip_command_prefix(i18n.AvventuraNelCastelloJSEngine.commands.save.pattern, input_text)
        if not name:
            db.update_session(
                session["id"],
                session["state"],
                client_host,
                pending_action="SAVE_LABEL",
                pending_payload=None,
            )
            output = i18n.IFEngine.questions.saveLabel
            db.log_interaction(player["id"], session["id"], input_text, output)
            return PlayResponse(output=output)
        db.create_save(player["id"], name, session["state"])
        output = i18n.IFEngine.messages.saved
        db.log_interaction(player["id"], session["id"], input_text, output)
        return PlayResponse(output=output)
    if _matches_command(i18n.AvventuraNelCastelloJSEngine.commands.load.pattern, input_text):
        saves = db.list_saves(player["id"])
        if not saves:
            output = "Nessun salvataggio disponibile."
            db.log_interaction(player["id"], session["id"], input_text, output)
            return PlayResponse(output=output)
        db.update_session(
            session["id"],
            session["state"],
            client_host,
            pending_action="LOAD_SELECT",
            pending_payload={"count": len(saves)},
        )
        lines = ["Salvataggi disponibili:"]
        for idx, save in enumerate(saves, start=1):
            label = save["name"] if save["name"] else f"Salvataggio {idx}"
            lines.append(f"({idx}) {label}")
        lines.append("Seleziona il numero del salvataggio:")
        output = "\n".join(lines)
        db.log_interaction(player["id"], session["id"], input_text, output)
        return PlayResponse(output=output)
    if upper.startswith("QUIT"):
        db.deactivate_session(session["id"])
        db.update_player_status(player["id"], "NOT_PLAYING")
        output = "Grazie per aver giocato. Ciao! :)"
        db.log_interaction(player["id"], session["id"], input_text, output)
        return PlayResponse(output=output)

    current_state = engine.deserialize_state(session["state"])
    new_state, output = engine.process(current_state, input_text)
    if new_state.get("game_over"):
        db.deactivate_session(session["id"])
        db.update_player_status(player["id"], "NOT_PLAYING")
    session = db.update_session(session["id"], engine.serialize_state(new_state), client_host)
    db.log_interaction(player["id"], session["id"], input_text, output)
    return PlayResponse(output=output)


def _handle_menu(player: dict, input_text: str, client_host: str) -> str:
    pending = player.get("pending_action")
    if pending == "LOAD_SELECT":
        selection = input_text.strip()
        if not selection.isdigit():
            return "Selezione non valida."
        saved_state = db.get_save_by_number(player["id"], int(selection))
        if saved_state is None:
            return "Salvataggio non trovato."
        db.set_player_pending(player["id"], None, None)
        db.update_player_status(player["id"], "PLAYING")
        db.create_session(player["id"], client_host, saved_state)
        return "Dati caricati..."

    if not input_text or input_text.upper() in {"MENU", "HELP", "AIUTO"}:
        return engine.menu_text()

    command = input_text.strip().upper()
    if command in {"1", "START_GAME", "START"}:
        state, output = engine.start_game()
        db.deactivate_sessions_for_player(player["id"])
        db.update_player_status(player["id"], "PLAYING")
        db.create_session(player["id"], client_host, engine.serialize_state(state))
        return output
    if command in {"2", "LOAD_GAME", "LOAD"}:
        saves = db.list_saves(player["id"])
        if not saves:
            return "Nessun salvataggio disponibile."
        db.set_player_pending(player["id"], "LOAD_SELECT", {"count": len(saves)})
        lines = ["Salvataggi disponibili:"]
        for idx, save in enumerate(saves, start=1):
            label = save["name"] if save["name"] else f"Salvataggio {idx}"
            lines.append(f"({idx}) {label}")
        lines.append("Seleziona il numero del salvataggio:")
        return "\n".join(lines)
    if command in {"3", "DELETE_SAVED_GAME", "DELETE"}:
        deleted = db.delete_all_saves(player["id"])
        return f"Salvataggi cancellati: {deleted}."
    if command in {"4", "GET_HELP", "HELP"}:
        return engine.help_text()
    if command in {"5", "QUIT"}:
        return "Grazie per aver giocato. Ciao! :)"
    return engine.menu_text()


def _handle_load_selection(session: dict, player: dict, input_text: str, client_host: str) -> str:
    selection = input_text.strip()
    if not selection.isdigit():
        return "Selezione non valida."
    saved_state = db.get_save_by_number(player["id"], int(selection))
    if saved_state is None:
        return "Salvataggio non trovato."
    db.update_session(
        session["id"],
        saved_state,
        client_host,
        pending_action=None,
        pending_payload=None,
    )
    return "Dati caricati..."


def _handle_save_label(session: dict, player: dict, input_text: str, client_host: str) -> str:
    label = input_text.strip()
    cancel = i18n.IFEngine.questions.cancelLetter.lower()
    if label.lower() == cancel:
        db.update_session(
            session["id"],
            session["state"],
            client_host,
            pending_action=None,
            pending_payload=None,
        )
        return ""
    if not label:
        return i18n.IFEngine.questions.saveLabel
    db.create_save(player["id"], label, session["state"])
    db.update_session(
        session["id"],
        session["state"],
        client_host,
        pending_action=None,
        pending_payload=None,
    )
    return i18n.IFEngine.messages.saved


def _matches_command(pattern: str, input_text: str) -> bool:
    return re.match(rf"^{pattern}(\\s|$)", input_text.strip(), re.IGNORECASE) is not None


def _strip_command_prefix(pattern: str, input_text: str) -> str:
    match = re.match(rf"^{pattern}(\\s|$)", input_text.strip(), re.IGNORECASE)
    if not match:
        return ""
    return input_text.strip()[match.end() :].strip()


@app.get("/dashboard", response_class=HTMLResponse)
def dashboard() -> str:
    return """
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Castello Dashboard</title>
  <style>
    body { font-family: sans-serif; margin: 1.5rem; }
    h1 { margin-bottom: 0.5rem; }
    button { margin: 0.5rem 0 1rem; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 1.5rem; }
    th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
    .muted { color: #666; font-size: 0.9rem; }
  </style>
</head>
<body>
  <h1>Live Sessions</h1>
  <p class="muted">Updated on each client interaction. Use refresh to pull now.</p>
  <button onclick="loadData()">Refresh</button>
  <div id="sessions"></div>
  <div id="interactions"></div>
  <script>
    async function loadData() {
      const res = await fetch('/dashboard/data');
      const data = await res.json();
      renderSessions(data.sessions);
      renderInteractions(data.interactions);
    }
    function renderSessions(items) {
      if (!items.length) { document.getElementById('sessions').innerHTML = '<p>No active sessions.</p>'; return; }
      let html = '<table><tr><th>Player</th><th>Session</th><th>Last Activity</th><th>Client</th></tr>';
      for (const row of items) {
        html += `<tr><td>${row.playerName}</td><td>${row.sessionId}</td><td>${row.lastActivity}</td><td>${row.clientHost}</td></tr>`;
      }
      html += '</table>';
      document.getElementById('sessions').innerHTML = html;
    }
    function renderInteractions(items) {
      if (!items.length) { document.getElementById('interactions').innerHTML = '<p>No interactions yet.</p>'; return; }
      let html = '<table><tr><th>Time</th><th>Player</th><th>Input</th><th>Output</th></tr>';
      for (const row of items) {
        html += `<tr><td>${row.createdAt}</td><td>${row.playerName}</td><td>${row.input}</td><td>${row.output}</td></tr>`;
      }
      html += '</table>';
      document.getElementById('interactions').innerHTML = html;
    }
    loadData();
  </script>
</body>
</html>
"""


@app.get("/dashboard/data")
def dashboard_data() -> dict:
    sessions = db.list_active_sessions()
    interactions = db.list_interactions(limit=50)
    return {"sessions": sessions, "interactions": interactions}
