# Google ADK Quick Start Guide

This guide will help you get started with the Google Agent Development Kit (ADK) for Python.

## Prerequisites

- Python 3.9 or later
- `pip` for installing packages
- A Gemini API key (or other supported LLM API key)

## Installation

### Step 1: Create a Virtual Environment (Recommended)

```bash
# Create a Python virtual environment
python -m venv adk-env

# Activate the virtual environment
# On macOS/Linux:
source adk-env/bin/activate
# On Windows:
# adk-env\Scripts\activate
```

### Step 2: Install ADK

```bash
pip install google-adk
```

## Create Your First Agent Project

### Using the CLI Command

```bash
adk create my_agent_project
cd my_agent_project
```

This creates a project with the following structure:

```
my_agent_project/
├── agent.py          # Main agent definition
├── .env             # Environment variables (create this)
└── requirements.txt # Project dependencies
```

## Configure API Authentication

### Set Your API Key

Create a `.env` file in your project directory:

```bash
echo "GOOGLE_API_KEY=your_api_key_here" > .env
```

To get a Gemini API key:
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key and add it to your `.env` file

## Write Your First Agent

Edit `agent.py` to create a simple agent:

```python
from google.adk.agents import Agent

# Define a simple tool
def get_current_time(city: str) -> dict:
    """Returns the current time in a specified city.
    
    Args:
        city (str): The city name.
    
    Returns:
        dict: Status and time information.
    """
    # Mock implementation - replace with actual time API
    return {
        "status": "success",
        "city": city,
        "time": "10:30 AM"
    }

# Create the agent
root_agent = Agent(
    model='gemini-2.5-flash-lite',
    name='time_agent',
    description="Tells the current time in a specified city.",
    instruction="""You are a helpful assistant that tells the current time in cities.
    Use the 'get_current_time' tool for this purpose.
    Always be friendly and clear in your responses.""",
    tools=[get_current_time],
)
```

## Run Your Agent

### Option 1: Command-Line Interface

```bash
adk run
```

This starts an interactive chat session in your terminal:

```
You: What time is it in Tokyo?
Agent: [Uses get_current_time tool and responds]
```

### Option 2: Web Interface

```bash
adk web
```

This starts a local web server at `http://localhost:8000` with a chat interface.

### Option 3: Programmatic Access

```python
import asyncio
from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

# Define agent (as above)
root_agent = Agent(...)

# Set up session and runner
APP_NAME = "my_app"
USER_ID = "user123"
SESSION_ID = "session123"

async def main():
    # Create session service
    session_service = InMemorySessionService()
    
    # Create session
    session = await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
        session_id=SESSION_ID
    )
    
    # Create runner
    runner = Runner(
        agent=root_agent,
        app_name=APP_NAME,
        session_service=session_service
    )
    
    # Send a message
    user_message = types.Content(
        role='user',
        parts=[types.Part(text="What time is it in London?")]
    )
    
    # Process and print response
    async for event in runner.run_async(
        user_id=USER_ID,
        session_id=SESSION_ID,
        new_message=user_message
    ):
        if event.is_final_response() and event.content:
            print("Agent:", event.content.parts[0].text)

# Run the async function
asyncio.run(main())
```

## Understanding the Code

### Agent Components

1. **model**: The LLM to use (e.g., 'gemini-2.5-flash-lite', 'gemini-2.5-pro')
2. **name**: Unique identifier for the agent
3. **description**: What the agent does (used for delegation in multi-agent systems)
4. **instruction**: Detailed guidance on how the agent should behave
5. **tools**: List of functions/tools the agent can use

### Tool Functions

Tools are Python functions that agents can call. They should:
- Have clear, descriptive names
- Include comprehensive docstrings
- Use type hints for parameters
- Return dictionaries with meaningful keys (recommended)

```python
def my_tool(param1: str, param2: int) -> dict:
    """Brief description of what the tool does.
    
    Args:
        param1 (str): Description of param1.
        param2 (int): Description of param2.
    
    Returns:
        dict: What the tool returns.
    """
    return {"status": "success", "result": "value"}
```

## Next Steps

### Add More Tools

```python
def search_weather(city: str) -> dict:
    """Get weather for a city."""
    return {"city": city, "weather": "sunny", "temp": 72}

def calculate_distance(city1: str, city2: str) -> dict:
    """Calculate distance between two cities."""
    return {"from": city1, "to": city2, "distance": "1000 km"}

# Add multiple tools to your agent
root_agent = Agent(
    model='gemini-2.5-flash-lite',
    name='travel_agent',
    tools=[get_current_time, search_weather, calculate_distance],
    instruction="..."
)
```

### Use Built-in Tools

ADK provides several built-in tools:

