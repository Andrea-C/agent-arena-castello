## Overview

Function tools transform Python functions into capabilities that agents can use. ADK automatically wraps functions as tools when you add them to an agent's `tools` list.

## Basic Function Tool

```python
def get_weather(city: str) -> dict:
    """Get current weather for a city.
    
    Args:
        city (str): City name
    
    Returns:
        dict: Weather information with status
    """
    # Your implementation
    return {
        "status": "success",
        "city": city,
        "temperature": 72,
        "condition": "sunny"
    }

agent = Agent(
    model='gemini-2.5-flash-lite',
    name='weather_agent',
    tools=[get_weather],  # Automatically wrapped as FunctionTool
    instruction='Help users with weather information'
)
```

## Function Signature Requirements

### Parameters

**Required Parameters** (no default value):
```python
def search(query: str, category: str) -> dict:
    """Search function.
    
    Args:
        query (str): Search terms (REQUIRED)
        category (str): Category to search (REQUIRED)
    """
    pass
```

**Optional Parameters** (with default value):
```python
def search(query: str, limit: int = 10, sort: str = "relevance") -> dict:
    """Search function.
    
    Args:
        query (str): Search terms (required)
        limit (int, optional): Max results. Defaults to 10.
        sort (str, optional): Sort order. Defaults to "relevance".
    """
    pass
```

**Optional with typing.Optional**:
```python
from typing import Optional

def create_user(username: str, bio: Optional[str] = None) -> dict:
    """Create user profile.
    
    Args:
        username (str): Username (required)
        bio (str, optional): User bio. Defaults to None.
    """
    if bio:
        return {"username": username, "bio": bio}
    return {"username": username}
```

### Return Type

**Preferred**: Return a dictionary
```python
def my_tool(param: str) -> dict:
    return {
        "status": "success",
        "result": "value",
        "details": {...}
    }
```

**Automatic wrapping**: Other types are auto-wrapped
```python
def simple_tool(x: int) -> int:
    return x * 2
# Returns: {"result": 10} when called with x=5
```

### Docstrings

**Critical** - LLM uses docstring to understand the tool:

```python
def calculate_mortgage(
    principal: float,
    interest_rate: float,
    years: int
) -> dict:
    """Calculate monthly mortgage payment.
    
    This tool calculates the monthly payment for a mortgage loan
    based on the principal amount, annual interest rate, and loan term.
    
    Args:
        principal (float): Loan amount in dollars
        interest_rate (float): Annual interest rate as percentage (e.g., 5.5 for 5.5%)
        years (int): Loan term in years
    
    Returns:
        dict: Contains monthly_payment, total_paid, and total_interest
    
    Example:
        calculate_mortgage(300000, 5.5, 30)
        Returns: {"monthly_payment": 1703.37, ...}
    """
    monthly_rate = interest_rate / 100 / 12
    num_payments = years * 12
    
    if monthly_rate == 0:
        monthly_payment = principal / num_payments
    else:
        monthly_payment = principal * (monthly_rate * (1 + monthly_rate)**num_payments) / \
                         ((1 + monthly_rate)**num_payments - 1)
    
    total_paid = monthly_payment * num_payments
    total_interest = total_paid - principal
    
    return {
        "status": "success",
        "monthly_payment": round(monthly_payment, 2),
        "total_paid": round(total_paid, 2),
        "total_interest": round(total_interest, 2)
    }
```

## Advanced Tool Patterns

### Passing Data Between Tools

Use `temp:` prefix for invocation-scoped data:

```python
def tool_a(input: str) -> dict:
    # Process and store
    result = process(input)
    # Store in temp state (will be available to other tools in same invocation)
    # This is done via the tool context
    return {"status": "success", "data": result}

def tool_b() -> dict:
    # Access data from tool_a via state
    # (Framework handles this via InvocationContext)
    return {"status": "success"}
```

### Error Handling

Always return informative errors:

```python
def api_call(endpoint: str) -> dict:
    """Call external API.
    
    Args:
        endpoint (str): API endpoint path
    
    Returns:
        dict: API response or error information
    """
    try:
        response = requests.get(f"https://api.example.com/{endpoint}")
        response.raise_for_status()
        return {
            "status": "success",
            "data": response.json()
        }
    except requests.HTTPError as e:
        return {
            "status": "error",
            "error_type": "http_error",
            "error_message": f"API returned {e.response.status_code}: {str(e)}",
            "endpoint": endpoint
        }
    except requests.RequestException as e:
        return {
            "status": "error",
            "error_type": "connection_error",
            "error_message": f"Could not connect to API: {str(e)}"
        }
    except Exception as e:
        return {
            "status": "error",
            "error_type": "unexpected_error",
            "error_message": str(e)
        }
```

