## Overview

ADK provides numerous pre-built tools for common tasks. These are production-ready and optimized for use with ADK agents.

## Google/Gemini Tools

### Google Search
Perform web searches using Google Search with Gemini.

```python
from google.adk.tools import google_search

agent = Agent(
    model='gemini-2.5-flash-lite',
    tools=[google_search],
    instruction='Use Google Search for factual information'
)
```

### Code Execution
Execute Python code using Gemini's code execution capability.

```python
from google.adk.tools import code_execution

agent = Agent(
    model='gemini-2.5-flash-lite',
    code_executor=code_execution,
    instruction='You can write and execute Python code to solve problems'
)
```

## Google Cloud Tools

### BigQuery
Connect to BigQuery for data queries and analysis.

```python
# Requires Google Cloud setup
from google.adk.tools import bigquery_tool

agent = Agent(
    tools=[bigquery_tool],
    instruction='Query BigQuery for data analysis'
)
```

### Vertex AI RAG
Retrieve information from private data using Vertex AI RAG Engine.

```python
from google.adk.tools import vertex_ai_rag

agent = Agent(
    tools=[vertex_ai_rag],
    instruction='Search our private knowledge base'
)
```

## Third-Party Tools

### Tavily Search
Real-time web search and extraction.

```python
# Requires: pip install tavily-python
from google.adk.tools.third_party import tavily

agent = Agent(
    tools=[tavily.search],
    instruction='Use Tavily for current web information'
)
```

### Exa
Search and extract structured content from websites.

```python
# Requires Exa API key
from google.adk.tools.third_party import exa

agent = Agent(
    tools=[exa.search],
    instruction='Use Exa for structured web data'
)
```

### GitHub
Analyze code, manage issues and PRs.

```python
# Requires GitHub token
from google.adk.tools.third_party import github

agent = Agent(
    tools=[github.search_repos, github.create_issue],
    instruction='Help with GitHub operations'
)
```

### Browserbase
Web browsing capabilities for agents.

```python
# Requires Browserbase API key
from google.adk.tools.third_party import browserbase

agent = Agent(
    tools=[browserbase.browse],
    instruction='Browse websites as needed'
)
```

## Tool Configuration

Most tools require API keys or credentials:

```python
import os

# Set environment variables
os.environ['TAVILY_API_KEY'] = 'your_key'
os.environ['GITHUB_TOKEN'] = 'your_token'

# Or pass directly if supported by the tool
tool = SomeTool(api_key='your_key')
```

## Using Multiple Tools

```python
from google.adk.tools import google_search, code_execution
from google.adk.tools.third_party import tavily

agent = Agent(
    model='gemini-2.5-flash-lite',
    name='research_agent',
    tools=[
        google_search,
        tavily.search,
        code_execution
    ],
    instruction="""You are a research assistant.
    
    Use google_search for general queries.
    Use tavily.search for real-time current events.
    Use code_execution for calculations and data analysis."""
)
```

## Best Practices

1. **API Keys**: Store securely in environment variables
2. **Rate Limits**: Be aware of API rate limits
3. **Error Handling**: Tools handle errors, but check responses
4. **Cost**: Some tools incur costs per use
5. **Testing**: Test tools individually before combining
