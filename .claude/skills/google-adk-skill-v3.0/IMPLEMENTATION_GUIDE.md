# Google ADK Implementation Guide

## Overview

This guide provides the essential information needed to implement AI agents using Google's Agent Development Kit. Based on the official documentation (https://google.github.io/adk-docs/), this guide focuses on practical implementation details.

## Core Concepts

### What is Google ADK?

Google ADK is a flexible, modular framework for building AI agents that:
- Works with any LLM (optimized for Gemini)
- Supports complex multi-agent architectures  
- Provides workflow orchestration (Sequential, Parallel, Loop)
- Offers rich tool ecosystem
- Enables deployment anywhere (local, Cloud Run, GKE, Vertex AI)

### Key Components

1. **Agents**: The thinking units (LLM, Workflow, Custom)
2. **Tools**: Capabilities agents can use (functions, APIs, other agents)
3. **Sessions**: Conversation state and history management
4. **Runner**: Orchestrates agent execution
5. **Services**: Backend for persistence (SessionService, ArtifactService)

## Documentation Structure

The complete documentation in this skill includes:

```
google-adk-skill/
├── SKILL.md                    # Skill metadata and overview
├── doc-instructions.md         # How to navigate documentation
├── README.md                   # This file
├── IMPLEMENTATION_GUIDE.md     # Implementation essentials (this file)
├── agents/
│   ├── quickstart.md          # ✅ Complete - Getting started
│   ├── llm-agents.md          # 📝 To create - LLM agent details
│   ├── workflow-agents.md     # 📝 To create - Sequential/Parallel/Loop
│   ├── multi-agents.md        # 📝 To create - Multi-agent systems
│   └── custom-agents.md       # 📝 To create - Custom agent types
├── tools/
│   ├── overview.md            # 📝 To create - Available tools
│   ├── function-tools.md      # 📝 To create - Creating custom tools
│   ├── built-in-tools.md      # 📝 To create - Google/third-party tools
│   └── mcp-tools.md           # 📝 To create - MCP integration
├── runtime/
│   ├── runner.md              # 📝 To create - Local execution
│   ├── deployment.md          # 📝 To create - Production deployment
│   └── observability.md       # 📝 To create - Monitoring
├── concepts/
│   ├── overview.md            # 📝 To create - ADK architecture
│   ├── sessions.md            # 📝 To create - State management
│   ├── context.md             # 📝 To create - Memory and caching
│   └── events.md              # 📝 To create - Event system
├── examples/
│   └── patterns.md            # 📝 To create - Common patterns
└── reference/
    └── api-quick-ref.md       # 📝 To create - API reference
```

## Essential Implementation Patterns

### 1. Basic LLM Agent with Tools

```python
from google.adk.agents import Agent

def my_tool(param: str) -> dict:
    """Tool description for LLM.
    
    Args:
        param (str): Parameter description
    
    Returns:
        dict: Result with status
    """
    return {"status": "success", "result": f"Processed: {param}"}

agent = Agent(
    model='gemini-2.0-flash',
    name='my_agent',
    description='Agent description for routing',
    instruction='Detailed behavior instructions',
    tools=[my_tool]
)
```

### 2. Sequential Workflow

```python
from google.adk.agents import Agent, SequentialAgent

step1 = Agent(
    name='fetcher',
    model='gemini-2.0-flash',
    instruction='Fetch data',
    output_key='data'  # Saves output to state['data']
)

step2 = Agent(
    name='processor',
    model='gemini-2.0-flash',
    instruction='Process data from {data}',  # Reads state['data']
    output_key='result'
)

pipeline = SequentialAgent(
    name='pipeline',
    sub_agents=[step1, step2]
)
```

### 3. Multi-Agent Coordination

```python
from google.adk.agents import Agent

# Specialist agents
billing = Agent(
    name='billing',
    model='gemini-2.0-flash',
    description='Handles billing inquiries'
)

support = Agent(
    name='support',
    model='gemini-2.0-flash',
    description='Handles technical support'
)

# Coordinator with LLM-driven delegation
coordinator = Agent(
    name='coordinator',
    model='gemini-2.0-flash',
    instruction='Route requests to billing or support agents',
    sub_agents=[billing, support]
)
```

### 4. Running an Agent

