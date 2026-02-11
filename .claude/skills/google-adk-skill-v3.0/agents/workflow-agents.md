## Overview

Workflow Agents are specialized components designed for orchestrating the execution flow of sub-agents. They operate based on predefined logic, providing deterministic and predictable execution patterns.

## Types of Workflow Agents

### 1. Sequential Agent

Executes sub-agents one after another in order.

```python
from google.adk.agents import SequentialAgent, Agent

step1 = Agent(
    name='validate',
    model='gemini-2.0-flash',
    instruction='Validate the input',
    output_key='validation_status'
)

step2 = Agent(
    name='process',
    model='gemini-2.0-flash',
    instruction='Process if {validation_status} is valid',
    output_key='result'
)

step3 = Agent(
    name='respond',
    model='gemini-2.0-flash',
    instruction='Generate response based on {result}'
)

pipeline = SequentialAgent(
    name='data_pipeline',
    sub_agents=[step1, step2, step3]
)
```

**Characteristics:**
- Executes in order: step1 → step2 → step3
- Shares same `InvocationContext` (same state)
- Each agent can access state from previous agents
- Stops if any agent fails (unless error handling is implemented)

### 2. Parallel Agent

Executes multiple sub-agents concurrently.

```python
from google.adk.agents import ParallelAgent, Agent

fetch_api1 = Agent(
    name='api1_fetcher',
    instruction='Fetch data from API 1',
    output_key='api1_data'
)

fetch_api2 = Agent(
    name='api2_fetcher',
    instruction='Fetch data from API 2',
    output_key='api2_data'
)

parallel_fetch = ParallelAgent(
    name='concurrent_fetch',
    sub_agents=[fetch_api1, fetch_api2]
)
```

**Characteristics:**
- All sub-agents run concurrently
- Events from sub-agents may be interleaved
- All share same `session.state` (use distinct keys!)
- Branch context modified for each child (`ParentBranch.ChildName`)
- Useful for independent operations that can run simultaneously

**Common Pattern - Fan-Out/Gather:**
```python
from google.adk.agents import SequentialAgent, ParallelAgent, Agent

# Fetch in parallel
parallel_fetch = ParallelAgent(
    sub_agents=[fetch_api1, fetch_api2]
)

# Then synthesize results
synthesizer = Agent(
    name='synthesizer',
    instruction='Combine results from {api1_data} and {api2_data}'
)

# Combine into workflow
workflow = SequentialAgent(
    name='fetch_and_synthesize',
    sub_agents=[parallel_fetch, synthesizer]
)
```

### 3. Loop Agent

Repeatedly executes sub-agents until a termination condition.

```python
from google.adk.agents import LoopAgent, Agent, BaseAgent
from google.adk.events import Event, EventActions

# Agent that does work
refiner = Agent(
    name='code_refiner',
    instruction='Improve the code in {current_code}',
    output_key='current_code'
)

# Agent that checks quality
checker = Agent(
    name='quality_checker',
    instruction='Check code quality, output "pass" or "fail"',
    output_key='quality_status'
)

# Custom agent to stop the loop
class StopChecker(BaseAgent):
    async def _run_async_impl(self, ctx):
        status = ctx.session.state.get('quality_status', 'fail')
        should_stop = (status == 'pass')
        yield Event(
            author=self.name,
            actions=EventActions(escalate=should_stop)
        )

loop = LoopAgent(
    name='refinement_loop',
    max_iterations=5,
    sub_agents=[refiner, checker, StopChecker(name='stopper')]
)
```

**Characteristics:**
- Executes sub-agents sequentially in a loop
- Terminates when:
  - `max_iterations` is reached, OR
  - Any sub-agent returns Event with `escalate=True`
- Same `InvocationContext` across iterations
- State persists and accumulates across iterations

## Why Use Workflow Agents?

**Advantages:**
- **Predictability**: Guaranteed execution order
- **Reliability**: Consistent behavior
- **Structure**: Clear process definition
- **Composability**: Can nest and combine
- **Debuggability**: Easy to trace execution flow

**vs LLM-Driven Routing:**
- Workflow agents: Predetermined flow
- LLM agents: Dynamic decision-making
- Often combined: Workflow orchestrates LLM agents

## Common Patterns

### Pattern: Validation → Processing → Response
```python
pipeline = SequentialAgent(
    sub_agents=[validator, processor, responder]
)
```

### Pattern: Parallel Data Gathering → Synthesis
```python
workflow = SequentialAgent(
    sub_agents=[
        ParallelAgent(sub_agents=[source1, source2, source3]),
        synthesizer
    ]
)
```

### Pattern: Iterative Improvement
```python
loop = LoopAgent(
    max_iterations=10,
    sub_agents=[improver, evaluator, stop_checker]
)
```

### Pattern: Try Multiple Approaches
```python
# Try different strategies in parallel, use first success
parallel_attempt = ParallelAgent(
    sub_agents=[strategy1, strategy2, strategy3]
)
```

## Best Practices

1. **State Keys**: Use distinct output_keys for each agent in Parallel
2. **Error Handling**: Implement proper error returns in agents
3. **Termination**: Always set `max_iterations` on LoopAgent
4. **Performance**: Use Parallel for independent I/O operations
5. **Debugging**: Name agents descriptively for easier debugging
