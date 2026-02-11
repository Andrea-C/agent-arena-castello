"""
Agent 01: Simple Player

The simplest Castello agent. Uses basic tools to register and play the game.
Memory is limited to the ADK session conversation history — there is no
persistent storage. As the game progresses, earlier context may be lost.

ADK concepts demonstrated:
- LLM Agent with function tools
- Basic system prompt (instruction)

Students: improve the instruction below to make the agent play better!
See agents/castello-agents-sample-instructions.md for ideas.
"""

import os
from google.adk.agents import Agent
from shared.castello_tools import castello_register, castello_play, castello_status

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
4. Every tool call, print the tools responses and your thoughts to the user
5. Every 5 tool calls ask the user if he wants to continue or stop the game.

Explore the castle and try to make progress. Good luck!
"""
# ---------------------------------------------------------------------------

root_agent = Agent(
    model=MODEL,
    name="simple_player",
    description="A simple text adventure player that explores the castle.",
    instruction=INSTRUCTION,
    tools=[castello_register, castello_play, castello_status],
)
