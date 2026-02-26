# ADK Overview and Key Features

## What is Google ADK?

The Agent Development Kit (ADK) is a flexible and modular framework for developing and deploying AI agents. While optimized for Gemini and the Google ecosystem, ADK is model-agnostic and deployment-agnostic, built for compatibility with other frameworks.

## Design Philosophy

ADK was designed to make agent development feel more like software development, making it easier for developers to create, deploy, and orchestrate agentic architectures that range from simple tasks to complex workflows.

## Core Architecture

### Key Components

1. **Agents** - The thinking units that process information and make decisions
2. **Tools** - Capabilities that agents can use to interact with the world
3. **Sessions** - Containers for conversation state and history
4. **Services** - Backend systems for persistence and resource management
5. **Runtime** - The execution engine that orchestrates everything

### Agent Types

**LLM Agents (`LlmAgent`)**
- Powered by large language models for dynamic reasoning
- Non-deterministic behavior based on LLM interpretation
- Can use tools and transfer to other agents
- Core of most agentic applications

**Workflow Agents**
- `SequentialAgent` - Executes sub-agents in order
- `ParallelAgent` - Runs multiple agents concurrently
- `LoopAgent` - Iterative execution with termination conditions
- Deterministic, predictable execution flow

**Custom Agents (`BaseAgent`)**
- Implement your own agent logic
- Full control over behavior
- Can be combined with other agent types

## Key Features

### 1. Flexible Orchestration

Define workflows using:
- **Workflow agents** for predictable pipelines (Sequential, Parallel, Loop)
- **LLM-driven routing** for adaptive behavior (transfer_to_agent)
- **Mixed approaches** combining both patterns

```python
# Sequential workflow
pipeline = SequentialAgent(
    name='pipeline',
    sub_agents=[validate, process, respond]
)

# LLM-driven coordination
coordinator = Agent(
    name='coordinator',
    sub_agents=[billing_agent, support_agent],
    instruction='Route requests to appropriate agent'
)
```

### 2. Multi-Agent Architecture

Build modular applications by composing multiple specialized agents:
- **Hierarchy** - Parent-child relationships define structure
- **Delegation** - LLM agents can transfer control to others
- **Composition** - Agents can use other agents as tools
- **Coordination** - Workflow agents orchestrate execution

Benefits:
- Enhanced modularity
- Clear specialization
- Improved reusability
- Better maintainability

### 3. Rich Tool Ecosystem

**Built-in Tools:**
- Google Search - Web search with Gemini
- Code Execution - Run code using Gemini
- BigQuery - Database queries and analysis
- Vertex AI RAG - Private data retrieval
- And more...

**Third-party Tools:**
- Browserbase - Web browsing for agents
- Exa - Search and extract structured content
- Firecrawl - Clean data from websites
- GitHub - Code analysis and automation
- Tavily - Real-time web search
- And more...

**Custom Tools:**
- Function tools - Python functions as tools
- MCP tools - Model Context Protocol integration
- OpenAPI tools - Generate from OpenAPI specs
- Agent tools - Other agents as tools

### 4. Session Management

**Session Components:**
- `id` - Unique conversation identifier
- `events` - Chronological history of interactions
- `state` - Temporary data for the conversation
- `lastUpdateTime` - Activity tracking

**SessionService Implementations:**
- `InMemorySessionService` - Fast, non-persistent (development)
- `VertexAiSessionService` - Managed, scalable (production)
- `DatabaseSessionService` - Custom database backend

### 5. State and Context Management

**Session State:**
- Shared dictionary across agent interactions
- Persistent across conversation turns
- Key-value storage for data passing

**Temporary State:**
- Use `temp:` prefix for invocation-scoped data
- Automatically cleared after invocation
- Ideal for intermediate results

**Context Management:**
- `InvocationContext` - Current execution context
- Access to session, state, artifacts
- Shared across tools and callbacks

### 6. Event-Driven Runtime

**Event Loop:**
- Agent yields events to Runner
- Runner processes and commits changes
- Agent resumes after processing
- Cooperative execution model

**Event Types:**
- User messages
- Agent responses  
- Tool calls and results
- State changes
- Control signals

### 7. Deployment Ready

**Local Development:**
```bash
adk run      # CLI interface
adk web      # Web UI at localhost:8000
```

**Production Options:**
- **Vertex AI Agent Engine** - Managed Google Cloud service
- **Cloud Run** - Serverless containers
- **GKE** - Kubernetes clusters
- **Custom** - Your own infrastructure

### 8. Built-in Evaluation

Systematically assess agent performance:
- Evaluate final response quality
- Analyze step-by-step execution trajectory
- Test against predefined cases
- Measure and improve over time

### 9. Observability and Safety

**Observability:**
- Logging at multiple levels
- Cloud Trace integration
- Third-party monitoring (AgentOps, Phoenix, Weave)
- Event tracking and debugging

