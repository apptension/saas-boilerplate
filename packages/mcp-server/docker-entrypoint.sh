#!/bin/sh
# Entrypoint script for Apollo MCP Server
# Generates config from environment variables at runtime

set -e

# Default values
GRAPHQL_ENDPOINT="${GRAPHQL_ENDPOINT:-http://backend:5001/api/graphql/}"
# Mutation mode: none (default), explicit (pre-defined mutations only), all (any mutations)
MUTATION_MODE="${MUTATION_MODE:-explicit}"

# Generate config file from template
cat > /app/runtime-config.yaml << EOF
# Apollo MCP Server - Runtime Configuration
# Auto-generated from environment variables

# GraphQL endpoint to execute queries against
endpoint: ${GRAPHQL_ENDPOINT}

# Forward authentication headers from MCP client to GraphQL endpoint
forward_headers:
  - Authorization
  - X-Tenant-ID

# Transport configuration for HTTP server
transport:
  type: streamable_http
  address: 0.0.0.0
  port: 4000

health_check:
  enabled: true
  path: /health

# Schema configuration - use local file
schema:
  source: local
  path: /app/schema/api.graphql

# Operations to expose as MCP tools
operations:
  source: local
  paths:
    - /app/operations

# Introspection capabilities for AI
introspection:
  execute:
    enabled: true
  introspect:
    enabled: true
  search:
    enabled: true

# Enable mutations (create/update/delete operations)
# Options: none (default), explicit (pre-defined mutations only), all (any mutations)
overrides:
  mutation_mode: ${MUTATION_MODE}
EOF

echo "Generated config with endpoint: ${GRAPHQL_ENDPOINT}, mutation_mode: ${MUTATION_MODE}"

if [ -n "${CHAMBER_SERVICE_NAME}" ]; then
  exec /bin/chamber exec "${CHAMBER_SERVICE_NAME}" -- apollo-mcp-server /app/runtime-config.yaml "$@"
else
  exec apollo-mcp-server /app/runtime-config.yaml "$@"
fi
