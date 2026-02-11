# Avventura nel Castello - API Server (JavaScript)

Server API per giocare ad "Avventura nel Castello", un classico gioco testuale interattivo.

## Installazione

```bash
cd server-js
npm install
```

## Avvio

```bash
npm start
```

Il server si avvia su `http://localhost:3000`

## Endpoints

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/register` | POST | Registra un nuovo giocatore |
| `/status` | GET | Ottiene lo stato del giocatore |
| `/play` | POST | Invia un comando di gioco |
| `/player/language` | PUT | Cambia la lingua del giocatore |
| `/player/languages` | GET | Lista delle lingue supportate |
| `/dashboard` | GET | Dashboard di monitoraggio |
| `/arcane-scrolls` | GET | Documentazione API (Swagger) |

## Uso

### 1. Registrazione

```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"player_name": "Mario"}'
```

Risposta:
```json
{
  "success": true,
  "player_key": "abc123...",
  "message": "Registrazione completata"
}
```

### 2. Verifica stato

```bash
curl "http://localhost:3000/status?player_key=abc123..."
```

### 3. Giocare

```bash
# Mostra menu (quando NOT_PLAYING)
curl -X POST http://localhost:3000/play \
  -H "Content-Type: application/json" \
  -d '{"player_key": "abc123...", "input": ""}'

# Inizia nuova partita
curl -X POST http://localhost:3000/play \
  -H "Content-Type: application/json" \
  -d '{"player_key": "abc123...", "input": "1"}'

# Invia comando (quando PLAYING)
curl -X POST http://localhost:3000/play \
  -H "Content-Type: application/json" \
  -d '{"player_key": "abc123...", "input": "NORD"}'
```

### 4. Cambiare lingua

```bash
curl -X PUT http://localhost:3000/player/language \
  -H "Content-Type: application/json" \
  -d '{"player_key": "abc123...", "language": "it"}'
```

## Esempi PowerShell (Windows) e curl (macOS/Linux)

### 1. Registrazione

**Windows (PowerShell)**
```powershell
# Registra un nuovo giocatore (lingua default: inglese)
Invoke-RestMethod -Uri "http://localhost:3000/register" -Method POST -ContentType "application/json" -Body '{"player_name": "Mario"}'

# Registra con lingua italiana
Invoke-RestMethod -Uri "http://localhost:3000/register" -Method POST -ContentType "application/json" -Body '{"player_name": "Mario", "language": "it"}'
```

**macOS/Linux (curl)**
```bash
# Registra un nuovo giocatore (lingua default: inglese)
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"player_name": "Mario"}'

# Registra con lingua italiana
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"player_name": "Mario", "language": "it"}'
```

### 2. Verifica stato

**Windows (PowerShell)**
```powershell
$playerKey = "YOUR_PLAYER_KEY_HERE"
Invoke-RestMethod -Uri "http://localhost:3000/status?player_key=$playerKey" -Method GET
```

**macOS/Linux (curl)**
```bash
PLAYER_KEY="YOUR_PLAYER_KEY_HERE"
curl "http://localhost:3000/status?player_key=$PLAYER_KEY"
```

### 3. Giocare

**Windows (PowerShell)**
```powershell
$playerKey = "YOUR_PLAYER_KEY_HERE"

# Mostra menu (quando NOT_PLAYING)
Invoke-RestMethod -Uri "http://localhost:3000/play" -Method POST -ContentType "application/json" -Body "{`"player_key`": `"$playerKey`"}"

# Inizia nuova partita
Invoke-RestMethod -Uri "http://localhost:3000/play" -Method POST -ContentType "application/json" -Body "{`"player_key`": `"$playerKey`", `"input`": `"1`"}"

# Invia comando (quando PLAYING)
Invoke-RestMethod -Uri "http://localhost:3000/play" -Method POST -ContentType "application/json" -Body "{`"player_key`": `"$playerKey`", `"input`": `"NORD`"}"

# Guarda la stanza
Invoke-RestMethod -Uri "http://localhost:3000/play" -Method POST -ContentType "application/json" -Body "{`"player_key`": `"$playerKey`", `"input`": `"GUARDA`"}"

# Prendi un oggetto
Invoke-RestMethod -Uri "http://localhost:3000/play" -Method POST -ContentType "application/json" -Body "{`"player_key`": `"$playerKey`", `"input`": `"PRENDI PARACADUTE`"}"
```

**macOS/Linux (curl)**
```bash
PLAYER_KEY="YOUR_PLAYER_KEY_HERE"

# Mostra menu (quando NOT_PLAYING)
curl -X POST http://localhost:3000/play \
  -H "Content-Type: application/json" \
  -d "{\"player_key\": \"$PLAYER_KEY\"}"

# Inizia nuova partita
curl -X POST http://localhost:3000/play \
  -H "Content-Type: application/json" \
  -d "{\"player_key\": \"$PLAYER_KEY\", \"input\": \"1\"}"

# Invia comando (quando PLAYING)
curl -X POST http://localhost:3000/play \
  -H "Content-Type: application/json" \
  -d "{\"player_key\": \"$PLAYER_KEY\", \"input\": \"NORD\"}"

# Guarda la stanza
curl -X POST http://localhost:3000/play \
  -H "Content-Type: application/json" \
  -d "{\"player_key\": \"$PLAYER_KEY\", \"input\": \"GUARDA\"}"

# Prendi un oggetto
curl -X POST http://localhost:3000/play \
  -H "Content-Type: application/json" \
  -d "{\"player_key\": \"$PLAYER_KEY\", \"input\": \"PRENDI PARACADUTE\"}"
