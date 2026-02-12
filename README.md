# Agent Arena: Avventura nel Castello

An educational project where students build **AI agents** that play a classic Italian text adventure game autonomously.

## Purpose

This project is designed for **teaching AI agent development** in the classroom. Students learn to:

- Build AI agents using the [Google Agent Development Kit (ADK)](https://google.github.io/adk-docs/)
- Connect agents to a real REST API backend
- Write effective system prompts and strategies
- Use function tools, persistent memory, and multi-agent workflows
- Experiment with different LLM models (Google Gemini, OpenRouter)

The game server acts as a controlled, deterministic environment where students can measure and compare how well their agents perform -- how many rooms they explore, puzzles they solve, and whether they escape the castle.

## How It Works

The project has two main components:

```
                 ┌─────────────────┐        HTTP/REST        ┌─────────────────┐
                 │   AI Agent       │ ◄────────────────────► │   Game Server    │
                 │   (Python/ADK)   │   /register            │   (Node.js)      │
                 │                  │   /play                 │                  │
                 │  LLM + Tools     │   /status               │  Game Engine     │
                 └─────────────────┘                         │  SQLite DB       │
                                                             │  Dashboard       │
                                                             └─────────────────┘
```

1. **Game Server** (`server-js/`) -- A Node.js/Express REST API that runs the text adventure game engine. It manages player registration, game state, room navigation, puzzles, inventory, and scoring. A live dashboard lets you monitor all players.

2. **AI Agents** (`agents/`) -- Python agents built with Google ADK that call the game server API. They register as players, send game commands, and try to explore the castle autonomously. Three progressive agent levels are included as starting points:

   | Level | Agent | What It Teaches |
   |-------|-------|-----------------|
   | 1 | **Simple Player** | Basic LLM agent + function tools |
   | 2 | **Notekeeper** | Adds persistent memory (markdown notes) |
   | 3 | **ReAct Explorer** | Autonomous loop with specialized sub-agents |

   Each agent comes in English and Italian versions. Students start with these ready-made agents and improve them by writing better prompts, strategies, and tool usage.

## Getting Started

### 1. Start the Game Server

```bash
cd server-js
npm install
npm start
```

The server runs at `http://localhost:3000`. Visit `http://localhost:3000/dashboard` to monitor players.

### 2. Set Up and Run the AI Agents

See [`agents/README.md`](agents/README.md) for detailed instructions on:
- Creating a Python virtual environment
- Installing dependencies
- Configuring API keys (Google Gemini or OpenRouter)
- Launching and customizing the agents

### 3. API Documentation

The full API reference is available at `http://localhost:3000/arcane-scrolls` (Swagger UI) when the server is running, and also documented in [`castello-api.md`](castello-api.md).

## Project Structure

```
castello/
├── server-js/              # Game server (Node.js/Express REST API)
├── agents/                 # AI agents (Python/Google ADK)
│   ├── shared/             # Shared tools (API calls, memory)
│   ├── agent_01_*/         # Level 1: Simple Player (EN + IT)
│   ├── agent_02_*/         # Level 2: Notekeeper (EN + IT)
│   └── agent_03_*/         # Level 3: ReAct Explorer (EN + IT)
├── source_app/             # Original browser webapp (reference only)
├── docs/                   # Project documentation
├── castello-api.md         # Full API reference
├── AGENTS.md               # Detailed technical reference for AI tools
└── README.md               # This file
```

## Credits and Origin

This project is based on **"Avventura nel Castello"**, a classic Italian text adventure game originally written for MS-DOS by **Enrico Colombini** and **Chiara Tovena**.

The game was later ported to a browser-based JavaScript webapp by **Federico Volpini**, available at [avventuranelcastello-js.it](https://avventuranelcastello-js.it/). The JavaScript port is distributed under CC BY-NC-ND 4.0 license with the consent of the original authors.

This repository takes the game further by restructuring it into a **client-server architecture** with a REST API backend, enabling AI agents to play the game programmatically. The server-side port and the AI agent framework are original work created for educational purposes.

## License

The game content and logic are derived from the original "Avventura nel Castello" and its JavaScript port. Please refer to the original authors' licensing terms for the game content. The server architecture and AI agent code in this repository are provided for educational use.
