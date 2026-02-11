"""
Agent 03: ReAct Explorer

An autonomous agent that plays the game in a loop. It uses a SequentialAgent
to first register and start the game, then a LoopAgent to repeatedly:
1. Execute a game action (Player)
2. Analyze the result and update notes (Observer)
3. Evaluate progress and plan next steps (Strategist)
4. Check if the game is over (StopChecker)

ADK concepts demonstrated:
- SequentialAgent for multi-step setup
- LoopAgent for iterative gameplay
- Sub-agents with output_key for data passing via session state
- Custom BaseAgent for stop conditions

Students: improve the sub-agent instructions below to make the agent smarter!
See agents/castello-agents-sample-instructions.md for ideas.
"""

import os
from google.adk.agents import Agent, SequentialAgent, LoopAgent, BaseAgent
from google.adk.agents.invocation_context import InvocationContext
from google.adk.events import Event, EventActions
from typing import AsyncGenerator
from shared.castello_tools import castello_register, castello_play, castello_status
from shared.memory_tools import save_note, read_notes

# --- Model Configuration ---------------------------------------------------
# Option 1: Google Gemini (default, free tier available)
MODEL = "gemini-2.5-flash"

# Option 2: OpenRouter.ai (uncomment the block below and comment out Option 1)
# Requires OPENROUTER_API_KEY in .env and litellm installed (pip install litellm)
# See https://openrouter.ai/models for available free models
# from google.adk.models.lite_llm import LiteLlm
# MODEL = LiteLlm(
#     model="openrouter/openai/gpt-oss-120b:free",
#     api_key=os.getenv("OPENROUTER_API_KEY"),
#     api_base="https://openrouter.ai/api/v1",
# )
# ---------------------------------------------------------------------------


# --- Setup Agent: registers and starts the game ----------------------------
setup_agent = Agent(
    name="setup",
    model=MODEL,
    instruction=(
        "Register as a player in the Castello game using castello_register, "
        "then start a new game by sending '1' with castello_play. "
        "Report what you see in the opening scene."
    ),
    tools=[castello_register, castello_play],
    output_key="last_action_result",
)


# --- Player Agent: executes game actions -----------------------------------
player_agent = Agent(
    name="player",
    model=MODEL,
    instruction=(
        "You are the player in a text adventure game. "
        "Consider the current strategy: {strategy}. "
        "Execute the next game action using castello_play. "
        "Report what happened."
    ),
    tools=[castello_play, castello_status],
    output_key="last_action_result",
)


# --- Observer Agent: analyzes results and takes notes ----------------------
observer_agent = Agent(
    name="observer",
    model=MODEL,
    instruction=(
        "Analyze the game response: {last_action_result}. "
        "Save any useful information to notes (rooms, exits, items, events). "
        "Summarize what happened and what you learned."
    ),
    tools=[save_note, read_notes],
    output_key="observation",
)


# --- Strategist Agent: evaluates progress and plans next steps -------------
strategist_agent = Agent(
    name="strategist",
    model=MODEL,
    instruction=(
        "Based on the observation: {observation}, decide what to do next. "
        "Read your notes to avoid revisiting places. "
        "Suggest a clear next action for the player."
    ),
    tools=[read_notes],
    output_key="strategy",
)


# --- Stop Checker: custom BaseAgent that stops the loop on game over -------
class GameOverChecker(BaseAgent):
    """Checks if the game has ended and stops the loop if so."""

    async def _run_async_impl(
        self, ctx: InvocationContext
    ) -> AsyncGenerator[Event, None]:
        result = str(ctx.session.state.get("last_action_result", ""))
        is_over = "game_over" in result.lower() or "player_died" in result.lower()
        yield Event(
            author=self.name,
            actions=EventActions(escalate=is_over),
        )


# --- Game Loop: iterate play -> observe -> strategize -> check -------------
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


# --- Root Agent: setup then loop -------------------------------------------
root_agent = SequentialAgent(
    name="react_explorer",
    description="An autonomous explorer that plays the castle game in a loop.",
    sub_agents=[setup_agent, game_loop],
)