```python
import asyncio
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

async def run_agent():
    # Setup
    session_service = InMemorySessionService()
    session = await session_service.create_session(
        app_name='my_app',
        user_id='user123',
        session_id='session123'
    )
    
    runner = Runner(
        agent=agent,
        app_name='my_app',
        session_service=session_service
    )
    
    # Execute
    user_message = types.Content(
        role='user',
        parts=[types.Part(text='Hello!')]
    )
    
    async for event in runner.run_async(
        user_id='user123',
        session_id='session123',
        new_message=user_message
    ):
        if event.is_final_response():
            print(event.content.parts[0].text)

asyncio.run(run_agent())
```

## Critical Implementation Details

### Tool Design

**Required:**
- Clear function name
- Comprehensive docstring
- Type hints for all parameters
- Return dict (recommended) or will be auto-wrapped

**Example:**
```python
def search_database(query: str, limit: int = 10) -> dict:
    """Search the database for matching records.
    
    Args:
        query (str): Search query string
        limit (int, optional): Maximum results. Defaults to 10.
    
    Returns:
        dict: Search results with status and data
    """
    return {
        "status": "success",
        "count": 5,
        "results": [...]
    }
```

### State Management

**Key Points:**
- State is stored in `session.state` dictionary
- Use `output_key` to automatically save agent output
- Access state in instructions with `{variable_name}` syntax
- Temporary state with `temp:` prefix (cleared after invocation)

**Example:**
```python
# Agent saves to state
agent1 = Agent(
    name='agent1',
    output_key='data',  # Saves output to state['data']
    ...
)

# Agent reads from state
agent2 = Agent(
    name='agent2',
    instruction='Process the {data} from previous step',  # Reads state['data']
    ...
)
```

### Multi-Agent Patterns

#### Pattern: Coordinator/Dispatcher
```python
coordinator = Agent(
    name='coordinator',
    instruction='Route to appropriate specialist',
    sub_agents=[specialist1, specialist2, ...]
)
# LLM calls transfer_to_agent(agent_name='specialist1')
```

#### Pattern: Sequential Pipeline
```python
pipeline = SequentialAgent(
    name='pipeline',
    sub_agents=[validate, process, respond]
)
# Executes in order, shares state
```

#### Pattern: Parallel Fan-Out
```python
parallel_fetch = ParallelAgent(
    name='fetchers',
    sub_agents=[fetch_api1, fetch_api2]
)

workflow = SequentialAgent(
    sub_agents=[parallel_fetch, synthesizer]
)
# APIs fetch concurrently, then synthesizer combines results
```

#### Pattern: Iterative Refinement
```python
refiner = Agent(name='refiner', output_key='code')
checker = Agent(name='checker', output_key='status')

class StopChecker(BaseAgent):
    async def _run_async_impl(self, ctx):
        done = ctx.session.state.get('status') == 'pass'
        yield Event(actions=EventActions(escalate=done))

loop = LoopAgent(
    name='refine_loop',
    max_iterations=5,
    sub_agents=[refiner, checker, StopChecker(name='stopper')]
)
```

## Model Configuration

### Available Gemini Models
- `gemini-2.0-flash` - Fast, good for most tasks
- `gemini-2.5-flash` - Faster, better general purpose
- `gemini-2.5-pro` - Best capabilities, slower

### Model-Agnostic Support
ADK supports other models through appropriate configuration. See official docs for details.

### Generation Config
```python
from google.genai import types

agent = Agent(
    model='gemini-2.0-flash',
    generate_content_config=types.GenerateContentConfig(
        temperature=0.2,  # Lower = more deterministic
        max_output_tokens=1000,
        top_p=0.95,
        top_k=40
    ),
    ...
)
```

## Deployment Options

### Local Development
```bash
adk run      # CLI interface
adk web      # Web interface at localhost:8000
```

### Production Deployment
1. **Vertex AI Agent Engine** - Managed Google Cloud service
2. **Cloud Run** - Serverless containers
3. **GKE** - Kubernetes clusters
4. **Custom** - Your own infrastructure

See `runtime/deployment.md` for detailed deployment guides.

## Session Management

### Session Services
```python
# In-memory (development)
from google.adk.sessions import InMemorySessionService
session_service = InMemorySessionService()

# Vertex AI (production)
from google.adk.sessions import VertexAiSessionService
session_service = VertexAiSessionService(
    project='your-project',
    location='us-central1'
)

# Database (custom)
from google.adk.sessions import DatabaseSessionService
session_service = DatabaseSessionService(connection_string=...)
```

### Session Lifecycle
1. Create or resume session
2. Runner loads session state and history
3. Agent processes with context
4. Runner saves events and state updates
5. Session persisted for next turn

