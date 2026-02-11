## Quick API Reference

### Agent Creation

```python
from google.adk.agents import Agent

agent = Agent(
    model='gemini-2.0-flash',  # Required
    name='agent_name',  # Required
    description='What it does',  # For routing
    instruction='Detailed behavior',  # Core instructions
    tools=[...],  # List of tools
    sub_agents=[...],  # Child agents
    output_key='state_key',  # Save response to state
    input_schema=Schema,  # Pydantic model
    output_schema=Schema,  # Pydantic model
    generate_content_config=Config,  # LLM settings
    include_contents='default',  # or 'none'
    global_instruction='...',  # For all sub-agents
    planner=Planner,  # Planning strategy
    code_executor=Executor,  # Code execution
)
```

### Workflow Agents

```python
from google.adk.agents import SequentialAgent, ParallelAgent, LoopAgent

sequential = SequentialAgent(
    name='pipeline',
    sub_agents=[agent1, agent2, agent3]
)

parallel = ParallelAgent(
    name='concurrent',
    sub_agents=[agent1, agent2]
)

loop = LoopAgent(
    name='loop',
    max_iterations=10,
    sub_agents=[agent1, agent2]
)
```

### Function Tools

```python
def my_tool(param: str, optional: int = 10) -> dict:
    """Tool description for LLM.
    
    Args:
        param (str): Required parameter
        optional (int): Optional with default
    
    Returns:
        dict: Result dictionary
    """
    return {"status": "success", "result": "value"}

agent = Agent(tools=[my_tool], ...)
```

### Sessions

```python
from google.adk.sessions import InMemorySessionService

session_service = InMemorySessionService()

session = await session_service.create_session(
    app_name='app',
    user_id='user',
    session_id='session',  # Optional
    state={...}  # Optional initial state
)

session = await session_service.get_session(
    app_name='app',
    user_id='user',
    session_id='session'
)

await session_service.delete_session(
    app_name='app',
    user_id='user',
    session_id='session'
)
```

### Runner

```python
from google.adk.runners import Runner
from google.genai import types

runner = Runner(
    agent=agent,
    app_name='app',
    session_service=session_service
)

message = types.Content(
    role='user',
    parts=[types.Part(text='Hello!')]
)

async for event in runner.run_async(
    user_id='user',
    session_id='session',
    new_message=message
):
    if event.is_final_response():
        print(event.content.parts[0].text)
```

### State Management

```python
# Write to state
agent = Agent(output_key='data', ...)

# Read from state
agent = Agent(instruction='Process {data}', ...)

# Temporary state (cleared after invocation)
ctx.session.state['temp:key'] = value
```

### Events

```python
# Check event type
if event.is_final_response():
    # Final response event
    pass

if event.partial:
    # Streaming partial event
    pass

# Access content
if event.content:
    for part in event.content.parts:
        if part.text:
            print(part.text)
        elif part.function_call:
            print(part.function_call.name)
        elif part.function_response:
            print(part.function_response)
```

### Common Imports

```python
# Agents
from google.adk.agents import Agent, SequentialAgent, ParallelAgent, LoopAgent, BaseAgent

# Sessions
from google.adk.sessions import InMemorySessionService, VertexAiSessionService

# Runner
from google.adk.runners import Runner

# Events
from google.adk.events import Event, EventActions

# Tools
from google.adk.tools import google_search, code_execution, agent_tool
from google.adk.tools import LongRunningFunctionTool

# Types
from google.genai import types
from pydantic import BaseModel, Field

# Async
import asyncio
```

### Complete Minimal Example

```python
import asyncio
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

async def main():
    # Create components
    agent = Agent(
        model='gemini-2.0-flash',
        name='my_agent',
        instruction='You are helpful'
    )
    
    session_service = InMemorySessionService()
    session = await session_service.create_session(
        app_name='app',
        user_id='user'
    )
    
    runner = Runner(
        agent=agent,
        app_name='app',
        session_service=session_service
    )
    
    # Run agent
    message = types.Content(
        role='user',
        parts=[types.Part(text='Hello!')]
    )
    
    async for event in runner.run_async(
        user_id='user',
        session_id=session.id,
        new_message=message
    ):
        if event.is_final_response():
            print(event.content.parts[0].text)

asyncio.run(main())
```

---

# END OF DOCUMENTATION

This file contains all essential Google ADK documentation consolidated.
Split into individual files as needed following the structure in SKILL.md.

For the latest information, visit: https://google.github.io/adk-docs/
