# Castello API Notes

Base URL: `http://localhost:3000`

## Common flows
1. `POST /register` with a unique `player_name` to receive a `player_key`.
2. Use the `player_key` in all subsequent calls.
3. `GET /status` to see whether the player is in `NOT_PLAYING` or `PLAYING` mode, inspect the current room, points, and moves.
4. `POST /play` to drive the game (menu actions when not playing or text commands while playing); responses include the latest text output and game state.

## POST /register
- **Purpose**: register a fresh player and obtain the authentication token.
- **Body** (`application/json`):
  ```json
  {
    "player_name": "Marco"
  }
  ```
- **Success (200)**:
  ```json
  {
    "success": true,
    "player_key": "<40-character token>",
    "message": "Registrazione completata"
  }
  ```
- **Errors**:
  - `400` with `player_name_required` if the name is missing/blank.
  - `400` with `player_name_taken` if the name already exists.

### Powershell command example for POST /register
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/register" -Method POST -ContentType "application/json" -Body '{"player_name": "my-player-name"}'
```
### cmd command example for POST /register
```cmd
curl -X POST http://localhost:3000/register -H "Content-Type: application/json" -d "{\"player_name\": \"My_Player_Name\"}"
```
## GET /status
- **Purpose**: inspect the player status prior to sending commands or to refresh the UI.
- **Query params**:
  - `player_key` (required): authentication token from `/register`.
- **Success (200)**:
  ```json
  {
    "success": true,
    "player_name": "Marco",
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
- **Errors**:
  - `400` with `player_key_required` if the key is missing.
  - `401` with `invalid_player_key` if the token is unknown.

### Powershell command example for GET /status
```powershell
$playerKey = "YOUR_PLAYER_KEY_HERE"
Invoke-RestMethod -Uri "http://localhost:3000/status?player_key=$playerKey" -Method GET
```

### cmd command example for GET /status
```cmd
curl "http://localhost:3000/status?player_key=YOUR_PLAYER_KEY_HERE"
```



## POST /play
- **Purpose**: send inputs either to navigate the menu (when `status = NOT_PLAYING`) or to interact with the adventure.
- **Body** (`application/json`):
  ```json
  {
    "player_key": "<token>",
    "input": "NORD",
    "player_name": "Marco",     // optional, for debugging only
    "save_name": "my_slot"      // optional, when engine requests a save
  }
  ```
- **NotPlaying responses**:
  - Without `input`: returns the menu text and state `{status: "NOT_PLAYING"}`.
  - Selecting `1` starts a new game and replies with the opening narrative plus `state.status = "PLAYING"`.
  - Other menu numbers list saved games, delete saves, show instructions, or quit.
  - Sending a save name will load it, switch to `PLAYING`, and describe the current room.
- **Playing responses**:
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
  Additional flags:
  - `saved`: `true` when a save operation happened (include `save_name`).
  - `awaiting_load`: `true` when saved games are listed for a load command.
  - `saved_games`: list of saves currently available.
  - `game_over`: `true` when the player reached the end/was killed; response also resets status to `NOT_PLAYING`.
  - `player_died`: `true` when the game over was a death.
  - `quit`: `true` when the menu option to exit was chosen.
- **Errors**:
  - `400` with `player_key_required` if missing.
  - `401` with `invalid_player_key` if the key cannot be matched.

### Powershell command example for POST /play
```powershell
$playerKey = "YOUR_PLAYER_KEY_HERE"
Invoke-RestMethod -Uri "http://localhost:3000/play" -Method POST -ContentType "application/json" -Body "{`"player_key`": `"$playerKey`", `"input`": `"GUARDA`"}"
```

### cmd command example for POST /play
```cmd
curl -X POST http://localhost:3000/play -H "Content-Type: application/json" -d "{\"player_key\": \"YOUR_KEY\", \"input\": \"GUARDA\"}"
```


## Notes
- The server persists only mutable engine state (inventory, points, moves, timed events, room flags). All commands return localized Italian text.
- Typical actions: compass directions (`NORD`, `SUD`, `EST`, `OVEST`, `ALTO`, `BASSO`), object verbs like `PRENDI`, `LASCIA`, `APRI`, `USA`, as well as system commands: `PUNTI`, `MOSSE`, `SALVA`, `CARICA`, `BASTA`.
