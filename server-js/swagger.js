/**
 * Swagger/OpenAPI configuration
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Avventura nel Castello - API',
            version: '1.0.0',
            description: `
API per giocare ad "Avventura nel Castello", un gioco testuale interattivo.

## Come iniziare

1. **Registrati** usando l'endpoint \`/register\` con un nome utente univoco
2. **Ricevi la chiave** (player_key) - conservala, serve per tutte le chiamate
3. **Controlla lo stato** con \`/status\` per vedere se hai una partita in corso
4. **Gioca** usando \`/play\` - invia comandi come NORD, SUD, PRENDI, etc.

## Comandi principali

- **Movimento**: NORD (N), SUD (S), EST (E), OVEST (O), ALTO (A), BASSO (B)
- **Azioni**: PRENDI, LASCIA, GUARDA, APRI, USA, etc.
- **Sistema**: PUNTI, MOSSE, SALVA, CARICA, BASTA

## Stato del giocatore

- **NOT_PLAYING**: Il giocatore può iniziare una nuova partita o caricare un salvataggio
- **PLAYING**: Il giocatore sta giocando e può inviare comandi

            `,
            contact: {
                name: 'Avventura nel Castello'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Server di sviluppo'
            }
        ],
        tags: [
            {
                name: 'Auth',
                description: 'Registrazione e autenticazione'
            },
            {
                name: 'Game',
                description: 'Endpoints di gioco'
            },
            {
                name: 'Dashboard',
                description: 'Monitoraggio delle sessioni'
            }
        ]
    },
    apis: ['./routes/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
