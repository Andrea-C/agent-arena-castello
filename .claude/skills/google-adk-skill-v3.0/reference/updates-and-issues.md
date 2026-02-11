# Version Information, Updates, and Known Issues

This file contains current version information, recent release highlights, known issues, and common gotchas for Google ADK.

## Repository Information

| Property | Value |
|----------|-------|
| **Repository** | [google/adk-python](https://github.com/google/adk-python) |
| **Current Version** | v1.23.0 (January 2026) |
| **Language** | Python (95.5%) |
| **Stars** | 17,478 |
| **License** | Apache License 2.0 |
| **Min Python** | 3.10+ (as of v1.19.0) |
| **Release Cadence** | Bi-weekly |

## Related Projects

- [ADK Samples](https://github.com/google/adk-samples) - Official sample agents
- [Java ADK](https://github.com/google/adk-java) - Java implementation
- [Go ADK](https://github.com/google/adk-go) - Go implementation
- [ADK Web](https://github.com/google/adk-web) - Web interface
- [ADK Community](https://github.com/google/adk-python-community) - Community tools and integrations

## Recent Updates

### v1.23.0 (January 2026)

**Breaking Changes:**
- OpenTelemetry for BigQuery plugin tracing replaces custom `ContextVar` implementation

**New Features:**
- **Custom Service Registration**: Generic service registry for FastAPI server
- **Session Rewind**: Ability to rewind a session to before a previous invocation
- **AgentEngineSandboxCodeExecutor**: Execute agent-generated code using Vertex AI Code Execution Sandbox API
- **Auto Session Creation**: Automatically create a session if one does not exist

### v1.22.0 (January 2026)

- Make `LlmAgent.model` optional with a default fallback
- Support regex for allowed origins
- Enable PROGRESSIVE_SSE_STREAMING by default

### v1.21.0 (December 2025)

- **Interactions API Support**: Gemini Interactions API integration
```python
from google.adk.agents import Agent
from google.adk.models import Gemini

agent = Agent(
    model=Gemini(
        model="gemini-3-pro-preview",
        use_interactions_api=True,
    ),
    name="interactions_agent",
    description="Agent using the Interactions API",
    instruction="You are a helpful assistant.",
)
```

### v1.20.0 (December 2025)

- Add enum constraint to `agent_name` for `transfer_to_agent`
- Add validation for unique sub-agent names

### v1.19.0 (November 2025)

**Breaking:** Raised minimum Python version to 3.10

- File-based Artifact Service
- Reduced ADK API server startup latency via lazy loading
- ADK web light mode support
- BigQuery Agent Analytics Plugin

### v1.18.0 (November 2025)

- **ADK Visual Agent Builder**: Visual workflow designer for agent creation
- Support for multiple agent types (LLM, Sequential, Parallel, Loop, Workflow)
- Agent tool support with nested agent tools
- Built-in and custom tool integration
- Callback management for all ADK callback types

### v1.16.0 (October 2025)

- **LLM Context Compaction**: Manage model context window
- **Pause and Resume**: Invocation pause/resume support

## Known Issues

Active issues from GitHub that may affect your development:

| Issue | Description | Labels |
|-------|-------------|--------|
| [#4282](https://github.com/google/adk-python/issues/4282) | EventsCompactionConfig fails with 'RuntimeError: Event loop is closed' during LLM summarization | services, agent engine |
| [#3725](https://github.com/google/adk-python/issues/3725) | BigQuery Toolset OAuth Token Key Mismatch with Gemini Enterprise | core, bq |
| [#4100](https://github.com/google/adk-python/issues/4100) | Impossible to resume agents through FastAPI endpoint without "new_message" | core |
| [#3819](https://github.com/google/adk-python/issues/3819) | All messages converted to thoughts in A2A | a2a |
| [#4179](https://github.com/google/adk-python/issues/4179) | FunctionCallingConfig(mode="ANY") causes infinite tool-calling loop with sub-agent as tool | tools |
| [#3470](https://github.com/google/adk-python/issues/3470) | Inconsistent Event Visibility in Parallel Agent Branching and LLM Context | core |
| [#2902](https://github.com/google/adk-python/issues/2902) | "adk deploy agent_engine" fails if agent folder name contains dashes | agent engine |
| [#3955](https://github.com/google/adk-python/issues/3955) | Streaming tools example in the documentation does not work | documentation, live |

## Common Gotchas

Important pitfalls to avoid when developing with ADK:

### 1. Agent Names Must Be Python Identifiers

Agent names must be valid Python identifiers. The name "user" is **reserved** and cannot be used.

```python
# Good
agent = Agent(name="my_agent", ...)
agent = Agent(name="customerSupport", ...)

# Bad - will fail
agent = Agent(name="user", ...)  # Reserved name
agent = Agent(name="my-agent", ...)  # Hyphens not allowed
agent = Agent(name="123agent", ...)  # Can't start with number
```

### 2. Sub-Agents Can Only Be Added Once

An agent can only be added as a sub-agent to ONE parent. If you need the same agent logic in multiple places, create separate instances.

```python
# Wrong - will cause issues
shared_agent = Agent(name="shared", ...)
parent1 = Agent(sub_agents=[shared_agent])
parent2 = Agent(sub_agents=[shared_agent])  # Error!

# Correct - create separate instances
agent1 = Agent(name="agent1", instruction="...", ...)
agent2 = Agent(name="agent2", instruction="...", ...)  # Same config, different name
parent1 = Agent(sub_agents=[agent1])
parent2 = Agent(sub_agents=[agent2])
```

### 3. Template Variable Escaping

When you need literal braces `{}` in instructions (e.g., for JSON examples), use double braces `{{}}` to escape them.

```python
# Wrong - ADK will try to substitute {key}
agent = Agent(
    instruction='Return JSON like: {"key": "value"}'
)

# Correct - escaped braces
agent = Agent(
    instruction='Return JSON like: {{"key": "value"}}'
)
```

### 4. Streaming Tools May Not Work as Documented

Some streaming tool examples in the documentation have known issues. Check [#3955](https://github.com/google/adk-python/issues/3955) for workarounds.

### 5. Agent Engine Deployment with Dashes

Agent folder names containing dashes will fail during `adk deploy agent_engine`. Use underscores instead.

```bash
# Wrong
my-agent-folder/

# Correct
my_agent_folder/
```

## External Resources

- **Documentation**: https://google.github.io/adk-docs/
- **PyPI**: https://pypi.org/project/google-adk/
- **Reddit**: [r/agentdevelopmentkit](https://www.reddit.com/r/agentdevelopmentkit/)
- **Community Group**: [Google Groups](https://groups.google.com/g/adk-community)
- **A2A Protocol**: https://github.com/google-a2a/A2A/

---

*Last Updated: February 2026*
