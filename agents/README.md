# Castello AI Agents

AI agents that play "Avventura nel Castello" autonomously, built with [Google ADK](https://google.github.io/adk-docs/) (Agent Development Kit).

Six ready-made agents are included (3 English, 3 Italian), each demonstrating a different ADK concept. Your task is to customize and improve them!

## Available Agents

| Agent | Language | Description |
|-------|----------|-------------|
| `agent_01_simple_player` | EN | Basic agent with game tools. Memory is only session history. |
| `agent_01_simple_player_it` | IT | Same as above, with Italian system prompt. |
| `agent_02_notekeeper` | EN | Adds persistent notes in a markdown file. |
| `agent_02_notekeeper_it` | IT | Same as above, with Italian system prompt. |
| `agent_03_react_explorer` | EN | Autonomous loop: Player -> Observer -> Strategist -> StopChecker. |
| `agent_03_react_explorer_it` | IT | Same as above, with Italian system prompt. |

---

## Prerequisites

- **Python 3.10+** (required by Google ADK)
- **uv** (recommended) or **pip** for dependency management
- **Node.js 18+** (to run the game server)
- A free API key from **Google AI Studio** or **OpenRouter.ai**

### Install uv (if not already installed)

```bash
# Windows (PowerShell)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
```

---

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd castello
```

### 2. Start the Game Server

In a terminal, start the Node.js game server:

```bash
cd server-js
npm install
node app.js
```

The server starts at `http://localhost:3000`. Keep this terminal open.

You can verify it's running by visiting `http://localhost:3000/dashboard` in your browser.

### 3. Create and Activate the Virtual Environment

Open a **new terminal** and navigate to the `agents/` folder:

```bash
cd agents
```

Create and activate a virtual environment with `uv`:

```bash
# Create the virtual environment
uv venv

# Activate it
# Windows (PowerShell):
.venv\Scripts\Activate.ps1

# Windows (CMD):
.venv\Scripts\activate.bat

# macOS / Linux:
source .venv/bin/activate
```

### 4. Install Dependencies

```bash
uv pip install -r requirements.txt
```

This installs:
- `google-adk` -- the Agent Development Kit framework
- `requests` -- for HTTP calls to the game server
- `openai` -- needed for OpenRouter compatibility
- `litellm` -- needed to route requests to non-Google providers (OpenRouter, OpenAI, Anthropic, etc.)

### 5. Configure API Keys

Edit the `.env` file in the `agents/` folder.

#### Option A: Google Gemini (default)

Get a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey) and set it:

```env
GOOGLE_API_KEY=your_google_api_key_here
```

No other changes needed -- agents use `gemini-2.5-flash` by default.

#### Option B: OpenRouter.ai

