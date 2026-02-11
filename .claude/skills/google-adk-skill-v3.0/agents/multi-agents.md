## Overview

Multi-agent systems in ADK allow you to compose multiple agents into hierarchical, collaborative architectures for complex applications.

## Core Concepts

### 1. Agent Hierarchy

Agents form parent-child trees:

```python
# Children
specialist1 = Agent(name='specialist1', ...)
specialist2 = Agent(name='specialist2', ...)

# Parent
coordinator = Agent(
    name='coordinator',
    sub_agents=[specialist1, specialist2]
)
```

**Rules:**
- An agent can only have ONE parent
- Parents can have multiple children
- Navigate with `agent.parent_agent` and `agent.find_agent(name)`

### 2. Communication Mechanisms

**a) Shared State**
```python
# Agent A writes
agent_a = Agent(output_key='data')

# Agent B reads
agent_b = Agent(instruction='Use {data} from previous step')
```

**b) LLM-Driven Delegation**
```python
coordinator = Agent(
    name='coordinator',
    instruction='Route to appropriate specialist',
    sub_agents=[billing_agent, support_agent]
)
# LLM calls: transfer_to_agent(agent_name='billing_agent')
```

**c) Agent as Tool (AgentTool)**
```python
from google.adk.tools import agent_tool

specialist = Agent(name='specialist', ...)
tool = agent_tool.AgentTool(agent=specialist)

main_agent = Agent(tools=[tool], ...)
```

## Common Multi-Agent Patterns

### Pattern 1: Coordinator/Dispatcher

Central agent routes requests to specialists:

```python
billing_agent = Agent(
    name='billing',
    description='Handles billing and payment inquiries'
)

support_agent = Agent(
    name='support',
    description='Handles technical support requests'
)

coordinator = Agent(
    name='help_desk',
    model='gemini-2.0-flash',
    instruction='Route user requests: billing issues to billing agent, tech issues to support agent',
    sub_agents=[billing_agent, support_agent]
)
```

### Pattern 2: Sequential Pipeline

Multi-step process with state passing:

```python
validator = Agent(
    name='validator',
    output_key='validation_status'
)

processor = Agent(
    name='processor',
    instruction='Process if {validation_status} is valid',
    output_key='result'
)

reporter = Agent(
    name='reporter',
    instruction='Report {result}'
)

pipeline = SequentialAgent(
    name='data_pipeline',
    sub_agents=[validator, processor, reporter]
)
```

### Pattern 3: Parallel Fan-Out/Gather

Concurrent execution + synthesis:

```python
fetch1 = Agent(name='fetch1', output_key='source1')
fetch2 = Agent(name='fetch2', output_key='source2')

gatherer = ParallelAgent(
    name='concurrent_fetch',
    sub_agents=[fetch1, fetch2]
)

synthesizer = Agent(
    name='synthesizer',
    instruction='Combine {source1} and {source2}'
)

workflow = SequentialAgent(
    sub_agents=[gatherer, synthesizer]
)
```

### Pattern 4: Hierarchical Task Decomposition

Multi-level agent tree:

```python
# Low-level specialists
web_searcher = Agent(name='searcher', ...)
summarizer = Agent(name='summarizer', ...)

# Mid-level coordinator
researcher = Agent(
    name='researcher',
    tools=[
        agent_tool.AgentTool(web_searcher),
        agent_tool.AgentTool(summarizer)
    ]
)

# High-level orchestrator
report_writer = Agent(
    name='writer',
    tools=[agent_tool.AgentTool(researcher)]
)
```

### Pattern 5: Generator-Critic

One agent generates, another reviews:

```python
generator = Agent(
    name='draft_writer',
    instruction='Write a draft',
    output_key='draft'
)

critic = Agent(
    name='reviewer',
    instruction='Review {draft}, output "approved" or "needs_revision"',
    output_key='review_status'
)

workflow = SequentialAgent(
    sub_agents=[generator, critic]
)
```

### Pattern 6: Iterative Refinement

Loop for progressive improvement:

```python
refiner = Agent(name='refiner', output_key='output')
checker = Agent(name='checker', output_key='status')

class StopWhenGood(BaseAgent):
    async def _run_async_impl(self, ctx):
        done = ctx.session.state.get('status') == 'good'
        yield Event(actions=EventActions(escalate=done))

loop = LoopAgent(
    max_iterations=5,
    sub_agents=[refiner, checker, StopWhenGood(name='stopper')]
)
```

### Pattern 7: Human-in-the-Loop

Pause for human input:

```python
def request_human_approval(details: str) -> str:
    """Request human approval (implement your UI/API logic)."""
    # Send to human approval system
    # Poll/wait for response
    return "approved"  # or "rejected"

prepare = Agent(name='prepare', ...)
request = Agent(
    name='request_approval',
    tools=[request_human_approval],
    output_key='human_decision'
)
proceed = Agent(
    name='proceed',
    instruction='Act based on {human_decision}'
)

workflow = SequentialAgent(
    sub_agents=[prepare, request, proceed]
)
```

## Advanced Configuration

### Global Instructions

Apply instructions to all agents in hierarchy:

```python
root = Agent(
    name='root',
    global_instruction='Always be polite and professional',
    sub_agents=[agent1, agent2]
)
```

### Transfer Control

```python
agent = Agent(
    disallow_transfer_to_parent=True,  # Can't transfer back to parent
    disallow_transfer_to_peers=True,   # Can't transfer to siblings
)
```

## Best Practices

1. **Clear Descriptions**: Each agent needs a clear `description` for routing
2. **State Management**: Use distinct keys, clean up temporary data
3. **Error Handling**: Each agent should handle and report errors
4. **Testing**: Test individual agents before combining
5. **Monitoring**: Log agent interactions for debugging
6. **Performance**: Use Parallel for independent operations

## Choosing the Right Pattern

| Use Case | Pattern |
|----------|---------|
| Route to specialists | Coordinator/Dispatcher |
| Multi-step process | Sequential Pipeline |
| Gather from multiple sources | Parallel Fan-Out/Gather |
| Break down complex task | Hierarchical Decomposition |
| Quality assurance | Generator-Critic |
| Improve over iterations | Iterative Refinement |
| Need approval/input | Human-in-the-Loop |
