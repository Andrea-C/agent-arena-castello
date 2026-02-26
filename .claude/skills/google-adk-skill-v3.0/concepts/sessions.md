## Overview

Sessions in ADK track individual conversation threads, maintaining state and history across multiple turns.

## The Session Object

```python
from google.adk.sessions import Session

# Session properties:
session.id              # Unique identifier
session.app_name        # Application name
session.user_id         # User identifier
session.state           # Dictionary for temporary data
session.events          # Chronological list of Event objects
session.last_update_time # Timestamp of last activity
```

## SessionService

Manages session lifecycle: create, retrieve, update, delete.

### InMemorySessionService

For development and testing (non-persistent):

```python
from google.adk.sessions import InMemorySessionService

session_service = InMemorySessionService()

# Create session
session = await session_service.create_session(
    app_name='my_app',
    user_id='user123',
    session_id='session456',  # Optional, auto-generated if not provided
    state={'initial_key': 'initial_value'}  # Optional initial state
)

# Get session
session = await session_service.get_session(
    app_name='my_app',
    user_id='user123',
    session_id='session456'
)

# Delete session
await session_service.delete_session(
    app_name='my_app',
    user_id='user123',
    session_id='session456'
)
```

### VertexAiSessionService

For production (persistent, scalable):

```python
# Requires: pip install google-adk[vertexai]
from google.adk.sessions import VertexAiSessionService

session_service = VertexAiSessionService(
    project='your-gcp-project-id',
    location='us-central1'
)

# Use Reasoning Engine ID as app_name
REASONING_ENGINE_ID = 'projects/your-project/locations/us-central1/reasoningEngines/your-engine-id'

session = await session_service.create_session(
    app_name=REASONING_ENGINE_ID,
    user_id='user123'
)
```

## State Management

### Session State

Persistent across conversation turns:

```python
# Agent writes to state
agent1 = Agent(
    name='agent1',
    output_key='data'  # Saves to state['data']
)

# Agent reads from state
agent2 = Agent(
    name='agent2',
    instruction='Process {data}'  # Reads state['data']
)
```

### Temporary State

Scoped to current invocation only (use `temp:` prefix):

```python
# In a tool or callback
ctx.session.state['temp:intermediate_result'] = value

# Available to other tools in same invocation
# Automatically cleared after invocation completes
```

### State Delta

Changes are tracked as deltas in events:

```python
# When agent modifies state
ctx.session.state['key'] = 'new_value'

# Event contains:
event.actions.state_delta = {'key': 'new_value'}

# Runner commits these changes
```

## Session Lifecycle

1. **Create/Resume** - Get or create session
2. **Load Context** - Runner loads session state and history
3. **Agent Processes** - Agent has access to full context
4. **Update State** - Changes tracked in events
5. **Save** - Runner commits changes to SessionService
6. **Ready** - Session updated for next turn

## Complete Example

```python
import asyncio
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

APP_NAME = 'my_app'
USER_ID = 'user123'

async def main():
    # 1. Create SessionService
    session_service = InMemorySessionService()
    
    # 2. Create or get session
    session = await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        state={'conversation_count': 0}
    )
    
    # 3. Create agent
    agent = Agent(
        model='gemini-2.5-flash-lite',
        name='counter_agent',
        instruction="""Count conversations.
        
        Increment {conversation_count} by 1 each time.
        Tell the user their conversation count.""",
        output_key='response'
    )
    
    # 4. Create runner
    runner = Runner(
        agent=agent,
        app_name=APP_NAME,
        session_service=session_service
    )
    
    # 5. First message
    message1 = types.Content(
        role='user',
        parts=[types.Part(text='Hello!')]
    )
    
    async for event in runner.run_async(
        user_id=USER_ID,
        session_id=session.id,
        new_message=message1
    ):
        if event.is_final_response():
            print(f"Response: {event.content.parts[0].text}")
    
    # 6. Check state after first turn
    updated_session = await session_service.get_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=session.id
    )
    print(f"Count after turn 1: {updated_session.state.get('conversation_count')}")
    
    # 7. Second message (state persists)
    message2 = types.Content(
        role='user',
        parts=[types.Part(text='Hello again!')]
    )
    
    async for event in runner.run_async(
        user_id=USER_ID,
        session_id=session.id,
        new_message=message2
    ):
        if event.is_final_response():
            print(f"Response: {event.content.parts[0].text}")
    
    # 8. Check state after second turn
    updated_session = await session_service.get_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=session.id
    )
    print(f"Count after turn 2: {updated_session.state.get('conversation_count')}")

asyncio.run(main())
```

## Best Practices

1. **State Keys**: Use descriptive, consistent naming
2. **Cleanup**: Remove temporary data when no longer needed
3. **Temp Data**: Use `temp:` prefix for invocation-scoped data
4. **Session IDs**: Let system generate unless you have specific needs
5. **Production**: Use VertexAiSessionService for persistence
6. **Testing**: Use InMemorySessionService for fast iteration
