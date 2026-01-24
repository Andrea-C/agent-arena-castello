import json
import os
import sqlite3
from datetime import datetime
from typing import Any, Dict, List, Optional, Sequence, Tuple


BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(DATA_DIR, "app.db")


def _now() -> str:
    return datetime.utcnow().isoformat(timespec="seconds") + "Z"


def _connect() -> sqlite3.Connection:
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _table_columns(conn: sqlite3.Connection, table: str) -> Dict[str, str]:
    rows = conn.execute(f"PRAGMA table_info({table})").fetchall()
    return {row["name"]: row["type"] for row in rows}


def _ensure_columns(
    conn: sqlite3.Connection, table: str, columns: Sequence[Tuple[str, str]]
) -> None:
    existing = _table_columns(conn, table)
    for name, col_type in columns:
        if name not in existing:
            conn.execute(f"ALTER TABLE {table} ADD COLUMN {name} {col_type}")


def init_db() -> None:
    with _connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name_normalized TEXT NOT NULL UNIQUE,
                name_display TEXT NOT NULL,
                player_key TEXT NOT NULL UNIQUE,
                status TEXT NOT NULL,
                pending_action TEXT,
                pending_payload TEXT,
                created_at TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id INTEGER NOT NULL,
                active INTEGER NOT NULL,
                state TEXT NOT NULL,
                pending_action TEXT,
                pending_payload TEXT,
                created_at TEXT NOT NULL,
                last_activity TEXT NOT NULL,
                client_host TEXT NOT NULL,
                FOREIGN KEY(player_id) REFERENCES players(id)
            );
            CREATE TABLE IF NOT EXISTS saves (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                state TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(player_id) REFERENCES players(id)
            );
            CREATE TABLE IF NOT EXISTS interactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id INTEGER NOT NULL,
                session_id INTEGER,
                input_text TEXT NOT NULL,
                output_text TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(player_id) REFERENCES players(id),
                FOREIGN KEY(session_id) REFERENCES sessions(id)
            );
            """
        )
        _ensure_columns(
            conn,
            "players",
            [
                ("name_normalized", "TEXT"),
                ("name_display", "TEXT"),
                ("player_key", "TEXT"),
                ("status", "TEXT"),
                ("pending_action", "TEXT"),
                ("pending_payload", "TEXT"),
            ],
        )
        _ensure_columns(
            conn,
            "sessions",
            [
                ("pending_action", "TEXT"),
                ("pending_payload", "TEXT"),
            ],
        )


def normalize_player_name(name: str) -> str:
    return name.strip().lower()


def get_player(name: str) -> Optional[Dict[str, Any]]:
    normalized = normalize_player_name(name)
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM players WHERE name_normalized = ?", (normalized,)
        ).fetchone()
        if row:
            return dict(row)
        columns = _table_columns(conn, "players")
        if "name" in columns:
            row = conn.execute(
                "SELECT * FROM players WHERE lower(name) = ?",
                (normalized,),
            ).fetchone()
            return dict(row) if row else None
        return None


def get_player_by_key(player_key: str) -> Optional[Dict[str, Any]]:
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM players WHERE player_key = ?", (player_key,)
        ).fetchone()
        return dict(row) if row else None


def create_player(name: str, player_key: str) -> Dict[str, Any]:
    normalized = normalize_player_name(name)
    with _connect() as conn:
        columns = _table_columns(conn, "players")
        name_display = name.strip()
        try:
            if "name" in columns:
                conn.execute(
                    """
                    INSERT INTO players (name, name_normalized, name_display, player_key, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (name_display, normalized, name_display, player_key, "NOT_PLAYING", _now()),
                )
            else:
                conn.execute(
                    """
                    INSERT INTO players (name_normalized, name_display, player_key, status, created_at)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (normalized, name_display, player_key, "NOT_PLAYING", _now()),
                )
        except sqlite3.IntegrityError:
            raise
        row = conn.execute(
            "SELECT * FROM players WHERE name_normalized = ?", (normalized,)
        ).fetchone()
        return dict(row)


def update_player_status(player_id: int, status: str) -> None:
    with _connect() as conn:
        conn.execute(
            "UPDATE players SET status = ? WHERE id = ?",
            (status, player_id),
        )


def set_player_pending(player_id: int, action: Optional[str], payload: Optional[dict]) -> None:
    payload_text = json.dumps(payload) if payload is not None else None
    with _connect() as conn:
        conn.execute(
            "UPDATE players SET pending_action = ?, pending_payload = ? WHERE id = ?",
            (action, payload_text, player_id),
        )


def get_active_session(player_id: int) -> Optional[Dict[str, Any]]:
    with _connect() as conn:
        row = conn.execute(
            "SELECT * FROM sessions WHERE player_id = ? AND active = 1",
            (player_id,),
        ).fetchone()
        return dict(row) if row else None


def create_session(player_id: int, client_host: str, state: Optional[str] = None) -> Dict[str, Any]:
    now = _now()
    if state is None:
        state = json.dumps({"turns": 0, "log": []})
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO sessions (player_id, active, state, created_at, last_activity, client_host)
            VALUES (?, 1, ?, ?, ?, ?)
            """,
            (player_id, state, now, now, client_host),
        )
        row = conn.execute(
            "SELECT * FROM sessions WHERE player_id = ? AND active = 1",
            (player_id,),
        ).fetchone()
        return dict(row)


