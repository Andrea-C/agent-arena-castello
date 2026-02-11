## Deployment Options

ADK agents can be deployed in multiple ways depending on your needs.

### Local Development

**CLI Interface:**
```bash
adk run
```

**Web Interface:**
```bash
adk web
# Access at http://localhost:8000
```

**Programmatic:**
```python
# As shown in runtime/runner.md
```

### Vertex AI Agent Engine

Managed Google Cloud service for agents.

**Setup:**
1. Create Google Cloud project
2. Enable Vertex AI API
3. Configure storage bucket
4. Create Reasoning Engine resource

**Deploy:**
```python
# Configuration for VertexAiSessionService
from google.adk.sessions import VertexAiSessionService

session_service = VertexAiSessionService(
    project='your-project-id',
    location='us-central1'
)

# Use Reasoning Engine ID as app_name
```

**Benefits:**
- Managed infrastructure
- Automatic scaling
- Integrated with Google Cloud
- Built-in monitoring

### Cloud Run

Serverless container platform.

**Steps:**
1. Create Dockerfile
2. Build container
3. Deploy to Cloud Run
4. Configure environment variables

**Example Dockerfile:**
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["python", "main.py"]
```

**Deploy:**
```bash
gcloud run deploy my-agent \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
```

### Google Kubernetes Engine (GKE)

For complex, scalable deployments.

**Steps:**
1. Create GKE cluster
2. Build container
3. Create Kubernetes manifests
4. Deploy to cluster

**Benefits:**
- Full control
- High scalability
- Advanced orchestration
- Multi-region support

### Custom Infrastructure

Deploy anywhere Docker runs.

**Requirements:**
- Python 3.9+ runtime
- Environment variables for API keys
- Persistent storage for sessions (if needed)
- Network access to LLM APIs

## Environment Configuration

**Required Environment Variables:**
```bash
GOOGLE_API_KEY=your_gemini_api_key
# Or for Vertex AI:
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
GOOGLE_CLOUD_PROJECT=your-project-id
```

**Optional:**
```bash
# Third-party tool API keys
TAVILY_API_KEY=...
GITHUB_TOKEN=...
# etc.
```

## Production Considerations

### Session Persistence

Use `VertexAiSessionService` or `DatabaseSessionService` for production:

```python
# Production session service
session_service = VertexAiSessionService(
    project='your-project',
    location='us-central1'
)
```

### Error Handling

```python
try:
    async for event in runner.run_async(...):
        # Process event
        pass
except Exception as e:
    logger.error(f"Agent error: {e}")
    # Handle error appropriately
```

### Logging

```python
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("Agent started")
logger.debug("Processing message")
logger.error("Error occurred")
```

### Rate Limiting

Implement rate limiting for user requests:

```python
from ratelimit import limits, sleep_and_retry

@sleep_and_retry
@limits(calls=10, period=60)  # 10 requests per minute
async def handle_request(user_id, message):
    # Process request
    pass
```

### Monitoring

- Log all agent interactions
- Track error rates
- Monitor LLM token usage
- Measure response times
- Set up alerts

### Security

- Store API keys securely (never in code)
- Use service accounts for GCP
- Implement authentication
- Validate user inputs
- Rate limit requests
- Log security events

## Scaling Considerations

### Horizontal Scaling
- Deploy multiple instances
- Use load balancer
- Share session storage (VertexAi or Database)

### Performance
- Cache common responses
- Use appropriate models (Flash for speed)
- Implement timeouts
- Optimize tool execution

### Cost Management
- Monitor token usage
- Choose cost-effective models
- Implement usage quotas
- Cache when possible
