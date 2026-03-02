# Apollo MCP Server Configuration

This directory contains the configuration for the Apollo MCP Server, which exposes GraphQL operations as MCP (Model Context Protocol) tools for AI assistants.

## Overview

The MCP Server acts as a bridge between AI models (OpenAI, Claude, etc.) and your GraphQL API, allowing AI assistants to query your business data in a secure, tenant-scoped manner.

## Directory Structure

```
mcp-server/
├── config.yaml           # Main server configuration
├── Dockerfile            # Production Dockerfile for cloud deployments
├── operations/           # GraphQL operations exposed as MCP tools
│   ├── projects.graphql  # Project queries
│   ├── clients.graphql   # Client queries
│   ├── people.graphql    # Team member queries
│   ├── financials.graphql # Revenue, costs, profitability
│   ├── forecasting.graphql # Forecasting and insights
│   ├── invoices.graphql  # Invoice queries
│   └── deals.graphql     # Sales pipeline queries
└── README.md
```

## Configuration

### Environment Variables

| Variable                | Description                                                 | Default                            |
| ----------------------- | ----------------------------------------------------------- | ---------------------------------- |
| `GRAPHQL_ENDPOINT`      | Backend GraphQL endpoint                                    | `http://backend:5001/api/graphql/` |
| `MCP_LLM_PROVIDER`      | LLM provider (openai/anthropic)                             | `openai`                           |
| `MCP_LLM_MODEL`         | Model to use                                                | `gpt-4o`                           |
| `OPENAI_API_KEY`        | OpenAI API key                                              | Required                           |
| `MCP_TELEMETRY_ENABLED` | Enable OpenTelemetry                                        | `false`                            |
| `MCP_LOG_LEVEL`         | Log level                                                   | `info`                             |
| `MUTATION_MODE`         | Mutation mode: `none`, `explicit` (pre-defined only), `all` | `explicit`                         |

### Adding New Operations

To expose new GraphQL queries as MCP tools:

1. Create a new `.graphql` file in the `operations/` directory
2. Add the `@tool` directive comment with name and description:

```graphql
# @tool(name: "my_tool_name", description: "Description for the AI to understand when to use this tool")
query MyQuery($tenantId: ID!, $otherParam: String) {
  myQuery(tenantId: $tenantId, otherParam: $otherParam) {
    field1
    field2
  }
}
```

3. Restart the MCP server to pick up the new operations

### Security

- All requests go through the Django proxy which validates tenant access
- The `tenantId` parameter is injected server-side and cannot be manipulated by clients
- Rate limiting is configured at both proxy and MCP server levels
- Mutation mode is set to `explicit` by default (only pre-defined mutations allowed)
- To change mutation behavior, set `MUTATION_MODE` environment variable or update `config.yaml`

### Mutation Modes

| Mode       | Description                             | Recommended For            |
| ---------- | --------------------------------------- | -------------------------- |
| `none`     | Mutations disabled, read-only           | High security environments |
| `explicit` | Only pre-defined mutation tools allowed | Production (default)       |
| `all`      | AI can build arbitrary mutations        | Development only           |

## Deployment

### Local Development

The MCP server is automatically started with `pnpm saas up`:

```bash
# Start all services including MCP server
pnpm saas up

# Or start MCP server individually
docker compose up mcp-server
```

### VPS / Self-Hosted (docker-compose.prod.yml)

The MCP server is included in the production docker-compose configuration:

```bash
# Deploy with all services
docker compose -f docker-compose.prod.yml up -d
```

Required environment variables in `.env.prod`:

- `OPENAI_API_KEY` - Your OpenAI API key
- `MCP_LLM_MODEL` - Model to use (default: gpt-4o)

### Render.com

The MCP server is defined in `render.yaml` but commented out by default to save costs.
To enable it:

1. Uncomment the `mcp-server` service in `render.yaml`
2. Deploy to Render
3. Set environment variables in Render Dashboard:
   - `GRAPHQL_ENDPOINT`: Your backend API URL (e.g., `https://backend-api-xxxx.onrender.com/api/graphql/`)
   - `OPENAI_API_KEY`: Your OpenAI API key
4. Update `MCP_SERVER_URL` in backend-api to point to the MCP server URL

### AWS (ECS Fargate)

For AWS deployments, you'll need to:

1. Create an ECS task definition for the MCP server
2. Add the service to your ECS cluster
3. Configure the security group to allow traffic from the backend service
4. Set the `MCP_SERVER_URL` environment variable in the backend task

## Backend Integration

The Django backend includes a proxy endpoint at `/api/ai-assistant/` that:

- Validates user authentication and tenant access
- Injects `tenantId` into all GraphQL operations
- Forwards requests to the MCP server
- Handles errors gracefully when MCP is unavailable

Required backend environment variable:

- `MCP_SERVER_URL` - URL of the MCP server (e.g., `http://mcp-server:4000`)

If `MCP_SERVER_URL` is not set, the AI Assistant will be disabled with a helpful message.

## Testing

You can test the MCP server using the MCP Inspector:

```bash
# Install MCP Inspector
npm install -g @modelcontextprotocol/inspector

# Connect to the server
mcp-inspector http://localhost:4000
```

Or test the AI Assistant directly via the API:

```bash
curl -X POST http://localhost:5001/api/ai-assistant/tenants/{tenant_id}/chat/ \
  -H "Authorization: Bearer {your_token}" \
  -H "Content-Type: application/json" \
  -d '{"message": "How many active projects do we have?"}'
```

## Role-Based Access Control (RBAC)

The MCP server implements role-based access control through the GraphQL backend. **Always call `get_user_permissions` first** to discover what data the current user can access.

### Permission System

Users are assigned organization roles that grant specific permissions. The system supports:

- **OWNER**: Full access to all data and operations
- **ADMIN**: Administrative access to most data (excluding delete operations)
- **MEMBER**: Limited access based on assigned permissions

### Discovery Flow

1. **First call**: `get_user_permissions` to get current user's permissions
2. **Check permissions**: Before calling any tool, verify the user has required permissions
3. **Handle access denied**: If user lacks permission, explain what access they need instead of erroring

Example response when user lacks access:

> "You don't have access to financial data (requires `management.financial.view` permission). Please contact your organization admin to request access."

## Available Tools

### 🔐 Access Control (Always Call First)

| Tool                   | Description                                                        | Required Permission  |
| ---------------------- | ------------------------------------------------------------------ | -------------------- |
| `get_user_permissions` | **CRITICAL**: Get user's permissions and roles. Always call first! | None (authenticated) |

## Troubleshooting

### MCP server not starting

1. Check if the backend is running: `docker compose ps backend`
2. Check MCP server logs: `docker compose logs mcp-server`
3. Verify `OPENAI_API_KEY` is set in your environment

### AI Assistant returns "unavailable" error

1. Check if `MCP_SERVER_URL` is set in backend environment
2. Verify MCP server is reachable: `curl http://localhost:4000/health`
3. Check backend logs for connection errors

### GraphQL operations not being recognized

1. Verify the `.graphql` files are in the `operations/` directory
2. Check that each query has a `# @tool(...)` comment
3. Restart the MCP server after adding new operations
