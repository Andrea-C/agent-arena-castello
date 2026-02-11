"""
Castello Game API Tools

These tools wrap the Castello game server REST API, allowing an ADK agent
to register, play, and check status in the text adventure game
"Avventura nel Castello".

The player_key is stored in ADK session state after registration,
so subsequent calls (play, status) retrieve it automatically.

Player credentials are also persisted to a local JSON file so the agent
can resume a previous game across sessions.
"""

import json
import os
from datetime import datetime

import requests
from google.adk.tools import ToolContext

# Server URL - configurable via environment variable
BASE_URL = os.environ.get("CASTELLO_BASE_URL", "http://localhost:3000")

# Credentials file path - stored in the agents/ directory
_AGENTS_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_CREDENTIALS_FILE = os.path.join(_AGENTS_DIR, "player_credentials.json")


# --- Internal helpers for credential persistence ----------------------------

def _save_credentials(player_name: str, player_key: str) -> None:
    """Save player credentials to a local JSON file."""
    data = {
        "player_name": player_name,
        "player_key": player_key,
        "registered_at": datetime.now().isoformat(),
    }
    with open(_CREDENTIALS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)


def _load_credentials() -> dict | None:
    """Load player credentials from the local JSON file, if it exists and is populated."""
    if not os.path.exists(_CREDENTIALS_FILE):
        return None
    try:
        with open(_CREDENTIALS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        # Only return if both player_name and player_key are non-empty
        if data.get("player_name") and data.get("player_key"):
            return data
        return None
    except (json.JSONDecodeError, OSError):
        return None


# --- Game API Tools ---------------------------------------------------------

def castello_register(
    player_name: str,
    language: str = "it",
    tool_context: ToolContext = None,
) -> dict:
    """Register a new player in the Castello game server.

    Call this tool first, before playing. It creates a player account
    and returns a player_key that is used for all subsequent API calls.

    If a player was previously registered (credentials saved on disk),
    those credentials are loaded automatically — no new registration needed.

    Args:
        player_name (str): A unique name for the player.
        language (str): Language code for the game text. Options: "it" (Italian),
            "en" (English), "es" (Spanish). Defaults to "it".

    Returns:
        dict: Registration result with player_key, or error information.
    """
    # Check if we already have credentials saved on disk
    saved = _load_credentials()
    if saved and tool_context:
        # Load saved credentials into session state
        tool_context.state["player_key"] = saved["player_key"]
        tool_context.state["player_name"] = saved["player_name"]
        return {
            "success": True,
            "player_key": saved["player_key"],
            "player_name": saved["player_name"],
            "message": f"Loaded existing player '{saved['player_name']}' from saved credentials.",
            "restored": True,
        }

    try:
        response = requests.post(
            f"{BASE_URL}/register",
            json={"player_name": player_name, "language": language},
            timeout=30,
        )
        data = response.json()

        # Store the player_key in session state for other tools to use
        if data.get("success") and tool_context:
            tool_context.state["player_key"] = data["player_key"]
            tool_context.state["player_name"] = player_name
            # Persist credentials to file for future sessions
            _save_credentials(player_name, data["player_key"])

        return data

    except requests.RequestException as e:
        return {
            "status": "error",
            "error_type": "connection_error",
            "error_message": f"Could not connect to game server at {BASE_URL}: {str(e)}",
        }
    except Exception as e:
        return {
            "status": "error",
            "error_type": "unexpected_error",
            "error_message": str(e),
        }


def castello_load_player(tool_context: ToolContext = None) -> dict:
    """Load a previously registered player from saved credentials.

    Use this tool to resume a previous game without re-registering.
    If credentials were saved from a prior session, they are loaded
    into the current session state.

    Returns:
        dict: The loaded player info, or an error if no saved credentials exist.
    """
    saved = _load_credentials()
    if saved and tool_context:
        tool_context.state["player_key"] = saved["player_key"]
        tool_context.state["player_name"] = saved["player_name"]
        return {
            "status": "success",
            "player_name": saved["player_name"],
            "player_key": saved["player_key"],
            "registered_at": saved.get("registered_at", "unknown"),
            "message": f"Player '{saved['player_name']}' loaded. You can now use castello_play and castello_status.",
        }

    return {
        "status": "error",
        "error_type": "no_saved_credentials",
        "error_message": "No saved player credentials found. Use castello_register to create a new player.",
    }


def castello_play(
    command: str = "",
    save_name: str = "",
    tool_context: ToolContext = None,
) -> dict:
    """Send a command to the Castello game.

    When not playing (status is NOT_PLAYING), send menu choices:
    - "1" to start a new adventure
    - "2" to load a saved game
    - "3" to delete saved games
    - "4" to see instructions
    - "5" to quit

    When playing, send game commands like:
    - Movement: NORD, SUD, EST, OVEST, ALTO, BASSO
    - Actions: GUARDA, PRENDI, LASCIA, APRI, USA, ESAMINA
    - Info: INVENTARIO, PUNTI, MOSSE
    - Game: SALVA, CARICA, BASTA

    Args:
        command (str): The command or menu choice to send. Can be empty
            to get the current menu.
        save_name (str): Optional save slot name, used with SALVA/CARICA commands.

    Returns:
        dict: Game response with output text and state information.
            The state includes: status, room, roomLabel, points, moves.
            May also include flags: game_over, player_died, awaiting_answer,
            awaiting_load, saved, quit.
    """
    if tool_context is None:
        return {
            "status": "error",
            "error_type": "missing_context",
            "error_message": "Tool context not available.",
        }

    player_key = tool_context.state.get("player_key")
    if not player_key:
        return {
            "status": "error",
            "error_type": "not_registered",
            "error_message": "You must register first using castello_register, or load a previous player with castello_load_player.",
        }

    try:
        body = {"player_key": player_key}
        if command:
            body["input"] = command
        if save_name:
            body["save_name"] = save_name

        response = requests.post(
            f"{BASE_URL}/play",
            json=body,
            timeout=30,
        )
        return response.json()

    except requests.RequestException as e:
        return {
            "status": "error",
            "error_type": "connection_error",
            "error_message": f"Could not connect to game server: {str(e)}",
        }
    except Exception as e:
        return {
            "status": "error",
            "error_type": "unexpected_error",
            "error_message": str(e),
        }


def castello_status(tool_context: ToolContext = None) -> dict:
    """Check the current game status.

    Returns the player's current state: whether they are playing or not,
    their current room, points, moves, and list of saved games.

    Returns:
        dict: Player status including:
            - status: "NOT_PLAYING" or "PLAYING"
            - current_room: room key (or null if not playing)
            - points: current score
            - moves: number of moves made
            - saved_games: list of available saves
    """
    if tool_context is None:
        return {
            "status": "error",
            "error_type": "missing_context",
            "error_message": "Tool context not available.",
        }

    player_key = tool_context.state.get("player_key")
    if not player_key:
        return {
            "status": "error",
            "error_type": "not_registered",
            "error_message": "You must register first using castello_register, or load a previous player with castello_load_player.",
        }

    try:
        response = requests.get(
            f"{BASE_URL}/status",
            params={"player_key": player_key},
            timeout=30,
        )
        return response.json()

    except requests.RequestException as e:
        return {
            "status": "error",
            "error_type": "connection_error",
            "error_message": f"Could not connect to game server: {str(e)}",
        }
    except Exception as e:
        return {
            "status": "error",
            "error_type": "unexpected_error",
            "error_message": str(e),
        }


def castello_set_language(
    language: str,
    tool_context: ToolContext = None,
) -> dict:
    """Change the player's language preference.

    The change takes effect immediately for all subsequent game responses,
    including active game sessions.

    Args:
        language (str): Language code. Options: "it" (Italian),
            "en" (English), "es" (Spanish).

    Returns:
        dict: Confirmation of the language change, or error information.
    """
    if tool_context is None:
        return {
            "status": "error",
            "error_type": "missing_context",
            "error_message": "Tool context not available.",
        }

    player_key = tool_context.state.get("player_key")
    if not player_key:
        return {
            "status": "error",
            "error_type": "not_registered",
            "error_message": "You must register first using castello_register.",
        }

    try:
        response = requests.put(
            f"{BASE_URL}/player/language",
            json={"player_key": player_key, "language": language},
            timeout=30,
        )
        return response.json()

    except requests.RequestException as e:
        return {
            "status": "error",
            "error_type": "connection_error",
            "error_message": f"Could not connect to game server: {str(e)}",
        }
    except Exception as e:
        return {
            "status": "error",
            "error_type": "unexpected_error",
            "error_message": str(e),
        }


def castello_get_languages() -> dict:
    """Get the list of supported languages.

    Returns:
        dict: List of available language codes (e.g. ["en", "it", "es"]).
    """
    try:
        response = requests.get(
            f"{BASE_URL}/player/languages",
            timeout=30,
        )
        return response.json()

    except requests.RequestException as e:
        return {
            "status": "error",
            "error_type": "connection_error",
            "error_message": f"Could not connect to game server: {str(e)}",
        }
    except Exception as e:
        return {
            "status": "error",
            "error_type": "unexpected_error",
            "error_message": str(e),
        }