## Advanced Features

### Structured Output
```python
from pydantic import BaseModel, Field

class OutputSchema(BaseModel):
    result: str = Field(description="The result")
    confidence: float = Field(description="Confidence score")

agent = Agent(
    output_schema=OutputSchema,
    output_key='structured_result',
    ...
)
```

### Callbacks
```python
def before_model(ctx):
    print(f"About to call LLM with: {ctx.messages}")

def after_model(ctx):
    print(f"LLM returned: {ctx.response}")

agent = Agent(
    before_model_callback=before_model,
    after_model_callback=after_model,
    ...
)
```

### Context Control
```python
agent = Agent(
    include_contents='default',  # or 'none' for stateless
    ...
)
```

### Agent as Tool
```python
from google.adk.tools import agent_tool

specialist = Agent(name='specialist', ...)
tool = agent_tool.AgentTool(agent=specialist)

main_agent = Agent(
    tools=[tool],
    ...
)
```

## Best Practices

### 1. Instructions
- Be specific and detailed
- Include examples when possible
- Explain when to use each tool
- Define output format expectations

### 2. Tools
- Keep functions focused (single responsibility)
- Return meaningful error messages
- Use descriptive parameter names
- Include comprehensive docstrings

### 3. State Management
- Use clear, descriptive keys
- Clean up temporary data
- Document state dependencies
- Use `temp:` prefix for invocation-scoped data

### 4. Error Handling
- Tools should return error information in dict
- Use try/except in tool implementations
- Provide helpful error messages for LLM

### 5. Testing
- Start with simple agents
- Test tools independently
- Verify state transitions
- Monitor LLM token usage

### 6. Performance
- Use appropriate model for task complexity
- Implement async tools for I/O operations
- Cache expensive computations
- Monitor and optimize tool execution time

## Common Issues and Solutions

### Issue: Agent not using tool
**Solution:** Check:
- Tool docstring is clear
- Function name is descriptive
- Instruction mentions when to use tool
- Parameters have type hints

### Issue: State not persisting
**Solution:** Ensure:
- Using appropriate SessionService
- Events are being yielded properly
- State deltas are included in events
- Session is being saved

### Issue: Slow responses
**Solution:** Consider:
- Using faster model (gemini-2.0-flash)
- Implementing tool caching
- Reducing context size
- Parallel agent execution

### Issue: Tool errors
**Solution:** Verify:
- Return type is dict or properly handled
- Error cases return informative messages
- Type hints match actual parameters
- Tool is properly registered

## Next Steps

### For New Users
1. Complete `agents/quickstart.md`
2. Build a simple tool-using agent
3. Experiment with sequential workflows
4. Try multi-agent coordination

### For Building Production Systems
1. Study `agents/multi-agents.md` for architecture patterns
2. Review `tools/function-tools.md` for robust tool design
3. Implement proper error handling and logging
4. Set up `runtime/observability.md` monitoring
5. Follow `runtime/deployment.md` for production deployment

### For Advanced Use Cases
1. Custom agent implementations
2. Complex multi-agent hierarchies
3. Integration with external systems (MCP, OpenAPI)
4. Performance optimization and caching
5. Safety and evaluation frameworks

## Resources

- **Official Docs**: https://google.github.io/adk-docs/
- **This Skill**: Comprehensive offline documentation
- **Examples**: See `examples/patterns.md` for code patterns
- **API Reference**: See `reference/api-quick-ref.md`

## Documentation Status

✅ **Complete:**
- SKILL.md - Skill overview
- doc-instructions.md - Navigation guide
- agents/quickstart.md - Quick start guide
- IMPLEMENTATION_GUIDE.md - This file

📝 **Pending:**
Additional detailed files can be created by fetching from official documentation and following the established patterns in this skill.

## Contributing to This Skill

To expand this skill with additional documentation:
1. Fetch relevant pages from https://google.github.io/adk-docs/
2. Extract Python-specific content
3. Create markdown files following existing structure
4. Include complete, runnable examples
5. Update navigation in SKILL.md and doc-instructions.md

## Summary

This skill provides:
- ✅ Complete quick start guide
- ✅ Essential implementation patterns
- ✅ Best practices and common pitfalls
- ✅ Framework for additional documentation
- ✅ Clear navigation structure

Use progressive disclosure: start with what you need, drill down as required. All examples are complete and runnable with proper setup.

For the latest information and updates, always refer to the official Google ADK documentation.