def update_session(
    session_id: int, state: str, client_host: str, pending_action: Optional[str] = None, pending_payload: Optional[dict] = None
) -> Dict[str, Any]:
    now = _now()
    payload_text = json.dumps(pending_payload) if pending_payload is not None else None
    with _connect() as conn:
        conn.execute(
            """
            UPDATE sessions
            SET state = ?, last_activity = ?, client_host = ?, pending_action = ?, pending_payload = ?
            WHERE id = ?
            """,
            (state, now, client_host, pending_action, payload_text, session_id),
        )
        row = conn.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
        return dict(row)


def deactivate_session(session_id: int) -> None:
    with _connect() as conn:
        conn.execute(
            "UPDATE sessions SET active = 0, last_activity = ? WHERE id = ?",
            (_now(), session_id),
        )


def deactivate_sessions_for_player(player_id: int) -> None:
    with _connect() as conn:
        conn.execute(
            "UPDATE sessions SET active = 0, last_activity = ? WHERE player_id = ?",
            (_now(), player_id),
        )


def create_save(player_id: int, name: str, state: str) -> None:
    with _connect() as conn:
        conn.execute(
            "INSERT INTO saves (player_id, name, state, created_at) VALUES (?, ?, ?, ?)",
            (player_id, name, state, _now()),
        )


def load_save(player_id: int, name: Optional[str]) -> Optional[str]:
    with _connect() as conn:
        if name is None:
            row = conn.execute(
                "SELECT state FROM saves WHERE player_id = ? ORDER BY id DESC LIMIT 1",
                (player_id,),
            ).fetchone()
        else:
            row = conn.execute(
                "SELECT state FROM saves WHERE player_id = ? AND name = ? ORDER BY id DESC LIMIT 1",
                (player_id, name),
            ).fetchone()
        return row["state"] if row else None


def log_interaction(player_id: int, session_id: int, input_text: str, output_text: str) -> None:
    with _connect() as conn:
        columns = _table_columns(conn, "interactions")
        if "session_id" in columns:
            if session_id is None:
                return
            conn.execute(
                """
                INSERT INTO interactions (player_id, session_id, input_text, output_text, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (player_id, session_id, input_text, output_text, _now()),
            )
        else:
            conn.execute(
                """
                INSERT INTO interactions (player_id, input_text, output_text, created_at)
                VALUES (?, ?, ?, ?)
                """,
                (player_id, input_text, output_text, _now()),
            )


def list_saves(player_id: int) -> List[Dict[str, Any]]:
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT id, name, created_at
            FROM saves
            WHERE player_id = ?
            ORDER BY id ASC
            """,
            (player_id,),
        ).fetchall()
        return [
            {"id": row["id"], "name": row["name"], "createdAt": row["created_at"]}
            for row in rows
        ]


def get_save_by_number(player_id: int, number: int) -> Optional[str]:
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT state FROM saves
            WHERE player_id = ?
            ORDER BY id ASC
            """,
            (player_id,),
        ).fetchall()
        if number <= 0 or number > len(rows):
            return None
        return rows[number - 1]["state"]


def delete_all_saves(player_id: int) -> int:
    with _connect() as conn:
        cur = conn.execute("DELETE FROM saves WHERE player_id = ?", (player_id,))
        return cur.rowcount


def list_active_sessions() -> List[Dict[str, Any]]:
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT sessions.id AS session_id, sessions.last_activity, sessions.client_host, players.name_display
            FROM sessions
            JOIN players ON players.id = sessions.player_id
            WHERE sessions.active = 1
            ORDER BY sessions.last_activity DESC
            """
        ).fetchall()
        return [
            {
                "sessionId": row["session_id"],
                "playerName": row["name_display"],
                "lastActivity": row["last_activity"],
                "clientHost": row["client_host"],
            }
            for row in rows
        ]


def list_interactions(limit: int = 50) -> List[Dict[str, Any]]:
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT interactions.created_at, interactions.input_text, interactions.output_text, players.name_display
            FROM interactions
            JOIN players ON players.id = interactions.player_id
            ORDER BY interactions.id DESC
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
        return [
            {
                "createdAt": row["created_at"],
                "playerName": row["name_display"],
                "input": row["input_text"],
                "output": row["output_text"],
            }
            for row in rows
        ]
