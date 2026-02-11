# Observability

## Overview

Observability in ADK includes logging, tracing, and monitoring to understand agent behavior and diagnose issues.

## Logging

### Basic Logging

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In your code
logger.info("Agent started")
logger.debug("Processing message")
logger.error("Error occurred")
```

### Agent-Specific Logging

```python
def before_model_callback(ctx):
    logger.info(f"Calling LLM for agent: {ctx.agent.name}")
    logger.debug(f"Input: {ctx.messages}")

def after_model_callback(ctx):
    logger.info(f"LLM response received")
    logger.debug(f"Response: {ctx.response}")

agent = Agent(
    before_model_callback=before_model_callback,
    after_model_callback=after_model_callback,
    ...
)
```

## Cloud Trace

Integrate with Google Cloud Trace for distributed tracing:

```python
# Requires Google Cloud setup
from google.adk.observability import cloud_trace

# Enable tracing
runner = Runner(
    agent=agent,
    enable_tracing=True,
    project_id='your-project',
    ...
)
```

## Third-Party Monitoring

### AgentOps

```python
# Requires: pip install agentops
from google.adk.observability import agentops

# Configure AgentOps
agentops.init(api_key='your_key')
```

### Arize Phoenix

```python
# Requires: pip install arize-phoenix
from google.adk.observability import phoenix

# Configure Phoenix
phoenix.init()
```

### Weave

```python
# Requires: pip install weave
from google.adk.observability import weave

# Configure Weave
weave.init(project='your-project')
```

## Metrics to Monitor

### Performance Metrics
- Response time
- Token usage
- Tool execution time
- Error rates
- Success rates

### Usage Metrics
- Number of requests
- Active sessions
- User engagement
- Feature usage

### Cost Metrics
- Token costs
- API call costs
- Infrastructure costs

## Event Logging

Log all events for debugging:

```python
async for event in runner.run_async(...):
    # Log event details
    logger.info(f"Event from {event.author}")
    logger.debug(f"Event content: {event.content}")
    
    if event.error:
        logger.error(f"Event error: {event.error}")
```

## Best Practices

1. **Log Levels**: Use appropriate levels (DEBUG, INFO, WARNING, ERROR)
2. **Structured Logging**: Use structured log formats (JSON)
3. **Context**: Include relevant context in logs
4. **PII**: Don't log sensitive user information
5. **Sampling**: Sample high-volume logs in production
6. **Alerts**: Set up alerts for critical errors
7. **Dashboards**: Create dashboards for key metrics

## Debugging

### Enable Verbose Logging

```python
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

### Trace Execution

```python
def trace_callback(ctx):
    print(f"=== {ctx.agent.name} ===")
    print(f"State: {ctx.session.state}")
    print(f"Branch: {ctx.branch}")

agent = Agent(
    before_agent_callback=trace_callback,
    ...
)
```

## Production Monitoring

### Set Up Alerts

Configure alerts for:
- High error rates
- Slow response times
- Unusual token usage
- Service failures

### Create Dashboards

Monitor:
- Request volume over time
- Average response time
- Error rate trends
- Token usage
- Cost tracking

### Regular Review

- Review logs regularly
- Analyze error patterns
- Optimize performance
- Update monitoring as needed

## Next Steps

- **Deployment**: Production deployment (`runtime/deployment.md`)
- **Runner**: Understanding execution (`runtime/runner.md`)
- **Best Practices**: Implementation guide