```

### 4. Gestione lingua

**Windows (PowerShell)**
```powershell
$playerKey = "YOUR_PLAYER_KEY_HERE"

# Lista lingue supportate
Invoke-RestMethod -Uri "http://localhost:3000/player/languages" -Method GET

# Cambia lingua in italiano
Invoke-RestMethod -Uri "http://localhost:3000/player/language" -Method PUT -ContentType "application/json" -Body "{`"player_key`": `"$playerKey`", `"language`": `"it`"}"

# Cambia lingua in spagnolo
Invoke-RestMethod -Uri "http://localhost:3000/player/language" -Method PUT -ContentType "application/json" -Body "{`"player_key`": `"$playerKey`", `"language`": `"es`"}"

# Cambia lingua in inglese
Invoke-RestMethod -Uri "http://localhost:3000/player/language" -Method PUT -ContentType "application/json" -Body "{`"player_key`": `"$playerKey`", `"language`": `"en`"}"
```

**macOS/Linux (curl)**
```bash
PLAYER_KEY="YOUR_PLAYER_KEY_HERE"

# Lista lingue supportate
curl http://localhost:3000/player/languages

# Cambia lingua in italiano
curl -X PUT http://localhost:3000/player/language \
  -H "Content-Type: application/json" \
  -d "{\"player_key\": \"$PLAYER_KEY\", \"language\": \"it\"}"

# Cambia lingua in spagnolo
curl -X PUT http://localhost:3000/player/language \
  -H "Content-Type: application/json" \
  -d "{\"player_key\": \"$PLAYER_KEY\", \"language\": \"es\"}"

# Cambia lingua in inglese
curl -X PUT http://localhost:3000/player/language \
  -H "Content-Type: application/json" \
  -d "{\"player_key\": \"$PLAYER_KEY\", \"language\": \"en\"}"
```

### 5. Dashboard API

**Windows (PowerShell)**
```powershell
# Lista sessioni attive
Invoke-RestMethod -Uri "http://localhost:3000/dashboard/api/sessions" -Method GET

# Lista tutti i giocatori
Invoke-RestMethod -Uri "http://localhost:3000/dashboard/api/players" -Method GET

# Ultime 50 azioni
Invoke-RestMethod -Uri "http://localhost:3000/dashboard/api/actions" -Method GET

# Ultime 100 azioni
Invoke-RestMethod -Uri "http://localhost:3000/dashboard/api/actions?limit=100" -Method GET
```

**macOS/Linux (curl)**
```bash
# Lista sessioni attive
curl http://localhost:3000/dashboard/api/sessions

# Lista tutti i giocatori
curl http://localhost:3000/dashboard/api/players

# Ultime 50 azioni
curl http://localhost:3000/dashboard/api/actions

# Ultime 100 azioni
curl "http://localhost:3000/dashboard/api/actions?limit=100"
```

## Comandi di gioco

### Movimento
- NORD (N), SUD (S), EST (E), OVEST (O)
- ALTO (A), BASSO (B)

### Azioni
- PRENDI [oggetto]
- LASCIA [oggetto]
- GUARDA [oggetto/stanza]
- APRI [oggetto]
- USA [oggetto]

### Sistema
- DOVE - Mostra posizione attuale
- COSA - Mostra inventario
- PUNTI - Mostra punteggio
- MOSSE - Mostra numero di mosse
- SALVA - Salva la partita
- CARICA - Carica una partita
- BASTA - Termina la partita

## Struttura del progetto

```
server-js/
├── app.js              # Entry point Express
├── db.js               # Database SQLite
├── swagger.js          # Configurazione Swagger
├── package.json
├── routes/
│   ├── register.js     # Registrazione
│   ├── status.js       # Stato giocatore
│   ├── play.js         # Gioco
│   ├── player.js       # Gestione profilo (lingua)
│   └── dashboard.js    # Dashboard
├── game/
│   ├── IFEngineServer.js    # Engine base
│   ├── GameEngine.js        # Engine specifico
│   ├── Parser.js            # Parser comandi
│   ├── Thesaurus.js         # Vocabolario
│   ├── GameDataLoader.js    # Caricatore dati
│   ├── game_data.json       # Dati del gioco
│   └── locales/             # File di localizzazione
│       ├── en/              # Inglese
│       │   ├── i18n.js
│       │   └── i18n_data.json
│       ├── it/              # Italiano
│       │   ├── i18n.js
│       │   └── i18n_data.json
│       └── es/              # Spagnolo
│           ├── i18n.js
│           └── i18n_data.json
├── public/
│   └── dashboard.html  # Dashboard HTML
└── data/
    └── castello.db     # Database SQLite
```

## Database

Il server utilizza SQLite per memorizzare:
- Giocatori registrati
- Sessioni di gioco attive
- Salvataggi
- Log delle azioni (per dashboard)

## Note

- Il server gestisce automaticamente la persistenza delle sessioni
- Ogni giocatore può avere una sola sessione attiva
- I salvataggi sono associati al singolo giocatore
- La dashboard si aggiorna automaticamente ogni 5 secondi

## Lingue supportate

Il gioco supporta le seguenti lingue:
- **en** - Inglese (default)
- **it** - Italiano
- **es** - Spagnolo

La lingua può essere:
- Impostata durante la registrazione con il parametro `language`
- Modificata in qualsiasi momento tramite `PUT /player/language`
- Il cambio lingua ha effetto immediato, anche durante una partita in corso