**Safety:**
- Content filtering
- Safety settings on LLM calls
- Input/output validation
- Secure credential management

## Architecture Patterns

### Pattern: Hierarchical Structure

```python
# Sub-agents
specialist1 = Agent(name='specialist1', ...)
specialist2 = Agent(name='specialist2', ...)

# Parent coordinator
coordinator = Agent(
    name='coordinator',
    sub_agents=[specialist1, specialist2],
    ...
)
```

### Pattern: Sequential Pipeline

```python
step1 = Agent(name='step1', output_key='data1')
step2 = Agent(name='step2', output_key='data2')
step3 = Agent(name='step3')

pipeline = SequentialAgent(
    name='pipeline',
    sub_agents=[step1, step2, step3]
)
```

### Pattern: Parallel Processing

```python
fetch1 = Agent(name='fetch1', output_key='source1')
fetch2 = Agent(name='fetch2', output_key='source2')

parallel = ParallelAgent(
    name='fetchers',
    sub_agents=[fetch1, fetch2]
)

# Often followed by synthesis
workflow = SequentialAgent(
    sub_agents=[parallel, synthesizer]
)
```

### Pattern: Iterative Refinement

```python
refiner = Agent(name='refiner', output_key='output')
checker = Agent(name='checker', output_key='status')
stopper = CustomStopAgent()

loop = LoopAgent(
    name='refine_loop',
    max_iterations=5,
    sub_agents=[refiner, checker, stopper]
)
```

## Communication Mechanisms

### 1. Shared State
Agents communicate by reading and writing to `session.state`:
```python
# Agent A writes
agent_a = Agent(output_key='result')

# Agent B reads
agent_b = Agent(instruction='Process {result}')
```

### 2. LLM-Driven Delegation
LLM decides to transfer control:
```python
coordinator = Agent(
    sub_agents=[specialist1, specialist2],
    instruction='Delegate to appropriate specialist'
)
# LLM calls: transfer_to_agent(agent_name='specialist1')
```

### 3. Agent as Tool
Explicitly invoke another agent:
```python
from google.adk.tools import agent_tool

specialist = Agent(name='specialist', ...)
tool = agent_tool.AgentTool(agent=specialist)

main_agent = Agent(tools=[tool], ...)
```

## Model Support

### Gemini Models (Optimized)
- `gemini-2.5-flash-lite` - Fast, good quality
- `gemini-2.5-flash` - Faster, better quality
- `gemini-2.5-pro` - Best quality, slower

### Other Models
ADK is model-agnostic. Configure other models through appropriate setup.

## Development Workflow

1. **Design** - Define agent hierarchy and responsibilities
2. **Implement** - Create agents with tools and instructions
3. **Test** - Use local CLI or web interface
4. **Evaluate** - Run test cases and measure performance
5. **Deploy** - Move to production environment
6. **Monitor** - Track performance and errors
7. **Iterate** - Improve based on real-world usage

## Best Practices

### Agent Design
- Single responsibility per agent
- Clear, specific instructions
- Appropriate model selection
- Proper tool descriptions

### State Management
- Use descriptive key names
- Clean up temporary data
- Document dependencies
- Use `temp:` for ephemeral data

### Error Handling
- Tools return informative errors
- Implement try-except blocks
- Provide fallback behavior
- Log errors appropriately

### Performance
- Choose appropriate models
- Implement caching where useful
- Use parallel execution when possible
- Monitor token usage

## When to Use ADK

**Good Fit:**
- Building conversational AI applications
- Complex multi-step workflows
- Multi-agent coordination needed
- Integration with Google Cloud
- Need for flexible orchestration

**Consider Alternatives:**
- Simple single-purpose scripts
- Pure function calling without state
- Non-conversational batch processing

## Getting Started

```python
from google.adk.agents import Agent

# Simple agent
agent = Agent(
    model='gemini-2.5-flash-lite',
    name='my_agent',
    instruction='You are a helpful assistant.'
)

# Agent with tools
def my_tool(param: str) -> dict:
    return {"result": f"Processed: {param}"}

agent = Agent(
    model='gemini-2.5-flash-lite',
    name='tool_agent',
    tools=[my_tool],
    instruction='Use my_tool when needed.'
)
```

## Next Steps

- **agents/llm-agents.md** - Deep dive into LLM agents
- **agents/workflow-agents.md** - Workflow orchestration
- **agents/multi-agents.md** - Multi-agent systems
- **tools/overview.md** - Available tools
- **concepts/sessions.md** - Session management

## Additional Resources

- Official Docs: https://google.github.io/adk-docs/
- GitHub: https://github.com/google/adk-python
- API Reference: reference/api-quick-ref.md
- Updates & Issues: reference/updates-and-issues.md
