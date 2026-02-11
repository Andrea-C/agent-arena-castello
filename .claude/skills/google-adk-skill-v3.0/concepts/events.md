# Event System

## Overview

Events are the fundamental units of communication in ADK's runtime. They represent actions, messages, and state changes as agents execute.

## Event Structure

```python
from google.adk.events import Event, EventActions

event = Event(
    author='agent_name',        # Who created this event
    content=Content(...),        # Message content
    actions=EventActions(...),   # Side effects
    partial=False,               # Streaming flag
    invocation_id='id'          # Invocation identifier
)
```

## Event Types

### User Message Events
```python
event = Event(
    author='user',
    content=Content(
        role='user',
        parts=[Part(text='Hello!')]
    )
)
```

### Agent Response Events
```python
event = Event(
    author='agent_name',
    content=Content(
        role='model',
        parts=[Part(text='Response text')]
    )
)
```

### Tool Call Events
```python
event = Event(
    author='agent_name',
    content=Content(
        parts=[Part(function_call=FunctionCall(
            name='tool_name',
            args={'param': 'value'}
        ))]
    )
)
```

### Tool Response Events
```python
event = Event(
    author='agent_name',
    content=Content(
        role='user',
        parts=[Part(function_response=FunctionResponse(
            name='tool_name',
            response={'result': 'value'}
        ))]
    )
)
```

## Event Actions

EventActions define side effects:

```python
from google.adk.events import EventActions

actions = EventActions(
    state_delta={'key': 'value'},     # State changes
    artifact_delta={'name': 'data'},  # Artifact changes
    escalate=False,                   # Control flow flag
)
```

### State Delta

Changes to session state:

```python
event = Event(
    author='agent',
    actions=EventActions(
        state_delta={'result': 'computed_value'}
    )
)
```

### Escalation

Signal to stop current execution:

```python
event = Event(
    author='checker',
    actions=EventActions(
        escalate=True  # Stop loop/workflow
    )
)
```

## Event Flow

```
1. User sends message (Event)
2. Runner appends to session
3. Agent processes and yields Events
4. Runner receives Event
5. Runner processes Event actions
6. Runner forwards Event upstream
7. Agent resumes after processing
8. Repeat 3-7 until complete
```

## Streaming Events

Partial events for real-time streaming:

```python
# Partial event (streaming)
partial_event = Event(
    author='agent',
    content=Content(...),
    partial=True  # Indicates streaming
)

# Final event
final_event = Event(
    author='agent',
    content=Content(...),
    partial=False,  # Complete
    turn_complete=True
)
```

## Processing Events

```python
async for event in runner.run_async(...):
    print(f"From: {event.author}")
    
    if event.partial:
        # Streaming partial response
        print(event.content.parts[0].text, end='', flush=True)
    else:
        # Complete event
        if event.is_final_response():
            print(f"\nFinal: {event.content.parts[0].text}")
```

## Event Lifecycle

1. **Creation**: Agent or framework creates Event
2. **Yield**: Agent yields Event to Runner
3. **Processing**: Runner processes actions (state, artifacts)
4. **Forwarding**: Runner forwards Event upstream
5. **Resumption**: Agent continues after processing

## Best Practices

1. **Clear Authors**: Set meaningful author names
2. **Complete Content**: Include all necessary information
3. **Appropriate Actions**: Use state_delta for state changes
4. **Streaming**: Use partial flag for streaming responses
5. **Error Handling**: Include error information in events

## Next Steps

- **Runtime**: Understand the event loop (`runtime/runner.md`)
- **Sessions**: How events relate to sessions (`concepts/sessions.md`)
- **Context**: Event context management (`concepts/context.md`)
