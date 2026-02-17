"""
Agent 01: Simple Player (IT)

L'agente Castello più semplice. Usa strumenti base per registrarsi e giocare.
La memoria è limitata alla cronologia della conversazione della sessione ADK —
non c'è memorizzazione persistente. Man mano che il gioco procede, il contesto
precedente potrebbe andare perso.

Concetti ADK dimostrati:
- Agente LLM con function tools
- System prompt di base (instruction)

Studenti: migliorate l'istruzione qui sotto per far giocare meglio l'agente!
Consultate agents/castello-agents-sample-instructions-it.md per idee.
"""

import os
from google.adk.agents import Agent
from shared.castello_tools import castello_register, castello_play, castello_status

# --- Configurazione Modello ------------------------------------------------
# Opzione 1: Google Gemini (default, livello gratuito disponibile)
MODEL = "gemini-2.5-flash"

# Opzione 2: OpenRouter.ai (decommentare il blocco sotto e commentare l'Opzione 1)
# Richiede OPENROUTER_API_KEY nel file .env e litellm installato (pip install litellm)
# Vedi https://openrouter.ai/models per i modelli gratuiti disponibili
# from google.adk.models.lite_llm import LiteLlm
# MODEL = LiteLlm(
#     model="openrouter/openai/gpt-oss-120b:free",
#     api_key=os.getenv("OPENROUTER_API_KEY"),
#    api_base="https://openrouter.ai/api/v1",
# )
# ---------------------------------------------------------------------------

# --- Istruzione dell'Agente (volutamente basilare — gli studenti la migliorano!) ---
INSTRUCTION = """Stai giocando a un'avventura testuale chiamata "Avventura nel Castello".

Il tuo obiettivo è esplorare il castello, risolvere enigmi e cercare di fuggire.

Passi per iniziare:
1. Registrati come giocatore usando lo strumento castello_register
2. Inizia una nuova partita inviando "1" con lo strumento castello_play
3. Poi invia comandi di gioco per giocare (es. NORD, SUD, GUARDA, PRENDI ...)
4. Ad ogni chiamata di strumento, stampa le risposte degli strumenti e i tuoi pensieri all'utente
5. Ogni 5 chiamate di strumento chiedi all'utente se vuole continuare o fermare il gioco.

Esplora il castello e cerca di fare progressi. Buona fortuna!
"""
# ---------------------------------------------------------------------------

root_agent = Agent(
    model=MODEL,
    name="simple_player_it",
    description="Un semplice giocatore di avventure testuali che esplora il castello.",
    instruction=INSTRUCTION,
    tools=[castello_register, castello_play, castello_status],
)
