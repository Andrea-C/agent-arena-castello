## Overview

LLM Agents are the core "thinking" components in ADK, powered by Large Language Models for reasoning, understanding natural language, making decisions, generating responses, and interacting with tools.

## Key Characteristics

- **Non-deterministic**: Behavior varies based on LLM interpretation
- **Dynamic**: Can decide which tools to use and when
- **Flexible**: Can transfer control to other agents
- **Intelligent**: Leverages LLM's understanding and reasoning

## Creating an LLM Agent

```python
from google.adk.agents import Agent  # or LlmAgent

agent = Agent(
    model='gemini-2.5-flash-lite',
    name='my_agent',
    description='What this agent does',
    instruction='Detailed behavior instructions',
    tools=[list_of_tools]
)
```

## Core Parameters

### Required Parameters

**`model`** (Required)
- LLM to power the agent
- Examples: `'gemini-2.5-flash-lite'`, `'gemini-2.5-pro'`

**`name`** (Required)
- Unique identifier
- Used for routing and delegation
- Example: `'customer_support_agent'`

### Important Parameters

**`description`** (Recommended for multi-agent)
- Concise summary of capabilities
- Used by other agents for routing decisions
- Example: `"Handles billing inquiries and payment issues"`

**`instruction`** (Critical)
- Detailed behavior guidance
- Core task/goal definition
- Tool usage guidelines
- Output format specifications
- Can use `{variable}` syntax for state variables

Example:
```python
instruction="""You are a helpful customer support agent.

When handling requests:
1. Identify the customer's issue
2. Use the 'check_order_status' tool if it's about orders
3. Use the 'process_refund' tool for refund requests
4. Always be polite and professional

Respond in a friendly, helpful tone."""
```

**`tools`** (Optional)
- List of tools the agent can use
- Can be functions, BaseTool instances, or other agents (AgentTool)
- LLM decides when to call them

```python
def get_weather(city: str) -> dict:
    """Get weather for a city."""
    return {"city": city, "temp": 72, "condition": "sunny"}

agent = Agent(
    model='gemini-2.5-flash-lite',
    name='weather_agent',
    tools=[get_weather],
    instruction='Help users with weather information'
)
```

## Advanced Configuration

### Generation Config

```python
from google.genai import types

agent = Agent(
    model='gemini-2.5-flash-lite',
    name='my_agent',
    generate_content_config=types.GenerateContentConfig(
        temperature=0.2,  # 0-1, lower = more deterministic
        max_output_tokens=1000,
        top_p=0.95,
        top_k=40,
        safety_settings=[...]
    )
)
```

### Structured Input/Output

**Output Schema** - Force JSON output:
```python
from pydantic import BaseModel, Field

class CityInfo(BaseModel):
    capital: str = Field(description="The capital city")
    population: str = Field(description="Estimated population")

agent = Agent(
    model='gemini-2.5-flash-lite',
    name='structured_agent',
    output_schema=CityInfo,
    output_key='city_data',  # Saves to state['city_data']
    instruction='Respond ONLY with JSON matching the schema'
)
```

**Input Schema** - Expect JSON input:
```python
class QueryInput(BaseModel):
    country: str = Field(description="Country name")

agent = Agent(
    input_schema=QueryInput,
    # User must provide: {"country": "France"}
)
```

### Output Key

Automatically save agent's response to state:
```python
agent = Agent(
    name='fetcher',
    output_key='data',  # Saves final response to state['data']
)

# Next agent can access it:
processor = Agent(
    instruction='Process the {data} from previous step'
)
```

### Context Control

```python
agent = Agent(
    include_contents='default',  # or 'none' for stateless
)
```

### Planning

**Built-in Planner** (Gemini thinking feature):
```python
from google.adk.planners import BuiltInPlanner
from google.genai.types import ThinkingConfig

planner = BuiltInPlanner(
    thinking_config=ThinkingConfig(
        include_thoughts=True,
        thinking_budget=256  # Token limit for thinking
    )
)

agent = Agent(
    model='gemini-2.5-pro',
    planner=planner,
    tools=[...]
)
```

**Plan-ReAct Planner** (for models without built-in thinking):
```python
from google.adk.planners import PlanReActPlanner

agent = Agent(
    model='gemini-2.5-flash-lite',
    planner=PlanReActPlanner(),
    tools=[...]
)
```

### Code Execution

```python
from google.adk.tools import code_execution

agent = Agent(
    model='gemini-2.5-flash-lite',
    code_executor=code_execution,
    instruction='You can execute Python code to solve problems'
)
```

## Complete Example

```python
from google.adk.agents import Agent
from google.genai import types

def search_database(query: str, limit: int = 10) -> dict:
    """Search database for records.
    
    Args:
        query: Search terms
        limit: Max results
    
    Returns:
        dict with status and results
    """
    # Your DB logic here
    return {
        "status": "success",
        "count": 5,
        "results": [...]
    }

def send_email(to: str, subject: str, body: str) -> dict:
    """Send email to user."""
    # Your email logic
    return {"status": "sent", "to": to}

agent = Agent(
    model='gemini-2.5-flash-lite',
    name='customer_service_agent',
    description='Handles customer inquiries and sends responses',
    instruction="""You are a customer service agent.

When a customer asks a question:
1. Use 'search_database' to find relevant information
2. Formulate a helpful response based on the results
3. If the customer requests it, use 'send_email' to send them details

Always be professional and helpful.""",
    tools=[search_database, send_email],
    generate_content_config=types.GenerateContentConfig(
        temperature=0.3,
        max_output_tokens=500
    ),
    output_key='agent_response'
)
```

## Best Practices

1. **Clear Instructions**: Be specific about what the agent should do
2. **Tool Guidance**: Explain when and how to use each tool
3. **Examples**: Include examples in instructions for complex tasks
4. **Appropriate Model**: Choose based on task complexity
5. **Error Handling**: Tools should return informative error messages
6. **Testing**: Test with various inputs to ensure reliable behavior
