## Common Agent Patterns

This file contains complete, runnable examples of common agent patterns.

### Pattern 1: Simple Q&A Agent

```python
from google.adk.agents import Agent

agent = Agent(
    model='gemini-2.0-flash',
    name='qa_agent',
    instruction='Answer questions clearly and concisely.'
)
```

### Pattern 2: Tool-Using Agent

```python
from google.adk.agents import Agent

def search_database(query: str) -> dict:
    """Search the database."""
    # Your logic
    return {"status": "success", "results": [...]}

def send_notification(user_id: str, message: str) -> dict:
    """Send notification to user."""
    # Your logic
    return {"status": "sent"}

agent = Agent(
    model='gemini-2.0-flash',
    name='assistant',
    tools=[search_database, send_notification],
    instruction="""Help users with their requests.
    
    Use search_database to find information.
    Use send_notification to alert users."""
)
```

### Pattern 3: Sequential Pipeline

```python
from google.adk.agents import Agent, SequentialAgent

validator = Agent(
    name='validator',
    model='gemini-2.0-flash',
    instruction='Validate the input data',
    output_key='is_valid'
)

processor = Agent(
    name='processor',
    model='gemini-2.0-flash',
    instruction='Process data if {is_valid} is true',
    output_key='result'
)

responder = Agent(
    name='responder',
    model='gemini-2.0-flash',
    instruction='Generate response based on {result}'
)

pipeline = SequentialAgent(
    name='data_pipeline',
    sub_agents=[validator, processor, responder]
)
```

### Pattern 4: Parallel Processing

```python
from google.adk.agents import Agent, ParallelAgent, SequentialAgent

fetch1 = Agent(
    name='fetch_source1',
    instruction='Fetch data from source 1',
    output_key='source1_data'
)

fetch2 = Agent(
    name='fetch_source2',
    instruction='Fetch data from source 2',
    output_key='source2_data'
)

parallel_fetch = ParallelAgent(
    name='fetch_all',
    sub_agents=[fetch1, fetch2]
)

synthesizer = Agent(
    name='synthesizer',
    instruction='Combine {source1_data} and {source2_data}'
)

workflow = SequentialAgent(
    name='gather_and_synthesize',
    sub_agents=[parallel_fetch, synthesizer]
)
```

### Pattern 5: Coordinator/Dispatcher

```python
from google.adk.agents import Agent

billing = Agent(
    name='billing',
    description='Handles billing and payment inquiries',
    instruction='Help with billing questions'
)

support = Agent(
    name='support',
    description='Handles technical support issues',
    instruction='Help with technical problems'
)

coordinator = Agent(
    name='helpdesk',
    model='gemini-2.0-flash',
    instruction='Route requests to billing or support agents',
    sub_agents=[billing, support]
)
```

### Pattern 6: Iterative Refinement

```python
from google.adk.agents import Agent, LoopAgent, BaseAgent
from google.adk.events import Event, EventActions

refiner = Agent(
    name='refiner',
    instruction='Improve the output',
    output_key='current_output'
)

checker = Agent(
    name='checker',
    instruction='Check quality, output "good" or "needs_work"',
    output_key='quality'
)

class StopWhenGood(BaseAgent):
    async def _run_async_impl(self, ctx):
        done = ctx.session.state.get('quality') == 'good'
        yield Event(actions=EventActions(escalate=done))

loop = LoopAgent(
    name='refinement_loop',
    max_iterations=5,
    sub_agents=[refiner, checker, StopWhenGood(name='stopper')]
)
```

### Pattern 7: Agent as Tool

```python
from google.adk.agents import Agent
from google.adk.tools import agent_tool

specialist = Agent(
    name='specialist',
    instruction='Handle specialized task'
)

specialist_tool = agent_tool.AgentTool(agent=specialist)

main_agent = Agent(
    name='main',
    tools=[specialist_tool],
    instruction='Use specialist for complex tasks'
)
```

### Pattern 8: Multi-Tool Research Agent

```python
from google.adk.agents import Agent
from google.adk.tools import google_search, code_execution

def analyze_data(data: str) -> dict:
    """Analyze data and return insights."""
    # Your analysis logic
    return {"insights": [...]}

research_agent = Agent(
    model='gemini-2.0-flash',
    name='researcher',
    tools=[google_search, code_execution, analyze_data],
    instruction="""You are a research assistant.
    
    Use google_search for facts and current information.
    Use code_execution for calculations and data processing.
    Use analyze_data for deeper analysis.
    
    Always cite sources and show your work."""
)
```