Sign up at [OpenRouter.ai](https://openrouter.ai/) and get an API key. Some models are free!

**Two changes required:**

1. In `.env`, set your OpenRouter key:

```env
# GOOGLE_API_KEY=...          <-- comment this out
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

2. In each agent's `agent.py`, swap the model configuration block:

```python
# Comment out Option 1:
# MODEL = "gemini-2.5-flash"

# Uncomment the Option 2 block:
from google.adk.models.lite_llm import LiteLlm
MODEL = LiteLlm(
    model="openrouter/openai/gpt-oss-120b:free",
    api_key=os.getenv("OPENROUTER_API_KEY"),
    api_base="https://openrouter.ai/api/v1",
)
```

> **Note:** The `MODEL` change is needed in **every agent** you want to run with OpenRouter. ADK requires the `LiteLlm` wrapper class (not just a string) for OpenRouter models. You can change the model name to any model listed at [openrouter.ai/models](https://openrouter.ai/models) -- just keep the `openrouter/` prefix (e.g. `"openrouter/google/gemini-2.5-flash"`, `"openrouter/openai/gpt-oss-120b:free"`).

### 6. Configure the Game Server URL

If the game server is not on `localhost:3000` (e.g. running on a classroom LAN or the internet), edit `.env`:

```env
# Local (default):
CASTELLO_BASE_URL=http://localhost:3000

# Classroom LAN:
CASTELLO_BASE_URL=http://192.168.1.100:3000

# Remote server:
CASTELLO_BASE_URL=https://your-server.example.com
```

### 7. Launch the Agents

From the `agents/` folder (with the virtual environment active):

```bash
adk web
```

Open `http://localhost:8000` in your browser. You'll see a dropdown to select which agent to run.

Pick an agent and start chatting! For the simple agents, just say something like "Let's play!" and the agent will register and start the game.

---

## Player Credentials (Optional)

When an agent registers for the first time, its credentials are saved to `player_credentials.json`. On subsequent sessions, the agent automatically reloads these credentials instead of registering again -- so your saved games are preserved.

To start fresh with a new player, clear the fields in `player_credentials.json`:

```json
{
  "player_name": "",
  "player_key": "",
  "registered_at": ""
}
```

You can also manually set credentials here if you registered a player via curl/Postman and want the agent to use that player.

---

## Customizing the Agents

The agents ship with **intentionally basic system prompts**. They work, but they're not smart. Your job is to make them better!

### What to Improve

1. **System prompt** -- The `INSTRUCTION` variable in each `agent.py` controls how the agent behaves. Add game knowledge, exploration strategies, command references, etc.

2. **Model selection** -- Try different models to see how they perform. Smarter models reason better but cost more tokens.

3. **Tool usage** -- Agents 02+ have note-taking tools. Guide the agent on *when* and *what* to note.

4. **Sub-agent prompts** (Agent 03) -- Each sub-agent (Player, Observer, Strategist) has its own instruction. Improve them individually.

### Sample Instructions

Ready-to-use advanced prompt sections are provided in:

- `castello-agents-sample-instructions-en.md` (English)
- `castello-agents-sample-instructions-it.md` (Italian)

Copy sections from these files into your agent's `INSTRUCTION` to improve performance. Topics include:

- Complete command reference
- Systematic exploration strategies
- Note-taking strategies
- Puzzle-solving heuristics
- Game-specific tips (weight limits, timed events, mirror room)
- Improved sub-agent prompts for ReAct Explorer

---

## Project Structure

```
agents/
├── .env                                # API keys and server URL
├── requirements.txt                    # Python dependencies
├── player_credentials.json             # Saved player credentials (auto-generated)
├── README.md                           # This file
├── castello-agents-sample-instructions-en.md   # Advanced prompts (English)
├── castello-agents-sample-instructions-it.md   # Advanced prompts (Italian)
├── shared/                             # Shared tools (NOT an agent)
│   ├── castello_tools.py               # Game API tools
│   └── memory_tools.py                # Note-taking tools
├── agent_01_simple_player/             # Basic agent (EN)
├── agent_01_simple_player_it/          # Basic agent (IT)
├── agent_02_notekeeper/                # Agent with notes (EN)
├── agent_02_notekeeper_it/             # Agent with notes (IT)
├── agent_03_react_explorer/            # Autonomous loop agent (EN)
└── agent_03_react_explorer_it/         # Autonomous loop agent (IT)
```

### Shared Tools

All agents use the same tools from `shared/`:

| Tool | Description |
|------|-------------|
| `castello_register` | Register a player (credentials saved to file automatically) |
| `castello_load_player` | Load previously saved credentials |
| `castello_play` | Send game commands |
| `castello_status` | Check game state (room, points, moves) |
| `castello_set_language` | Change game language (en, it, es) |
| `castello_get_languages` | List supported languages |
| `save_note` | Save a note to game_notes.md |
| `read_notes` | Read saved notes |

---

## Troubleshooting

### "Invalid app name" error
Agent folder names must be valid Python identifiers (letters, digits, underscores only -- no hyphens, no leading digits). This is an ADK requirement.

### "Could not connect to game server"
Make sure the game server is running (`cd server-js && node app.js`) and the `CASTELLO_BASE_URL` in `.env` is correct.

### "You must register first"
The agent needs to call `castello_register` before it can play. If it's not doing this automatically, improve the system prompt to explicitly tell it to register first.

### API key errors
- **Google Gemini**: Make sure `GOOGLE_API_KEY` is set in `.env` and `MODEL` in `agent.py` is a plain string like `"gemini-2.5-flash"`.
- **OpenRouter**: Make sure `OPENROUTER_API_KEY` is set in `.env` AND `MODEL` in `agent.py` uses the `LiteLlm(...)` wrapper (not just a string). See the "Option B" instructions above.

### "Model ... not found" with OpenRouter
ADK only supports `openai/`, `groq/`, and `anthropic/` as string-based model prefixes. For **all other providers** (including OpenRouter), you must use the `LiteLlm` wrapper class. A plain string like `"openrouter/..."` will NOT work.

### Agent not using tools effectively
The LLM relies on tool docstrings and the system prompt to decide which tools to use. If the agent isn't using a tool, add explicit instructions in the `INSTRUCTION` variable telling it when and how to use it.
