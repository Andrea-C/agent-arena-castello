## Overview

The Runner is the main entry point for executing agents. It orchestrates the event loop, manages services, and handles agent execution.

## Basic Usage

```python
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.agents import Agent
from google.genai import types
import asyncio

# 1. Create agent
agent = Agent(
    model='gemini-2.0-flash',
    name='my_agent',
    instruction='You are a helpful assistant'
)

# 2. Create session service
session_service = InMemorySessionService()

# 3. Create runner
runner = Runner(
    agent=agent,
    app_name='my_app',
    session_service=session_service
)

# 4. Run agent
async def run():
    # Create session
    session = await session_service.create_session(
        app_name='my_app',
        user_id='user123'
    )
    
    # Send message
    message = types.Content(
        role='user',
        parts=[types.Part(text='Hello!')]
    )
    
    # Process and stream events
    async for event in runner.run_async(
        user_id='user123',
        session_id=session.id,
        new_message=message
    ):
        if event.is_final_response():
            print(event.content.parts[0].text)

asyncio.run(run())
```

## Runner Configuration

```python
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.artifacts import InMemoryArtifactService

runner = Runner(
    agent=root_agent,
    app_name='my_app',
    session_service=session_service,
    artifact_service=InMemoryArtifactService(),  # Optional
    # memory_service=...  # Optional
)
```

## Event Processing

The Runner yields events as the agent executes:

```python
async for event in runner.run_async(user_id, session_id, new_message):
    print(f"Event from: {event.author}")
    print(f"Is final: {event.is_final_response()}")
    
    if event.content:
        for part in event.content.parts:
            if part.text:
                print(f"Text: {part.text}")
            elif part.function_call:
                print(f"Tool call: {part.function_call.name}")
            elif part.function_response:
                print(f"Tool result: {part.function_response}")
```

## Event Types

- **User Message** - Initial query from user
- **Agent Response** - Text response from agent
- **Function Call** - Agent requests tool execution
- **Function Response** - Tool execution result
- **State Change** - State modifications
- **Control Events** - Transfer, escalate, etc.

## The Event Loop

```
1. User sends message
2. Runner appends to session
3. Runner calls agent.run_async()
4. Agent yields events
5. Runner processes each event:
   - Commits state changes
   - Saves artifacts
   - Forwards event upstream
6. Agent resumes after event processed
7. Repeat 4-6 until agent complete
```

## Streaming vs Non-Streaming

**Streaming** (partial events):
```python
async for event in runner.run_async(...):
    if event.partial:
        # Partial response for UI streaming
        print(event.content.parts[0].text, end='', flush=True)
    else:
        # Final/complete event
        process_complete_event(event)
```

**Non-Streaming** (complete events only):
```python
async for event in runner.run_async(...):
    # Only receive complete events
    if event.is_final_response():
        print(event.content.parts[0].text)
```

## RunConfig

Configure run behavior:

```python
from google.adk.agents import RunConfig

async for event in runner.run_async(
    user_id=user_id,
    session_id=session_id,
    new_message=message,
    run_config=RunConfig(
        streaming_mode='sse',  # or 'none'
        # Other configs...
    )
):
    pass
```

## Error Handling

```python
try:
    async for event in runner.run_async(...):
        if event.error:
            print(f"Error occurred: {event.error}")
        else:
            # Process normal event
            pass
except Exception as e:
    print(f"Runner error: {e}")
```

## Complete Example with State

```python
import asyncio
from google.adk.agents import Agent, SequentialAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

APP_NAME = 'stateful_app'
USER_ID = 'user123'

async def main():
    # Create agents
    agent1 = Agent(
        model='gemini-2.0-flash',
        name='agent1',
        instruction='Generate a random number and save it',
        output_key='random_number'
    )
    
    agent2 = Agent(
        model='gemini-2.0-flash',
        name='agent2',
        instruction='The random number is {random_number}. Double it.',
        output_key='doubled'
    )
    
    pipeline = SequentialAgent(
        name='pipeline',
        sub_agents=[agent1, agent2]
    )
    
    # Setup
    session_service = InMemorySessionService()
    session = await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID
    )
    
    runner = Runner(
        agent=pipeline,
        app_name=APP_NAME,
        session_service=session_service
    )
    
    # Run
    message = types.Content(
        role='user',
        parts=[types.Part(text='Process a number')]
    )
    
    async for event in runner.run_async(
        user_id=USER_ID,
        session_id=session.id,
        new_message=message
    ):
        print(f"[{event.author}] {event.content.parts[0].text if event.content else ''}")
    
    # Check final state
    final_session = await session_service.get_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=session.id
    )
    print(f"\nFinal state: {final_session.state}")

asyncio.run(main())
```

## Best Practices

1. **Async First**: Use `run_async` for best performance
2. **Event Handling**: Process all events, not just final
3. **Error Handling**: Wrap in try-except
4. **State Management**: Let Runner handle state commits
5. **Session Management**: Create session before first run
6. **Testing**: Use InMemorySessionService for tests
