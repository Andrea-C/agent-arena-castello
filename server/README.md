# Server Application

## Setup
- Create a virtual environment.
- Install dependencies: `pip install -r requirements.txt`

## Run
- Start the API: `uvicorn server.app:app --reload`
- Open API docs: `http://127.0.0.1:8000/docs`
- Open dashboard: `http://127.0.0.1:8000/dashboard`

## API Endpoints
- `GET /health` -> service status.
- `POST /register` -> register a player name, returns `playerKey`.
- `POST /play` -> send game commands (menu and gameplay).
- `GET /dashboard` -> live sessions HTML dashboard.
- `GET /dashboard/data` -> dashboard JSON data.
- `GET /docs` -> OpenAPI UI.
- `GET /openapi.json` -> OpenAPI schema.

## Quick Test
Register a player:
```
curl -X POST http://127.0.0.1:8000/register -H "Content-Type: application/json" -d "{\"playerName\":\"alice\"}"
```

Play:
```
curl -X POST http://127.0.0.1:8000/play -H "Content-Type: application/json" -d "{\"playerKey\":\"<key>\",\"input\":\"1\"}"
```
• You’re in PowerShell, so curl is an alias for Invoke-WebRequest. Use one of these:

  PowerShell-native:

  Invoke-WebRequest http://127.0.0.1:8000/register -Method POST -ContentType "application/json" -Body
  '{"playerName":"test1"}'

  Or call real curl:

  curl.exe -X POST http://127.0.0.1:8000/register -H "Content-Type: application/json" -d "{\"playerName\":\"test1\"}"

  Pick whichever you prefer.
