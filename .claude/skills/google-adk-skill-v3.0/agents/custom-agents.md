# Custom Agents

## Overview

Custom agents allow you to implement specialized logic beyond what LLM agents and workflow agents provide. Create custom agents by inheriting from `BaseAgent`.

## Creating a Custom Agent

```python
from google.adk.agents import BaseAgent
from google.adk.events import Event, EventActions
from google.adk.agents.invocation_context import InvocationContext
from typing import AsyncGenerator

class MyCustomAgent(BaseAgent):
    async def _run_async_impl(
        self,
        ctx: InvocationContext
    ) -> AsyncGenerator[Event, None]:
        """
        Core execution logic.
        
        Args:
            ctx: Invocation context with session, state, etc.
        
        Yields:
            Events representing actions and responses
        """
        # Your custom logic here
        
        # Access session state
        current_state = ctx.session.state.get('some_key')
        
        # Perform operations
        result = self.do_something(current_state)
        
        # Yield events
        yield Event(
            author=self.name,
            content=types.Content(
                parts=[types.Part(text=f"Result: {result}")]
            ),
            actions=EventActions(
                state_delta={'result': result}
            )
        )
    
    def do_something(self, input_data):
        """Custom logic method."""
        # Your implementation
        return "processed_data"
```

## Use Cases for Custom Agents

### 1. Deterministic Logic

```python
class CalculatorAgent(BaseAgent):
    async def _run_async_impl(self, ctx):
        # Get inputs from state
        a = ctx.session.state.get('num_a', 0)
        b = ctx.session.state.get('num_b', 0)
        op = ctx.session.state.get('operation', 'add')
        
        # Perform calculation
        if op == 'add':
            result = a + b
        elif op == 'multiply':
            result = a * b
        else:
            result = 0
        
        # Yield result
        yield Event(
            author=self.name,
            content=types.Content(
                parts=[types.Part(text=f"{a} {op} {b} = {result}")]
            ),
            actions=EventActions(
                state_delta={'calc_result': result}
            )
        )
```

### 2. Conditional Routing

```python
class RouterAgent(BaseAgent):
    def __init__(self, name, route_map):
        super().__init__(name=name)
        self.route_map = route_map
    
    async def _run_async_impl(self, ctx):
        # Get routing key from state
        key = ctx.session.state.get('route_key')
        
        # Determine next agent
        next_agent = self.route_map.get(key, 'default')
        
        # Yield routing instruction
        yield Event(
            author=self.name,
            content=types.Content(
                parts=[types.Part(text=f"Routing to: {next_agent}")]
            ),
            actions=EventActions(
                state_delta={'next_agent': next_agent}
            )
        )
```

### 3. Data Transformation

```python
class DataTransformerAgent(BaseAgent):
    async def _run_async_impl(self, ctx):
        # Get raw data
        raw_data = ctx.session.state.get('raw_data', [])
        
        # Transform
        transformed = [
            self.transform_item(item)
            for item in raw_data
        ]
        
        # Yield transformed data
        yield Event(
            author=self.name,
            actions=EventActions(
                state_delta={'transformed_data': transformed}
            )
        )
    
    def transform_item(self, item):
        # Your transformation logic
        return item.upper()
```

### 4. Termination Checker

```python
class TerminationChecker(BaseAgent):
    def __init__(self, name, condition_key, target_value):
        super().__init__(name=name)
        self.condition_key = condition_key
        self.target_value = target_value
    
    async def _run_async_impl(self, ctx):
        # Check condition
        current_value = ctx.session.state.get(self.condition_key)
        should_stop = (current_value == self.target_value)
        
        # Yield escalation if condition met
        yield Event(
            author=self.name,
            actions=EventActions(
                escalate=should_stop
            )
        )
```

## Best Practices

1. **Clear Purpose**: Each custom agent should have one clear purpose
2. **State Management**: Use state for inputs and outputs
3. **Error Handling**: Handle errors gracefully
4. **Event Yielding**: Yield appropriate events
5. **Documentation**: Document what the agent does
6. **Testing**: Test custom agents independently

## Combining with Other Agents

```python
# Use in sequential workflow
custom_agent = MyCustomAgent(name='custom')
llm_agent = Agent(name='llm', model='gemini-2.5-flash-lite')

workflow = SequentialAgent(
    name='workflow',
    sub_agents=[custom_agent, llm_agent]
)
```

## Complete Example

```python
from google.adk.agents import BaseAgent, SequentialAgent, Agent
from google.adk.events import Event, EventActions
from google.genai import types

class PriorityRouter(BaseAgent):
    """Routes based on priority score."""
    
    def __init__(self, name, high_threshold=8):
        super().__init__(name=name)
        self.high_threshold = high_threshold
    
    async def _run_async_impl(self, ctx):
        # Get priority from state
        priority = ctx.session.state.get('priority_score', 0)
        
        # Determine route
        if priority >= self.high_threshold:
            route = 'high_priority_handler'
            message = "High priority detected - escalating"
        else:
            route = 'normal_handler'
            message = "Normal priority - standard handling"
        
        # Yield routing decision
        yield Event(
            author=self.name,
            content=types.Content(
                parts=[types.Part(text=message)]
            ),
            actions=EventActions(
                state_delta={'assigned_handler': route}
            )
        )

# Use in workflow
router = PriorityRouter(name='router', high_threshold=8)
high_handler = Agent(name='high_priority_handler', ...)
normal_handler = Agent(name='normal_handler', ...)

# Note: Actual conditional execution would require
# additional logic or using multiple workflows
```

## Next Steps

- **LLM Agents**: Standard agents (`agents/llm-agents.md`)
- **Workflow Agents**: Orchestration (`agents/workflow-agents.md`)
- **Multi-Agent Systems**: Complex architectures (`agents/multi-agents.md`)
