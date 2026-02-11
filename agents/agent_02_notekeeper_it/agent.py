"""
Agent 02: Notekeeper (IT)

Un agente migliorato che può salvare e leggere appunti, dandogli una memoria
persistente tra i turni di gioco. Gli appunti sono salvati in un file markdown
(game_notes.md) così sopravvivono anche se la sessione viene riavviata.

Concetti ADK dimostrati:
- Agente LLM con function tools
- Memoria persistente tramite strumenti personalizzati
- System prompt più ricco che guida il comportamento di presa appunti

Studenti: migliorate l'istruzione qui sotto per far giocare meglio l'agente!
Consultate agents/castello-agents-sample-instructions-it.md per idee.
"""

import os
from google.adk.agents import Agent
from shared.castello_tools import castello_register, castello_play, castello_status
from shared.memory_tools import save_note, read_notes

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
#     api_base="https://openrouter.ai/api/v1",
# )
# ---------------------------------------------------------------------------

# --- Istruzione dell'Agente (volutamente basilare — gli studenti la migliorano!) ---
INSTRUCTION = """Stai giocando a un'avventura testuale chiamata "Avventura nel Castello".

Il tuo obiettivo è esplorare il castello, risolvere enigmi e cercare di fuggire.

Passi per iniziare:
1. Registrati come giocatore usando lo strumento castello_register
2. Inizia una nuova partita inviando "1" con lo strumento castello_play
3. Poi invia comandi di gioco per giocare (es. NORD, SUD, GUARDA, PRENDI ...)

Hai strumenti per prendere appunti! Usa save_note per ricordare le cose
importanti che scopri (stanze, oggetti, uscite, cosa ha funzionato e cosa no).
Usa read_notes per rivedere cosa già sai prima di decidere la prossima mossa.

Esplora il castello, prendi appunti e cerca di fare progressi. Buona fortuna!
"""
# ---------------------------------------------------------------------------

root_agent = Agent(
    model=MODEL,
    name="notekeeper_it",
    description="Un giocatore di avventure testuali che prende appunti sulle sue scoperte.",
    instruction=INSTRUCTION,
    tools=[castello_register, castello_play, castello_status, save_note, read_notes],
)
