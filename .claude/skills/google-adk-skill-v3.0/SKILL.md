---
name: google-adk
description: Comprehensive documentation for the Google Agent Development Kit (ADK) - a flexible and modular Python framework for building and deploying AI agents. Use this skill when you need to build AI agents with Google's ADK framework, including LLM agents, workflow agents (Sequential, Parallel, Loop), multi-agent systems, custom tools, and deployment strategies. This skill covers agent creation, tool integration, session management, runtime configuration, and best practices for agent development.
---

# Google Agent Development Kit (ADK) Skill

This skill provides comprehensive documentation for building AI agents using Google's Agent Development Kit (ADK). The ADK is a flexible, modular framework optimized for Gemini and the Google ecosystem, but model-agnostic and deployment-agnostic.

## When to Use This Skill

Use this skill when you need to:
- Build AI agents using the Google ADK framework
- Create LLM-powered agents with custom instructions and tools
- Implement workflow orchestration (sequential, parallel, or loop patterns)
- Design multi-agent systems with delegation and coordination
- Integrate custom tools (functions, MCP tools, or OpenAPI specifications)
- Deploy agents locally or to Google Cloud (Agent Engine, Cloud Run, GKE)
- Implement agent evaluation, observability, and safety features

## Quick Start

For a quick introduction to Google ADK:
1. Read `doc-instructions.md` to understand how to navigate this documentation
2. Review `concepts/overview.md` for core ADK concepts
3. Check `agents/quickstart.md` for your first agent
4. Explore `agents/` for different agent types
5. See `tools/` for tool integration options

## Documentation Structure

```
google-adk-skill/
├── SKILL.md                    # This file
├── doc-instructions.md         # How to use this documentation
├── concepts/                   # Core concepts and architecture
│   ├── overview.md            # ADK overview and key features
│   ├── sessions.md            # Session management and state
│   ├── context.md             # Context and memory management
│   └── events.md              # Event system
├── agents/                    # Agent types and patterns
│   ├── quickstart.md          # Getting started guide
│   ├── llm-agents.md          # LLM agents with reasoning
│   ├── workflow-agents.md     # Sequential, Parallel, Loop agents
│   ├── multi-agents.md        # Multi-agent systems and patterns
│   └── custom-agents.md       # Building custom agents
├── tools/                     # Tool integration
│   ├── overview.md            # Available tools
│   ├── function-tools.md      # Creating custom function tools
│   ├── built-in-tools.md      # Google and third-party tools
│   └── mcp-tools.md           # Model Context Protocol tools
├── runtime/                   # Execution and deployment
│   ├── runner.md              # Running agents locally
│   ├── deployment.md          # Deployment options
│   └── observability.md       # Logging and monitoring
├── examples/                  # Code examples and patterns
│   └── patterns.md            # Common agent patterns
└── reference/                 # API reference
    ├── api-quick-ref.md       # Quick API reference
    └── updates-and-issues.md  # Version info, releases, known issues
```

## Progressive Disclosure

This skill uses progressive disclosure to manage information:

**Level 1**: This SKILL.md file and doc-instructions.md provide overview and navigation
**Level 2**: Main topic files (e.g., llm-agents.md, function-tools.md) provide detailed information
**Level 3**: Additional specialized files can be created as needed for complex topics

When you need information:
1. Start with the topic-level file (e.g., `agents/llm-agents.md`)
2. If more detail is needed on a subtopic, consult referenced files
3. Use `examples/patterns.md` for practical implementations

## Key Capabilities

### Agent Types
- **LLM Agents**: Powered by large language models for dynamic reasoning
- **Sequential Agents**: Execute sub-agents in order
- **Parallel Agents**: Run multiple agents concurrently
- **Loop Agents**: Iterative execution with termination conditions
- **Custom Agents**: Implement your own agent logic

### Tools & Integration
- **Function Tools**: Python functions as tools
- **Built-in Tools**: Google Search, Code Execution, BigQuery, etc.
- **Third-party Tools**: Tavily, Browserbase, GitHub, Notion, etc.
- **MCP Tools**: Model Context Protocol integration
- **OpenAPI Tools**: Generate tools from OpenAPI specs

### Multi-Agent Patterns
- Coordinator/Dispatcher
- Sequential Pipeline
- Parallel Fan-Out/Gather
- Hierarchical Task Decomposition
- Review/Critique (Generator-Critic)
- Iterative Refinement
- Human-in-the-Loop

## Installation

```bash
pip install google-adk
```

## Basic Example

```python
from google.adk.agents import Agent

# Create a simple agent
agent = Agent(
    model='gemini-2.0-flash',
    name='my_agent',
    instruction='You are a helpful assistant.',
    tools=[my_custom_function]
)
```

## Important Notes

- This documentation is for **Python** implementation only
- ADK requires Python 3.10 or later (as of v1.19.0)
- Most examples use Gemini models but ADK is model-agnostic
- Always set up proper API authentication before running agents
- See `reference/updates-and-issues.md` for common gotchas and known issues

## Getting Help

1. Check `doc-instructions.md` for navigation guidance
2. Review the relevant topic file for your use case
3. Look at `examples/patterns.md` for practical patterns
4. Consult `reference/api-quick-ref.md` for API details
5. Check `reference/updates-and-issues.md` for known issues and gotchas

## Version Information

- **Current Version**: v1.23.0 (January 2026)
- **Min Python**: 3.10+ (as of v1.19.0)
- **Release Cadence**: Bi-weekly
- **Repository**: [google/adk-python](https://github.com/google/adk-python)

For recent updates, release notes, and known issues, see `reference/updates-and-issues.md`.

For the latest official documentation, visit https://google.github.io/adk-docs/