```python
from google.adk.tools import google_search, code_execution

agent = Agent(
    model='gemini-2.5-flash-lite',
    name='research_agent',
    tools=[google_search, code_execution],
    instruction="Use Google Search for facts and code execution for calculations."
)
```

### Create a Multi-Step Agent

```python
from google.adk.agents import Agent, SequentialAgent

# Step 1: Validate input
validator = Agent(
    name="validator",
    model='gemini-2.5-flash-lite',
    instruction="Check if the user input is valid.",
    output_key="validation_result"
)

# Step 2: Process data
processor = Agent(
    name="processor",
    model='gemini-2.5-flash-lite',
    instruction="Process the data if validation_result is 'valid'.",
    output_key="process_result"
)

# Step 3: Generate response
responder = Agent(
    name="responder",
    model='gemini-2.5-flash-lite',
    instruction="Generate a response based on process_result."
)

# Combine into sequential workflow
pipeline = SequentialAgent(
    name="validation_pipeline",
    sub_agents=[validator, processor, responder]
)
```

## Common Patterns

### Pattern 1: Simple Q&A Agent

```python
qa_agent = Agent(
    model='gemini-2.5-flash-lite',
    name='qa_agent',
    instruction="Answer questions clearly and concisely."
)
```

### Pattern 2: Agent with External Data

```python
def fetch_user_data(user_id: str) -> dict:
    """Fetch user data from database."""
    # Your database logic here
    return {"user_id": user_id, "name": "John", "age": 30}

data_agent = Agent(
    model='gemini-2.5-flash-lite',
    name='data_agent',
    tools=[fetch_user_data],
    instruction="Help users by fetching and analyzing their data."
)
```

### Pattern 3: Multi-Agent Coordinator

```python
# Specialist agents
billing_agent = Agent(
    name="billing",
    model='gemini-2.5-flash-lite',
    description="Handles billing and payment inquiries."
)

support_agent = Agent(
    name="support",
    model='gemini-2.5-flash-lite',
    description="Handles technical support issues."
)

# Coordinator that routes to specialists
coordinator = Agent(
    name="coordinator",
    model='gemini-2.5-flash-lite',
    instruction="Route user requests to billing or support agents.",
    sub_agents=[billing_agent, support_agent]
)
```

## Troubleshooting

### Common Issues

**Import Error:**
```
ModuleNotFoundError: No module named 'google.adk'
```
Solution: Make sure you've installed ADK: `pip install google-adk`

**API Key Error:**
```
AuthenticationError: Invalid API key
```
Solution: Check your `.env` file and ensure `GOOGLE_API_KEY` is set correctly.

**Model Not Found:**
```
ValueError: Unknown model: gemini-2.5-flash-lite
```
Solution: Check the model name. Available models include:
- `gemini-2.5-flash-lite`
- `gemini-2.5-flash`
- `gemini-2.5-pro`

## Best Practices

1. **Clear Instructions**: Write detailed, clear instructions for your agents
2. **Good Tool Descriptions**: Use comprehensive docstrings for all tools
3. **Handle Errors**: Tools should return error information in their responses
4. **Test Incrementally**: Start with simple agents and add complexity gradually
5. **Use Appropriate Models**: Choose faster models for simple tasks, more capable models for complex reasoning

## Model Selection Guide

| Model | Speed | Capability | Best For |
|-------|-------|------------|----------|
| gemini-2.5-flash-lite | Fast | Good | Simple tasks, chat, quick responses |
| gemini-2.5-flash | Fast | Better | General purpose, most use cases |
| gemini-2.5-pro | Slower | Best | Complex reasoning, critical tasks |

## Using Other AI Models

ADK is model-agnostic. You can use other models by configuring them:

```python
# Example: Using a different model
agent = Agent(
    model='claude-3-5-sonnet-20241022',  # If supported
    name='my_agent',
    # ... other parameters
)
```

See `agents/llm-agents.md` for more details on model configuration.

## Next Topics to Explore

- **LLM Agents**: Deep dive into agent configuration (`agents/llm-agents.md`)
- **Custom Tools**: Create sophisticated tools (`tools/function-tools.md`)
- **Multi-Agent Systems**: Build complex agent architectures (`agents/multi-agents.md`)
- **Workflow Agents**: Orchestrate agent execution (`agents/workflow-agents.md`)
- **Deployment**: Deploy to production (`runtime/deployment.md`)

## Additional Resources

- [Official Documentation](https://google.github.io/adk-docs/)
- [API Reference](reference/api-quick-ref.md)
- [Example Patterns](examples/patterns.md)

## Summary

You now have:
✅ Installed Google ADK  
✅ Created your first agent  
✅ Added custom tools  
✅ Run the agent in different modes  
✅ Understanding of basic concepts  

Continue to the next topics to build more sophisticated agents!
