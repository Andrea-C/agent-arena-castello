# Castello AI Agent Client - Design Notes

This document preserves the full design discussion for the AI Agent client, including all options considered and ideas for future development.

---

## API Access Strategies

Three strategies were discussed for how the AI Agent calls the Castello game server API:

### Option A: Code Execution

The agent receives the full API documentation in the system prompt and uses ADK's built-in Code Execution tool to generate and run HTTP requests at runtime.

- **Pros**: No custom tool code needed; the agent "figures it out"
- **Cons**: Fragile (agent might write bad HTTP code), sandboxed code execution may not have network access, failures are hard to debug
- **Verdict**: Not suitable as primary approach. Could be mentioned as a teaching contrast ("what not to do")

### Option B: Custom Function Tools (SELECTED)

Create Python function tools (`castello_register`, `castello_play`, `castello_status`) that wrap the API endpoints. The agent calls these tools by name.

- **Pros**: Clear, educational, reliable. Students learn about tools as first-class ADK concepts. Clean tool signatures, docstrings, error handling.
- **Cons**: Requires writing tool code upfront
- **Verdict**: Selected as the primary approach for all agents

### Option C: MCP Server

Create an MCP (Model Context Protocol) server that exposes the Castello API as MCP tools. Give the agent an MCP client to call them.

- **Pros**: Architecturally elegant, teaches a real-world integration pattern, tools are reusable across different agent frameworks
- **Cons**: Adds operational complexity (students must run the MCP server alongside the game server), more moving parts
- **Verdict**: Deferred to a future development round. Could be an advanced/optional variant

---

## Agent Progression

Four agent levels were discussed, showing increasing capability:

### Level 1: Simple Player (IMPLEMENTED)

- **Folder**: `agents/agent_01_simple_player/`
- **ADK concept**: Basic LLM Agent with function tools
- **Design**: Single `Agent` with 3 tools (register, play, status)
- **Memory**: Only ADK session conversation history (no persistence)
- **Limitation**: Loses track of earlier context as the session grows, gets stuck easily
- **Teaching**: What is an agent? What are tools? What is a system prompt?

### Level 2: Notekeeper (IMPLEMENTED)

- **Folder**: `agents/agent_02_notekeeper/`
- **ADK concept**: Persistent memory via custom tools
- **Design**: Single `Agent` with 5 tools (register, play, status + save_note, read_notes)
- **Memory**: Persistent markdown file for notes about rooms, items, connections
- **Improvement**: Can remember discoveries across game turns, avoids revisiting rooms
- **Teaching**: Why does memory matter? How to persist knowledge beyond the session window?

### Level 3: ReAct Explorer (IMPLEMENTED)

- **Folder**: `agents/agent_03_react_explorer/`
- **ADK concept**: `LoopAgent`, `SequentialAgent`, sub-agents with `output_key`, custom `BaseAgent`
- **Design**: `SequentialAgent` wrapping a setup phase + `LoopAgent` with 4 sub-agents:
  1. **Player Agent**: decides and executes the next action
  2. **Observer Agent**: analyzes the response, updates notes
  3. **Strategist Agent**: evaluates progress, sets goals
  4. **StopChecker**: custom `BaseAgent` that stops the loop on game over
- **Improvement**: Separation of concerns, iterative refinement, structured reasoning
- **Teaching**: Workflow agents, multi-step reasoning, specialization

### Level 4: Strategic Team (FUTURE)

- **Folder**: `agents/agent_04_strategic_team/` (not yet created)
- **ADK concept**: Multi-agent coordination with delegation
- **Design**: Coordinator agent routes to specialist agents:
  - **Explorer Agent**: focuses on movement and mapping
  - **Puzzle Solver Agent**: focuses on object interactions and puzzle logic
  - **Inventory Manager Agent**: decides what to pick up/drop (weight limit of 4 units)
- **Improvement**: Each specialist can be optimized for its domain
- **Teaching**: Multi-agent delegation, specialization, agent-as-tool pattern

---

## Future Ideas

### MCP Server Variant

- Create `castello-mcp-server/` with an MCP server wrapping the game API
- Create an agent variant that uses `mcp_tool.create_from_server()` instead of custom function tools
- Teaches MCP integration pattern without changing the game server

### Memory Enhancements

- **SQLite memory**: store notes in a database instead of a markdown file
- **Structured map**: maintain a graph of room connections as structured data
- **Vector search**: embed room descriptions for semantic search (e.g., "where did I see a key?")

### Evaluation Framework

- Score agents by: rooms explored, points earned, puzzles solved, moves used
- Compare different prompt strategies quantitatively
- Use ADK evaluation features if available

### Competitive Mode

- Multiple agents playing simultaneously on the same server
- Dashboard shows which agent is performing better
- Students compete to build the best-performing agent

---

## Model Configuration

### Free Tier Options

To ensure students can run agents for free:

- **Google Gemini**: `gemini-2.5-flash` offers a free tier with limited tokens
- **OpenRouter.ai**: provides access to various free models via a unified API

Each agent includes both options in code:
```python
# Option 1: Google Gemini (default)
MODEL_ID = 'gemini-2.5-flash'

# Option 2: OpenRouter.ai (uncomment and comment out Option 1)
# MODEL_ID = 'openrouter/google/gemini-2.5-flash'
```

### Server URL Configuration

The game server URL is configurable via `.env`:
```
CASTELLO_BASE_URL=http://localhost:3000        # Local development
CASTELLO_BASE_URL=http://<teacher_ip>:3000     # Classroom LAN
CASTELLO_BASE_URL=https://<public_url>         # Remote/internet
```

---

## Instruction Strategy

Agents ship with intentionally basic system prompts. Students improve them as a learning exercise.

Advanced prompt sections are provided in `agents/castello-agents-sample-instructions.md` as a reference. Students can copy sections into their agent to improve performance.
