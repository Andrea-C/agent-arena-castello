# Avventura nel Castello - Development Plan

## Goals
- Rebuild the game to run fully server-side while preserving the original logic.
- Support multiplayer with isolated sessions per player.
- Provide a stateless client API that mirrors the original flow and responses.

## Findings From the Original Codebase
- `original/IFEngine/js/IFEngine.js` defines the main loop, input normalization (`_prepare`), menu flow, save/load, and core state (`stanzaCorrente`, `inventario`, `timedEvents`, `altriDati`).
- `original/AvventuraNelCastelloJSEngine.js` extends `IFEngine` with points, custom commands, and overrides.
- `original/AvventuraNelCastelloJS.js` contains the full game data: rooms, objects, interactors, sequences, and timed events. Many entries are functions and are not plain data.
- `original/it-it.i18n.js` contains all localized strings referenced by the game logic.
- Saves are keyed under `SAVED` (`AvventuraNelCastello`) and serialize the runtime state.

## Proposed Architecture (Server-Side)
- **API layer**: endpoints for `/register` and `/play` only; all other actions are sent through `/play`.
- **Auth**: issue a `player-key` at registration; require it with every API call.
- **Session state**: store active state in SQLite as JSON; persist after every turn.
- **Game engine**: Python port of IFEngine + Parser + Thesaurus and the Avventura game definitions.

## Development Steps
1) **Finalize API contract**
   - Define request/response schemas for `/register` and `/play`, including error codes.
   - `/play` handles menu actions while `NOT_PLAYING` and game actions while `PLAYING`.
   - `player-key` format: `castello-` prefix + random token (example: `castello-1zS8x2PxrStIjnk4Y6iwT3BlbkaajsUwrmfRrdxItd7XvOR1`).
   - Normalize player names with `trim().lower()`; treat names case-insensitively.
2) **Database schema**
   - `players`: `name_normalized`, `name_display`, `key`, `status`, `created_at`.
   - `sessions`: `player_id`, `state_json`, `active`, `last_activity`.
   - `saves`: `player_id`, `name`, `state_json`, `created_at`.
   - `interactions`: logging for dashboard.
3) **Port core engine**
   - Implement Python equivalents for: input normalization, parser matching, verb/command dispatch, inventory management, timed events, points, and room traversal.
   - Replace CRT with a buffer that accumulates output strings.
4) **Port game data and logic**
   - Convert `AvventuraNelCastelloJS.js` rooms/objects/interactors to Python objects.
   - Translate embedded JS callbacks into Python methods (these are the bulk of the game rules).
   - Keep i18n strings loaded from `it-it.i18n.js` or mirror them in a Python module.
5) **Session behavior**
   - Implement `NOT_PLAYING` menu actions: start, load, delete-saved (no confirmation), help.
   - On `PLAYING`, route input to parser; persist state and return output text.
   - End session on `QUIT` or game completion.
6) **Validation**
   - Create scripted transcripts (input/output pairs) for key scenarios.
   - Compare results against the original web version for parity.

## Open Questions / Assumptions
- Save listing and selection will be by number (as in the original menu flow).

## Progress Notes
- API contract updated to `/register` + `/play` only, with `player-key` auth and name normalization.
- Server now supports menu flow, save listing/selection, and status transitions.
- Added Python scaffolding for `Parser`, `Thesaurus`, and a minimal `GameCore` with menu/help and basic parsing.
- Extracted i18n and game data from the original JS into `server/game/i18n_raw.json` and `server/game/game_raw.json`.
- Identified 161 function placeholders that still require porting to Python logic.
- Started porting the `aereo` room flow (intro, parachute, jump) with timed event handling and basic sequences.
