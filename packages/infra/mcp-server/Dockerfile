# Apollo MCP Server Dockerfile for production deployments
# This dockerfile is used for deploying to platforms like Render.com

# Pin to specific SHA digest for reproducibility
# NOTE: Update this digest carefully - different versions may have different binary locations
FROM ghcr.io/apollographql/apollo-mcp-server:latest@sha256:a78a66c637236d2d72b1ff1fa34a0c7c7f7d2a84b372a2c54bd2eb13655a3dc1 AS mcp-source

# Stage 2: Runtime image with shell support (Debian for glibc compatibility)
FROM debian:bookworm-slim

# Install CA certificates for HTTPS connections
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy the Apollo MCP Server binary
COPY --from=mcp-source /bin/apollo-mcp-server /usr/local/bin/apollo-mcp-server

# Copy the Nix store libraries that the binary needs
COPY --from=mcp-source /nix /nix

# Copy operations and schema files
COPY packages/infra/mcp-server/operations /app/operations
COPY packages/webapp-libs/webapp-api-client/graphql/schema /app/schema

# Copy entrypoint script
COPY packages/infra/mcp-server/docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Set environment variables (can be overridden at runtime)
ENV MCP_LOG_LEVEL=info
# GRAPHQL_ENDPOINT should be set at runtime (e.g., https://your-backend.onrender.com/api/graphql/)

# Expose the default port
EXPOSE 4000

# Use entrypoint script to generate config at runtime
ENTRYPOINT ["/app/docker-entrypoint.sh"]