### Async Tools

For I/O-bound operations:

```python
async def fetch_data(url: str) -> dict:
    """Async fetch from URL.
    
    Args:
        url (str): URL to fetch
    
    Returns:
        dict: Fetched data
    """
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            data = await response.json()
            return {"status": "success", "data": data}

agent = Agent(
    tools=[fetch_data],  # ADK handles async automatically
    ...
)
```

## Long-Running Tools

For operations that take significant time:

```python
from google.adk.tools import LongRunningFunctionTool

def start_analysis(data_id: str) -> dict:
    """Start long-running analysis.
    
    Returns initial status, actual work happens elsewhere.
    """
    # Initiate the task
    task_id = start_background_job(data_id)
    
    # Return initial response
    return {
        "status": "started",
        "task_id": task_id,
        "message": "Analysis started"
    }

# Wrap with LongRunningFunctionTool
analysis_tool = LongRunningFunctionTool(func=start_analysis)

agent = Agent(
    tools=[analysis_tool],
    ...
)
```

The agent run pauses, allowing you to:
1. Send progress updates
2. Send final results when ready
3. Continue agent execution

## Agent as Tool

Use another agent as a tool:

```python
from google.adk.tools import agent_tool

specialist_agent = Agent(
    name='specialist',
    instruction='Specialized task handling'
)

specialist_tool = agent_tool.AgentTool(
    agent=specialist_agent,
    skip_summarization=True  # Optional: skip LLM summarization
)

main_agent = Agent(
    name='main',
    tools=[specialist_tool],
    instruction='Use specialist for complex tasks'
)
```

## Best Practices

### 1. Function Names
- Use clear, descriptive names
- Indicate what the function does
- Bad: `do_stuff`, `helper1`
- Good: `search_database`, `send_email`, `calculate_tax`

### 2. Parameter Design
- Fewer parameters are better
- Use simple types (str, int, float, bool)
- Avoid complex objects
- Provide defaults for optional parameters

### 3. Return Values
- Always return dict with "status" key
- Include helpful error messages
- Provide context in responses
- Make results self-explanatory

### 4. Docstrings
- Write for the LLM, not just humans
- Explain what the tool does
- Describe each parameter clearly
- Show expected return format
- Include examples if helpful

### 5. Error Handling
- Catch all exceptions
- Return informative error dicts
- Include error_type and error_message
- Log errors for debugging

### 6. Performance
- Use async for I/O operations
- Cache expensive computations
- Keep functions focused and fast
- Consider long-running tool for slow operations

### 7. State Management
- Use function parameters for inputs
- Return results in response dict
- Use temp: state for data passing between tools
- Don't rely on global variables

## Complete Example

```python
import aiohttp
from typing import Optional

async def search_products(
    query: str,
    category: Optional[str] = None,
    max_results: int = 10
) -> dict:
    """Search for products in the catalog.
    
    Searches the product database for items matching the query.
    Results can be filtered by category and limited in number.
    
    Args:
        query (str): Search terms (required)
        category (str, optional): Filter by category. Options: electronics, 
            clothing, books, home. Defaults to None (all categories).
        max_results (int, optional): Maximum results to return. Defaults to 10.
    
    Returns:
        dict: Search results with status, count, and products list.
            Example: {
                "status": "success",
                "count": 3,
                "products": [
                    {"id": 1, "name": "Product 1", "price": 29.99},
                    ...
                ]
            }
    
    Raises:
        No exceptions raised - all errors returned in dict.
    """
    try:
        # Build query parameters
        params = {
            "q": query,
            "limit": max_results
        }
        if category:
            params["category"] = category
        
        # Make API call
        async with aiohttp.ClientSession() as session:
            async with session.get(
                "https://api.example.com/products/search",
                params=params
            ) as response:
                
                if response.status != 200:
                    return {
                        "status": "error",
                        "error_type": "api_error",
                        "error_message": f"API returned status {response.status}"
                    }
                
                data = await response.json()
                
                return {
                    "status": "success",
                    "count": len(data.get("products", [])),
                    "products": data.get("products", []),
                    "query": query,
                    "category": category
                }
                
    except aiohttp.ClientError as e:
        return {
            "status": "error",
            "error_type": "connection_error",
            "error_message": f"Could not connect to product API: {str(e)}"
        }
    except Exception as e:
        return {
            "status": "error",
            "error_type": "unexpected_error",
            "error_message": str(e)
        }

# Use in agent
agent = Agent(
    model='gemini-2.5-flash-lite',
    name='shopping_assistant',
    tools=[search_products],
    instruction="""Help users find products.
    
    Use the search_products tool to find items matching their request.
    Present results in a friendly, organized way.
    If no results, suggest alternative search terms."""
)
```
