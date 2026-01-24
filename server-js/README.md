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
│   └── dashboard.js    # Dashboard
├── game/
│   ├── IFEngineServer.js    # Engine base
│   ├── GameEngine.js        # Engine specifico
│   ├── Parser.js            # Parser comandi
│   ├── Thesaurus.js         # Vocabolario
│   ├── GameDataLoader.js    # Caricatore dati
│   ├── i18n.js              # Localizzazione
│   └── game_data.json       # Dati del gioco
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
