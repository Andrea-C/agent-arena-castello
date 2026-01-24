# Repository Guidelines

## Project Structure & Module Organization
This repository contains the original web port of "Avventura nel Castello" plus notes about a planned refactor.

- `original/`: Static web version assets.
- `original/AvventuraNelCastelloJS.js`: Main game script.
- `original/AvventuraNelCastelloJSEngine.js`: Game engine logic.
- `original/IFEngine/js/`: Core engine modules (parser, thesaurus, sound, CRT).
- `original/assets/js/`: Front-end helpers (mostly minified).
- `original/avventuranelcastello-js.it*.html`: Entry HTML files.
- `avventura-nel-castello-description.md`: Project goals and refactor notes.
- `server/`: Python API prototype with SQLite storage and dashboard.

## Build, Test, and Development Commands
No build tooling or package manager files are present. The web port is static HTML/JS.

- Open `original/avventuranelcastello-js.it.html` directly in a browser to run the game.
- Optional local server (if you need relative paths to resolve consistently):
  - `python -m http.server` from the repository root, then open `http://localhost:8000/original/avventuranelcastello-js.it.html`.
- API server (Python/FastAPI):
  - `pip install -r requirements.txt`
  - `uvicorn server.app:app --reload`

## Coding Style & Naming Conventions
The existing JavaScript uses tab indentation and a mixed naming style (PascalCase for classes/files, lower-case for many object keys).

- Keep tabs for indentation in JS files (match current style).
- Preserve existing naming patterns and localized strings (`i18n` usage in `original/it-it.i18n.js`).
- Avoid reformatting minified files in `original/assets/js/`.

## Testing Guidelines
No tests or test frameworks are present in this repository.

- If you add tests in future work, document the framework and add a runnable command in this section.

## Commit & Pull Request Guidelines
There is no `.git` history in this workspace, so no commit message conventions can be inferred.

- If you introduce version control, prefer short, imperative commit titles (e.g., `Add API session model`).
- For pull requests, include a brief description, relevant screenshots for UI changes, and a link to any tracking issue.

## Architecture & Refactor Notes
The intended refactor is described in `avventura-nel-castello-description.md`, targeting a client/server API with session management and a `/play` endpoint. Keep new server-side code and API docs clearly separated from the archived `original/` web port.

Key API behavior currently specified:
- All API calls include `playerName`.
- `/register` creates a player; `/play` auto-creates or resumes a session.
- One active session per player; concurrent use of the same name returns a clear error.
- `SAVE <name>` stores a named snapshot; `LOAD [name]` restores the latest or named snapshot.
- `QUIT` marks a session inactive; the dashboard updates on each interaction and offers a refresh button.
