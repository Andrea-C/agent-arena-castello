# Castello API Documentation

Base URL: `http://localhost:3000`

## Table of Contents
- [Common Flows](#common-flows)
- [POST /register](#post-register)
- [GET /status](#get-status)
- [POST /play](#post-play)
- [PUT /player/language](#put-playerlanguage)
- [GET /player/languages](#get-playerlanguages)
- [Dashboard Endpoints](#dashboard-endpoints)
- [Notes](#notes)

---

## Common Flows

1. `POST /register` with a unique `player_name` (and optional `language`) to receive a `player_key`.
2. Use the `player_key` in all subsequent calls.
3. `GET /status` to see whether the player is in `NOT_PLAYING` or `PLAYING` mode, inspect the current room, points, moves, and language.
4. `POST /play` to drive the game (menu actions when not playing or text commands while playing); responses include the latest text output and game state.
5. `PUT /player/language` to change the player's language preference at any time.

---

## POST /register

**Purpose**: Register a fresh player and obtain the authentication token.

### Request Body (`application/json`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `player_name` | string | Yes | Unique player name |
| `language` | string | No | Language code (`en`, `it`, `es`). Defaults to `en` |

```json
{
  "player_name": "Marco",
  "language": "it"
}
```

### Success Response (200)

```json
{
  "success": true,
  "player_key": "<40-character token>",
  "language": "it",
  "message": "Registration completed"
}
```

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | `player_name_required` | Name is missing or blank |
| 400 | `player_name_taken` | Name already exists |

### Examples

**Windows (PowerShell)**
```powershell
# Register with default language (English)
Invoke-RestMethod -Uri "http://localhost:3000/register" -Method POST -ContentType "application/json" -Body '{"player_name": "Marco"}'

# Register with Italian language
Invoke-RestMethod -Uri "http://localhost:3000/register" -Method POST -ContentType "application/json" -Body '{"player_name": "Marco", "language": "it"}'
```

**Linux/Mac (curl)**
```bash
# Register with default language (English)
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"player_name": "Marco"}'

# Register with Italian language
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"player_name": "Marco", "language": "it"}'
```

---

## GET /status

**Purpose**: Inspect the player status prior to sending commands or to refresh the UI.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `player_key` | string | Yes | Authentication token from `/register` |

### Success Response (200)

```json
{
  "success": true,
  "player_name": "Marco",
  "language": "it",
  "status": "NOT_PLAYING",
  "current_room": null,
  "points": 0,
  "moves": 0,
  "saved_games": [
    {
      "save_name": "save_167464",
      "created_at": "2026-01-24T12:00:00Z"
    }
  ]
}
```

When a session exists, `status` becomes `PLAYING`, `current_room` is populated with the room key, and `points`/`moves` track progress. `saved_games` lists existing saves for easy load menus.

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | `player_key_required` | Key is missing |
| 401 | `invalid_player_key` | Token is unknown |

### Examples

**Windows (PowerShell)**
```powershell
$playerKey = "YOUR_PLAYER_KEY_HERE"
Invoke-RestMethod -Uri "http://localhost:3000/status?player_key=$playerKey" -Method GET
```

**Linux/Mac (curl)**
```bash
curl "http://localhost:3000/status?player_key=YOUR_PLAYER_KEY_HERE"
```

---

## POST /play

**Purpose**: Send inputs either to navigate the menu (when `status = NOT_PLAYING`) or to interact with the adventure.

### Request Body (`application/json`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `player_key` | string | Yes | Authentication token |
| `input` | string | No | Command or menu choice |
| `save_name` | string | No | Save slot name (when saving/loading) |

```json
{
  "player_key": "<token>",
  "input": "NORD",
  "save_name": "my_slot"
}
```

### NotPlaying Responses

- Without `input`: returns the menu text and state `{status: "NOT_PLAYING"}`.
- Selecting `1` starts a new game and replies with the opening narrative plus `state.status = "PLAYING"`.
- Other menu numbers list saved games, delete saves, show instructions, or quit.
- Sending a save name will load it, switch to `PLAYING`, and describe the current room.

### Playing Responses

```json
{
  "success": true,
  "output": "Puoi procedere verso nord...",
  "state": {
    "status": "PLAYING",
    "room": "corridoio",
    "roomLabel": "Corridoio delle torri",
    "points": 10,
    "moves": 5
  }
}
```

### Additional Response Flags

| Flag | Type | Description |
|------|------|-------------|
| `saved` | boolean | `true` when a save operation happened |
| `awaiting_load` | boolean | `true` when saved games are listed for a load command |
| `awaiting_answer` | boolean | `true` when the game is waiting for a yes/no answer |
| `saved_games` | array | List of saves currently available |
| `game_over` | boolean | `true` when the player reached the end or was killed |
| `player_died` | boolean | `true` when the game over was a death |
| `quit` | boolean | `true` when the menu option to exit was chosen |

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | `player_key_required` | Key is missing |
| 401 | `invalid_player_key` | Token cannot be matched |

### Examples

**Windows (PowerShell)**
```powershell
$playerKey = "YOUR_PLAYER_KEY_HERE"

# Get menu (when not playing)
Invoke-RestMethod -Uri "http://localhost:3000/play" -Method POST -ContentType "application/json" -Body "{`"player_key`": `"$playerKey`"}"

# Start new game
Invoke-RestMethod -Uri "http://localhost:3000/play" -Method POST -ContentType "application/json" -Body "{`"player_key`": `"$playerKey`", `"input`": `"1`"}"

# Send a game command
Invoke-RestMethod -Uri "http://localhost:3000/play" -Method POST -ContentType "application/json" -Body "{`"player_key`": `"$playerKey`", `"input`": `"GUARDA`"}"

# Move north
Invoke-RestMethod -Uri "http://localhost:3000/play" -Method POST -ContentType "application/json" -Body "{`"player_key`": `"$playerKey`", `"input`": `"NORD`"}"

# Save game
Invoke-RestMethod -Uri "http://localhost:3000/play" -Method POST -ContentType "application/json" -Body "{`"player_key`": `"$playerKey`", `"input`": `"SALVA`", `"save_name`": `"my_save`"}"
```

**Linux/Mac (curl)**
```bash
PLAYER_KEY="YOUR_PLAYER_KEY_HERE"

# Get menu (when not playing)
curl -X POST http://localhost:3000/play \
  -H "Content-Type: application/json" \
  -d "{\"player_key\": \"$PLAYER_KEY\"}"

# Start new game
curl -X POST http://localhost:3000/play \
  -H "Content-Type: application/json" \
  -d "{\"player_key\": \"$PLAYER_KEY\", \"input\": \"1\"}"

# Send a game command
curl -X POST http://localhost:3000/play \
  -H "Content-Type: application/json" \
  -d "{\"player_key\": \"$PLAYER_KEY\", \"input\": \"GUARDA\"}"

# Move north
curl -X POST http://localhost:3000/play \
  -H "Content-Type: application/json" \
  -d "{\"player_key\": \"$PLAYER_KEY\", \"input\": \"NORD\"}"

# Save game
curl -X POST http://localhost:3000/play \
  -H "Content-Type: application/json" \
  -d "{\"player_key\": \"$PLAYER_KEY\", \"input\": \"SALVA\", \"save_name\": \"my_save\"}"
```

---

## PUT /player/language

**Purpose**: Change the player's preferred language. Takes effect immediately for all subsequent API responses, including active game sessions.

### Request Body (`application/json`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `player_key` | string | Yes | Authentication token |
| `language` | string | Yes | New language code (`en`, `it`, `es`) |

```json
{
  "player_key": "<token>",
  "language": "es"
}
```

### Success Response (200)

```json
{
  "success": true,
  "language": "es",
  "message": "Language updated successfully"
}
```

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | `player_key_required` | Key is missing |
| 400 | `language_required` | Language is missing |
| 400 | `invalid_language` | Language code not supported |
| 401 | `invalid_player_key` | Token is unknown |

### Examples

**Windows (PowerShell)**
```powershell
$playerKey = "YOUR_PLAYER_KEY_HERE"

# Change to Spanish
Invoke-RestMethod -Uri "http://localhost:3000/player/language" -Method PUT -ContentType "application/json" -Body "{`"player_key`": `"$playerKey`", `"language`": `"es`"}"

# Change to Italian
Invoke-RestMethod -Uri "http://localhost:3000/player/language" -Method PUT -ContentType "application/json" -Body "{`"player_key`": `"$playerKey`", `"language`": `"it`"}"

# Change to English
Invoke-RestMethod -Uri "http://localhost:3000/player/language" -Method PUT -ContentType "application/json" -Body "{`"player_key`": `"$playerKey`", `"language`": `"en`"}"
```

**Linux/Mac (curl)**
```bash
PLAYER_KEY="YOUR_PLAYER_KEY_HERE"

# Change to Spanish
curl -X PUT http://localhost:3000/player/language \
  -H "Content-Type: application/json" \
  -d "{\"player_key\": \"$PLAYER_KEY\", \"language\": \"es\"}"

# Change to Italian
curl -X PUT http://localhost:3000/player/language \
  -H "Content-Type: application/json" \
  -d "{\"player_key\": \"$PLAYER_KEY\", \"language\": \"it\"}"

# Change to English
curl -X PUT http://localhost:3000/player/language \
  -H "Content-Type: application/json" \
  -d "{\"player_key\": \"$PLAYER_KEY\", \"language\": \"en\"}"
```

---

## GET /player/languages

**Purpose**: Get a list of all supported language codes.

### Success Response (200)

```json
{
  "success": true,
  "languages": ["en", "it", "es"]
}
```

### Examples

**Windows (PowerShell)**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/player/languages" -Method GET
```

**Linux/Mac (curl)**
```bash
curl http://localhost:3000/player/languages
```

---

## Dashboard Endpoints

The dashboard provides a web UI for monitoring at `http://localhost:3000/dashboard` and the following API endpoints:

### GET /dashboard/api/sessions

Returns a list of currently active game sessions.

**Windows (PowerShell)**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/dashboard/api/sessions" -Method GET
```

**Linux/Mac (curl)**
```bash
curl http://localhost:3000/dashboard/api/sessions
```

### GET /dashboard/api/players

Returns a list of all registered players.

**Windows (PowerShell)**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/dashboard/api/players" -Method GET
```

**Linux/Mac (curl)**
```bash
curl http://localhost:3000/dashboard/api/players
```

### GET /dashboard/api/actions

Returns a list of recent game actions.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 50 | Maximum number of actions to return |

**Windows (PowerShell)**
```powershell
# Get last 50 actions (default)
Invoke-RestMethod -Uri "http://localhost:3000/dashboard/api/actions" -Method GET

# Get last 100 actions
Invoke-RestMethod -Uri "http://localhost:3000/dashboard/api/actions?limit=100" -Method GET
```

**Linux/Mac (curl)**
```bash
# Get last 50 actions (default)
curl http://localhost:3000/dashboard/api/actions

# Get last 100 actions
curl "http://localhost:3000/dashboard/api/actions?limit=100"
```

---

## Notes

- The server persists only mutable engine state (inventory, points, moves, timed events, room flags).
- All game text responds in the language set in the player's profile.
- Language changes take effect immediately, even during active game sessions.
- Supported languages: English (`en`), Italian (`it`), Spanish (`es`).

### Common Game Commands

| Command | Description |
|---------|-------------|
| `NORD`, `SUD`, `EST`, `OVEST` | Compass directions |
| `ALTO`, `BASSO` | Up/Down |
| `PRENDI <object>` | Pick up an object |
| `LASCIA <object>` | Drop an object |
| `APRI <object>` | Open something |
| `USA <object>` | Use an object |
| `GUARDA` | Look around |
| `ESAMINA <object>` | Examine something |
| `INVENTARIO` | Show inventory |
| `PUNTI` | Show points |
| `MOSSE` | Show moves |
| `SALVA` | Save game |
| `CARICA` | Load game |
| `BASTA` | Quit game |
