# Context and Memory Management

## Invocation Context

The `InvocationContext` provides agents with access to the current execution environment.

### What's in Context

```python
ctx.session          # Current Session object
ctx.session.state    # State dictionary
ctx.session.events   # Event history
ctx.invocation_id    # Unique ID for this invocation
ctx.branch           # Current branch in execution tree
```

### Accessing Context

Context is automatically provided to agents, tools, and callbacks:

```python
# In a tool
def my_tool(param: str) -> dict:
    # ADK injects context
    return {"result": "value"}

# In a callback
def before_model_callback(ctx):
    print(f"Session state: {ctx.session.state}")
    print(f"Invocation ID: {ctx.invocation_id}")
```

## Caching

ADK supports caching to improve performance and reduce costs.

### Context Caching

Gemini supports caching of context for repeated use:

```python
from google.genai import types

agent = Agent(
    model='gemini-2.0-flash',
    generate_content_config=types.GenerateContentConfig(
        cached_content=cached_content_object
    )
)
```

Benefits:
- Reduced token usage
- Faster responses
- Lower costs for repeated contexts

## Memory Management

### Short-term Memory (Session State)

Persists across turns within a conversation:

```python
# Store in state
agent = Agent(output_key='data')

# Access in next turn
agent2 = Agent(instruction='Use {data}')
```

### Temporary Memory (Invocation State)

Use `temp:` prefix for data that should only exist during one invocation:

```python
ctx.session.state['temp:intermediate_result'] = value
# Automatically cleared after invocation
```

### Long-term Memory

For memory across sessions, use `MemoryService`:

```python
# Configure memory service
from google.adk.memory import MemoryService

memory_service = MemoryService(...)
runner = Runner(
    agent=agent,
    memory_service=memory_service,
    ...
)
```

## Best Practices

1. **State Keys**: Use clear, descriptive names
2. **Temporary Data**: Use `temp:` for invocation-scoped data
3. **Cleanup**: Remove data when no longer needed
4. **Context Size**: Monitor context window usage
5. **Caching**: Use caching for repeated contexts

## Next Steps

- **Sessions**: Understand session management (`concepts/sessions.md`)
- **Events**: Learn about the event system (`concepts/events.md`)
- **State Management**: Best practices in implementation guide
