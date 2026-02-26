"""
Agent 03: ReAct Explorer (IT)

Un agente autonomo che gioca in un ciclo. Usa un SequentialAgent per prima
registrarsi e avviare il gioco, poi un LoopAgent per ripetutamente:
1. Eseguire un'azione di gioco (Giocatore)
2. Analizzare il risultato e aggiornare gli appunti (Osservatore)
3. Valutare i progressi e pianificare i prossimi passi (Stratega)
4. Controllare se il gioco è finito (ControlloreFinale)

Concetti ADK dimostrati:
- SequentialAgent per setup multi-fase
- LoopAgent per gameplay iterativo
- Sub-agent con output_key per passaggio dati tramite stato sessione
- BaseAgent personalizzato per condizioni di arresto

Studenti: migliorate le istruzioni dei sub-agent qui sotto per rendere
l'agente più intelligente!
Consultate agents/castello-agents-sample-instructions-it.md per idee.
"""

import os
from google.adk.agents import Agent, SequentialAgent, LoopAgent, BaseAgent
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event, EventActions
from typing import AsyncGenerator
from shared.castello_tools import castello_register, castello_play, castello_status
from shared.memory_tools import save_note, read_notes

# --- Configurazione Modello ------------------------------------------------
# Opzione 1: Google Gemini (default, livello gratuito disponibile)
MODEL = "gemini-2.5-flash-lite"

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


# --- Agente Setup: registra e avvia il gioco -------------------------------
setup_agent = Agent(
    name="setup",
    model=MODEL,
    instruction=(
        "Registrati come giocatore nel gioco Castello usando castello_register, "
        "poi inizia una nuova partita inviando '1' con castello_play. "
        "Riporta cosa vedi nella scena iniziale."
    ),
    tools=[castello_register, castello_play],
    output_key="last_action_result",
)


# --- Agente Giocatore: esegue azioni di gioco -----------------------------
player_agent = Agent(
    name="player",
    model=MODEL,
    instruction=(
        "Sei il giocatore in un'avventura testuale. "
        "Considera la strategia attuale: {strategy}. "
        "Esegui la prossima azione di gioco usando castello_play. "
        "Riporta cosa è successo."
    ),
    tools=[castello_play, castello_status],
    output_key="last_action_result",
)


# --- Agente Osservatore: analizza i risultati e prende appunti ------------
observer_agent = Agent(
    name="observer",
    model=MODEL,
    instruction=(
        "Analizza la risposta del gioco: {last_action_result}. "
        "Salva qualsiasi informazione utile negli appunti (stanze, uscite, oggetti, eventi). "
        "Riassumi cosa è successo e cosa hai imparato."
    ),
    tools=[save_note, read_notes],
    output_key="observation",
)


# --- Agente Stratega: valuta i progressi e pianifica i prossimi passi -----
strategist_agent = Agent(
    name="strategist",
    model=MODEL,
    instruction=(
        "Basandoti sull'osservazione: {observation}, decidi cosa fare dopo. "
        "Leggi i tuoi appunti per evitare di rivisitare posti già visti. "
        "Suggerisci un'azione chiara per il giocatore."
    ),
    tools=[read_notes],
    output_key="strategy",
)


# --- Controllore Fine Gioco: BaseAgent personalizzato che ferma il ciclo --
class GameOverChecker(BaseAgent):
    """Controlla se il gioco è finito e ferma il ciclo in tal caso."""

    async def _run_async_impl(
        self, ctx: InvocationContext
    ) -> AsyncGenerator[Event, None]:
        result = str(ctx.session.state.get("last_action_result", ""))
        is_over = "game_over" in result.lower() or "player_died" in result.lower()
        yield Event(
            author=self.name,
            actions=EventActions(escalate=is_over),
        )


# --- Ciclo di Gioco: gioca -> osserva -> strategizza -> controlla ---------
game_loop = LoopAgent(
    name="game_loop",
    max_iterations=50,
    sub_agents=[
        player_agent,
        observer_agent,
        strategist_agent,
        GameOverChecker(name="stop_checker"),
    ],
)


# --- Agente Principale: setup poi ciclo -----------------------------------
root_agent = SequentialAgent(
    name="react_explorer_it",
    description="Un esploratore autonomo che gioca all'avventura del castello in un ciclo.",
    sub_agents=[setup_agent, game_loop],
)
