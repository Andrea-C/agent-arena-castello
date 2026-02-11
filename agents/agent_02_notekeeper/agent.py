"""
Agent 02: Notekeeper

An improved agent that can save and read notes, giving it persistent memory
across game turns. The notes are stored in a markdown file (game_notes.md)
so they survive even if the session is restarted.

ADK concepts demonstrated:
- LLM Agent with function tools
- Persistent memory via custom tools
- Richer system prompt guiding note-taking behavior

Students: improve the instruction below to make the agent play better!
See agents/castello-agents-sample-instructions.md for ideas.
"""

import os
from google.adk.agents import Agent
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

# --- Agent Instruction (intentionally basic — students improve this!) ------
INSTRUCTION = """You are playing a text adventure game called "Avventura nel Castello".

Your goal is to explore the castle, solve puzzles, and try to escape.

Steps to start:
1. Register as a player using the castello_register tool
2. Start a new game by sending "1" with the castello_play tool
3. Then send game commands to play (e.g. NORD, SUD, GUARDA, PRENDI ...)

You have note-taking tools! Use save_note to remember important things
you discover (rooms, items, exits, what worked and what didn't).
Use read_notes to review what you already know before deciding your next move.

Explore the castle, take notes, and try to make progress. Good luck!
"""
# ---------------------------------------------------------------------------

root_agent = Agent(
    model=MODEL,
    name="notekeeper",
    description="A text adventure player that keeps notes about its discoveries.",
    instruction=INSTRUCTION,
    tools=[castello_register, castello_play, castello_status, save_note, read_notes],
)
