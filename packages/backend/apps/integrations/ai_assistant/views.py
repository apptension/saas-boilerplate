"""
AI Assistant MCP Proxy Views

This module provides REST endpoints for proxying MCP (Model Context Protocol)
requests to the Apollo MCP Server with tenant context injection.

Architecture:
- Frontend -> Backend (this module) -> Apollo MCP Server -> GraphQL API
- Backend acts as MCP client, bridging OpenAI with MCP tools
- Apollo MCP Server exposes GraphQL operations as MCP tools
"""

import base64
import json
import logging
import httpx
import re
import time
from typing import Optional, Generator
from django.conf import settings
from django.core.cache import cache
from django.http import StreamingHttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from rest_framework.throttling import UserRateThrottle
from openai import OpenAI

from apps.multitenancy.models import Tenant, TenantMembership, user_has_permission, get_user_permissions_for_tenant

logger = logging.getLogger(__name__)


# ============================================================================
# Tool Name Normalization - Convert PascalCase to snake_case
# ============================================================================


def normalize_tool_name(tool_name: str) -> str:
    """
    Normalize tool name to snake_case format.

    Handles both formats:
    - PascalCase: GetSubscriptionStatus -> get_subscription_status
    - Already snake_case: get_subscription_status -> get_subscription_status

    This ensures consistent lookup in TOOL_PERMISSIONS and TOOL_DISPLAY_NAMES
    regardless of what format the MCP server returns.
    """
    if not tool_name:
        return tool_name

    # If already snake_case (contains underscores and is lowercase), return as-is
    if "_" in tool_name and tool_name == tool_name.lower():
        return tool_name

    # Convert PascalCase/camelCase to snake_case
    # Insert underscore before uppercase letters and convert to lowercase
    s1 = re.sub("(.)([A-Z][a-z]+)", r"\1_\2", tool_name)
    return re.sub("([a-z0-9])([A-Z])", r"\1_\2", s1).lower()


# ============================================================================
# Tool Permission Mapping - Maps MCP tool names to required permissions
# ============================================================================

TOOL_PERMISSIONS = {
    "get_user_permissions": None,
    "get_current_user": None,
    "get_user_tenants": None,
    "get_notifications": None,
    "get_subscription_status": "billing.view",
    "get_documents": "features.documents.view",
    "get_crud_demo_items": "features.crud.view",
    "get_crud_demo_item": "features.crud.view",
    "create_crud_demo_item": "features.crud.manage",
    "update_crud_demo_item": "features.crud.manage",
    "delete_crud_demo_item": "features.crud.manage",
    "get_action_logs": "security.logs.view",
    "introspect": None,
    "search": None,
}


def get_required_permission(tool_name: str) -> str | None:
    """
    Get the permission required for a tool.
    Returns None if no specific permission is required (just authentication).
    Returns the permission code string if a permission is required.

    Automatically normalizes PascalCase to snake_case for lookup.
    """
    normalized = normalize_tool_name(tool_name)
    return TOOL_PERMISSIONS.get(normalized)


def check_tool_permission(user, tenant, tool_name: str) -> tuple[bool, str | None]:
    """
    Check if a user has permission to use a specific MCP tool.

    Returns:
        (has_permission, error_message)
        - has_permission: True if user can use the tool
        - error_message: None if allowed, human-readable error if denied
    """
    required_permission = get_required_permission(tool_name)

    # No permission required for this tool
    if required_permission is None:
        return True, None

    # Check if user has the required permission
    if user_has_permission(user, tenant, required_permission):
        return True, None

    # Permission denied - return a helpful message
    permission_descriptions = {
        "billing.view": "billing and subscription information",
        "features.documents.view": "documents",
        "features.crud.view": "CRUD demo items",
        "features.crud.manage": "create/edit/delete CRUD demo items",
        "security.logs.view": "activity and audit logs",
    }

    data_type = permission_descriptions.get(required_permission, required_permission)
    error_msg = (
        f"Access denied: You don't have permission to access {data_type}. Required permission: {required_permission}"
    )

    logger.warning(f"Tool permission denied: user lacks {required_permission} for tool {tool_name}")
    return False, error_msg


# ============================================================================
# Human-readable tool names for better UX
# ============================================================================

TOOL_DISPLAY_NAMES = {
    "introspect": "Analyzing data schema",
    "search": "Searching data",
    "get_user_permissions": "Checking your access permissions",
    "get_current_user": "Loading your profile",
    "get_user_tenants": "Loading your organizations",
    "get_notifications": "Loading your notifications",
    "get_subscription_status": "Checking subscription status",
    "get_documents": "Loading documents",
    "get_crud_demo_items": "Loading items",
    "get_crud_demo_item": "Loading item details",
    "create_crud_demo_item": "Creating new item",
    "update_crud_demo_item": "Updating item",
    "delete_crud_demo_item": "Deleting item",
    "get_action_logs": "Searching activity logs",
}


def get_tool_display_name(tool_name: str) -> str:
    """
    Get a human-readable display name for an MCP tool.

    Automatically normalizes PascalCase to snake_case for lookup.
    Falls back to a formatted version of the tool name if not found.
    """
    normalized = normalize_tool_name(tool_name)
    if normalized in TOOL_DISPLAY_NAMES:
        return TOOL_DISPLAY_NAMES[normalized]
    readable = normalized.replace("_", " ").lower()
    return f"Using {readable}"


# ============================================================================
# MCP Client - Interface with Apollo MCP Server
# ============================================================================


class MCPClient:
    """
    MCP (Model Context Protocol) client for communicating with Apollo MCP Server.

    The Apollo MCP Server exposes GraphQL operations as MCP tools that can be
    discovered and executed via the MCP protocol.

    MCP Protocol Flow:
    1. initialize - Handshake with server capabilities
    2. initialized - Notification that client is ready
    3. tools/list - Discover available tools
    4. tools/call - Execute a tool (with permission check!)

    Security:
    - Each tool call is checked against the user's RBAC permissions
    - Tools requiring specific permissions will be denied if user lacks access
    """

    TOOLS_CACHE_KEY = "mcp_tools_cache"
    TOOLS_CACHE_TTL = 300  # 5 minutes
    SESSION_CACHE_KEY = "mcp_session_id"

    def __init__(self, mcp_server_url: str, auth_header: Optional[str] = None, user=None, tenant=None):
        self.mcp_server_url = mcp_server_url.rstrip("/")
        self.auth_header = auth_header
        self.user = user  # Django user for permission checks
        self.tenant = tenant  # Tenant model instance for permission checks
        self._request_id = 0
        self._session_id = None
        self._initialized = False
        self._user_permissions = None  # Cached permissions

    def _next_request_id(self) -> int:
        """Generate next JSON-RPC request ID."""
        self._request_id += 1
        return self._request_id

    def _build_headers(self, tenant_id: Optional[str] = None) -> dict:
        """Build HTTP headers for MCP requests."""
        headers = {
            "Content-Type": "application/json",
            # MCP requires accepting both JSON and SSE
            "Accept": "application/json, text/event-stream",
            # Mark this request as coming from AI Agent for activity logging
            "X-AI-Agent-Request": "true",
        }
        if self.auth_header:
            headers["Authorization"] = self.auth_header
            # DEBUG: Log auth header presence (not the actual token for security)
            logger.info(f"[MCP DEBUG] Auth header present: {self.auth_header[:20]}...")
        else:
            logger.warning("[MCP DEBUG] No auth header provided to MCP client!")
        if tenant_id:
            headers["X-Tenant-ID"] = tenant_id
            logger.info(f"[MCP DEBUG] X-Tenant-ID header: {tenant_id}")
        if self._session_id:
            headers["Mcp-Session-Id"] = self._session_id

        logger.info(f"[MCP DEBUG] Request headers: {list(headers.keys())}")
        return headers

    def _parse_sse_response(self, response_text: str) -> dict:
        """
        Parse Server-Sent Events (SSE) response from MCP server.

        SSE format: "data: {json}\n\n"
        """
        logger.info(f"[MCP DEBUG] Parsing SSE response ({len(response_text)} chars)")
        logger.info(f"[MCP DEBUG] Raw SSE: {response_text[:500]}")

        result = {}
        for line in response_text.strip().split("\n"):
            line = line.strip()
            if line.startswith("data:"):
                json_str = line[5:].strip()  # Remove 'data:' prefix
                if json_str:
                    try:
                        result = json.loads(json_str)
                        logger.info(
                            f"[MCP DEBUG] Parsed SSE JSON keys: "
                            f"{result.keys() if isinstance(result, dict) else 'not a dict'}"
                        )
                        break  # Take the first data event
                    except json.JSONDecodeError as e:
                        logger.error(f"[MCP DEBUG] Failed to parse SSE data: {e}")
                        logger.error(f"[MCP DEBUG] Problematic JSON: {json_str[:500]}")
        return result

    def _make_request(
        self, method: str, params: Optional[dict] = None, tenant_id: Optional[str] = None, is_notification: bool = False
    ) -> dict:
        """
        Make a JSON-RPC request to the MCP server.

        MCP uses JSON-RPC 2.0 style messaging over SSE:
        - Request: {"jsonrpc": "2.0", "method": "...", "params": {...}, "id": n}
        - Notification: {"jsonrpc": "2.0", "method": "..."} (no id)
        - Response (SSE): data: {"jsonrpc": "2.0", "result": {...}, "id": n}
        """
        payload = {
            "jsonrpc": "2.0",
            "method": method,
        }

        if not is_notification:
            payload["id"] = self._next_request_id()

        if params:
            payload["params"] = params

        try:
            with httpx.Client(timeout=60.0) as client:
                response = client.post(
                    f"{self.mcp_server_url}/mcp",
                    json=payload,
                    headers=self._build_headers(tenant_id),
                )

            # Check for session ID in response headers
            if "mcp-session-id" in response.headers:
                self._session_id = response.headers["mcp-session-id"]
                logger.debug(f"Got MCP session ID: {self._session_id}")

            if response.status_code not in [200, 202]:
                logger.error(f"MCP request failed: {response.status_code} - {response.text[:500]}")
                return {"error": {"message": f"MCP server returned {response.status_code}: {response.text[:200]}"}}

            # Notifications don't have responses
            if is_notification:
                return {}

            # Handle empty response
            if not response.text.strip():
                return {}

            # Check if response is SSE format (text/event-stream)
            content_type = response.headers.get("content-type", "")
            result = self._parse_sse_response(response.text) if "text/event-stream" in content_type else response.json()

            if "error" in result:
                logger.error(f"MCP error: {result['error']}")
                return result

            return result.get("result", result)

        except httpx.ConnectError as e:
            logger.error(f"Cannot connect to MCP server: {e}")
            return {"error": {"message": "MCP server is unavailable"}}
        except Exception as e:
            logger.exception(f"MCP request error: {e}")
            return {"error": {"message": str(e)}}

    def initialize(self) -> bool:
        """
        Initialize the MCP session with the server.

        This must be called before any other operations.
        """
        if self._initialized:
            return True

        logger.info("Initializing MCP session...")

        # Step 1: Send initialize request
        init_result = self._make_request(
            "initialize",
            params={
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {},
                },
                "clientInfo": {
                    "name": "saas-boilerplate-cfo",
                    "version": "1.0.0",
                },
            },
        )

        if "error" in init_result:
            logger.error(f"MCP initialization failed: {init_result['error']}")
            return False

        logger.info(f"MCP server capabilities: {init_result.get('capabilities', {})}")

        # Step 2: Send initialized notification
        self._make_request("notifications/initialized", is_notification=True)

        self._initialized = True
        logger.info("MCP session initialized successfully")
        return True

    def list_tools(self, use_cache: bool = True) -> list:
        """
        List available tools from the MCP server.

        Tools are cached to avoid repeated requests.
        """
        if use_cache:
            cached_tools = cache.get(self.TOOLS_CACHE_KEY)
            if cached_tools:
                logger.debug("Using cached MCP tools")
                return cached_tools

        # Ensure session is initialized
        if not self.initialize():
            logger.error("Failed to initialize MCP session")
            return []

        logger.info("Fetching tools from MCP server")
        result = self._make_request("tools/list")

        if "error" in result:
            logger.error(f"Failed to list MCP tools: {result['error']}")
            return []

        tools = result.get("tools", [])

        if tools and use_cache:
            cache.set(self.TOOLS_CACHE_KEY, tools, self.TOOLS_CACHE_TTL)

        logger.info(f"Discovered {len(tools)} MCP tools")
        return tools

    def get_user_permissions(self) -> set:
        """Get cached user permissions for the tenant."""
        if self._user_permissions is not None:
            return self._user_permissions

        if self.user and self.tenant:
            self._user_permissions = get_user_permissions_for_tenant(self.user, self.tenant)
        else:
            self._user_permissions = set()

        return self._user_permissions

    def check_tool_access(self, tool_name: str) -> tuple[bool, str | None]:
        """
        Check if the current user can access a specific tool.

        Returns:
            (can_access, error_message)
        """
        if not self.user or not self.tenant:
            # No user/tenant context - allow (will be validated by GraphQL layer)
            return True, None

        return check_tool_permission(self.user, self.tenant, tool_name)

    def filter_tools_by_permission(self, tools: list) -> list:
        """
        Filter MCP tools to only include those the user has permission to use.
        This prevents the AI from even attempting to call tools the user can't access.
        """
        if not self.user or not self.tenant:
            return tools  # No filtering if no user context

        filtered = []
        for tool in tools:
            tool_name = tool.get("name", "")
            can_access, _ = self.check_tool_access(tool_name)
            if can_access:
                filtered.append(tool)
            else:
                logger.debug(f"Filtering out tool {tool_name} - user lacks permission")

        logger.info(f"Filtered tools: {len(filtered)} of {len(tools)} available for user")
        return filtered

    def call_tool(self, tool_name: str, arguments: dict, tenant_id: Optional[str] = None) -> dict:
        """
        Execute a tool via MCP protocol with permission check.

        The Apollo MCP Server will execute the corresponding GraphQL operation
        and return the result.

        Security: Checks user permissions before executing any tool.
        """
        # SECURITY: Check permission BEFORE executing the tool
        can_access, error_msg = self.check_tool_access(tool_name)
        if not can_access:
            logger.warning(f"Tool access denied: {tool_name} for user {self.user}")
            return {
                "error": error_msg,
                "permission_denied": True,
            }

        # Ensure session is initialized
        if not self._initialized and not self.initialize():
            return {"error": "Failed to initialize MCP session"}

        logger.info(f"[MCP DEBUG] Calling tool: {tool_name}")
        logger.info(f"[MCP DEBUG] Tool arguments: {json.dumps(arguments, default=str)}")

        result = self._make_request(
            "tools/call",
            params={
                "name": tool_name,
                "arguments": arguments,
            },
            tenant_id=tenant_id,
        )

        # Debug logging to see raw result
        logger.info(f"[MCP DEBUG] Tool raw result type: {type(result)}")
        logger.info(f"[MCP DEBUG] Tool raw result keys: {result.keys() if isinstance(result, dict) else 'not a dict'}")
        logger.info(f"[MCP DEBUG] Tool raw result: {json.dumps(result, default=str)[:2000]}")

        if "error" in result:
            error_msg = result["error"]
            if isinstance(error_msg, dict):
                error_msg = error_msg.get("message", str(error_msg))
            logger.error(f"[MCP DEBUG] Tool call FAILED: {error_msg}")
            return {"error": error_msg}

        # MCP tool results come in "content" array
        content = result.get("content", [])
        logger.info(f"[MCP DEBUG] Tool content array length: {len(content) if content else 0}")

        if content and isinstance(content, list):
            # Extract text content
            text_parts = []
            for idx, item in enumerate(content):
                logger.info(
                    f"[MCP DEBUG] Content item {idx}: type={type(item)}, keys="
                    f"{item.keys() if isinstance(item, dict) else 'N/A'}"
                )
                if isinstance(item, dict) and item.get("type") == "text":
                    text_content = item.get("text", "")
                    text_parts.append(text_content)
                    # Log tool response in detail
                    logger.info(f"[MCP DEBUG] Tool {tool_name} text response ({len(text_content)} chars):")
                    logger.info(f"[MCP DEBUG] {text_content[:1000]}")
                    if len(text_content) > 1000:
                        logger.info(f"[MCP DEBUG] ... (truncated, {len(text_content) - 1000} more chars)")
                elif isinstance(item, str):
                    text_parts.append(item)
                    logger.info(f"[MCP DEBUG] Tool {tool_name} string response: {item[:500]}")

            final_result = "\n".join(text_parts)
            logger.info(f"[MCP DEBUG] Tool {tool_name} final result length: {len(final_result)} chars")
            return {"result": final_result}

        logger.warning(f"[MCP DEBUG] Tool {tool_name} returned unexpected format: {result}")
        return {"result": json.dumps(result, default=str)}

    def convert_to_openai_tools(self, mcp_tools: list) -> list:
        """
        Convert MCP tool definitions to OpenAI function calling format.

        MCP Tool format:
        {
            "name": "tool_name",
            "description": "...",
            "inputSchema": { JSON Schema }
        }

        OpenAI Tool format:
        {
            "type": "function",
            "function": {
                "name": "tool_name",
                "description": "...",
                "parameters": { JSON Schema }
            }
        }
        """
        openai_tools = []

        for tool in mcp_tools:
            openai_tool = {
                "type": "function",
                "function": {
                    "name": tool.get("name", ""),
                    "description": tool.get("description", ""),
                    "parameters": tool.get(
                        "inputSchema",
                        {
                            "type": "object",
                            "properties": {},
                        },
                    ),
                },
            }
            openai_tools.append(openai_tool)

        return openai_tools


def decode_relay_id(relay_id: str) -> str:
    """
    Decode a GraphQL Relay ID to extract the actual model ID.

    GraphQL Relay IDs are base64-encoded strings in format: "TypeName:actualId"
    For example: VGVuYW50VHlwZTpsZDdiUjcy -> TenantType:ld7bR72 -> ld7bR72
    """
    try:
        # Try to decode as base64
        decoded = base64.b64decode(relay_id).decode("utf-8")
        # Split by colon and get the ID part
        if ":" in decoded:
            return decoded.split(":", 1)[1]
        return relay_id
    except Exception:
        # If decoding fails, assume it's already the raw ID
        return relay_id


# SaaS Navigator Persona System Prompt - Template with date placeholder
NAVIGATOR_SYSTEM_PROMPT_TEMPLATE = (
    """You are a helpful SaaS Navigator assistant. You help users understand and """
    """navigate their workspace, manage data, and find information.

## IMPORTANT: Current Date
Today's date is: {today_date}
Use this for any date-related queries.

## Your Persona
- **Role**: Friendly platform guide and data assistant
- **Expertise**: Helping users navigate the platform, manage items, view documents,
  check notifications, and search activity logs
- **Style**: Clear, concise, and helpful. Use markdown formatting (bullets, tables) for readability
- **Tone**: Approachable and supportive

## CRITICAL: How to Use Tools

### Tool Usage Rules
1. **tenantId is AUTOMATICALLY PROVIDED** - NEVER ask the user for tenantId. It is injected into tool calls.
2. **ALWAYS use tools** to get real data. Never make up or assume data.
3. **Call get_user_permissions first** when the user asks about capabilities or if a tool returns permission errors.

### Available Tools - Use These for Data:
- **get_user_permissions**: Call FIRST to discover what the user can access. Returns permissions and roles.
- **get_current_user**: Current user profile (email, name, tenants)
- **get_user_tenants**: Organizations/tenants the user belongs to
- **get_subscription_status**: Subscription plan and billing status (requires billing.view)
- **get_notifications**: User's notifications (unread count, list)
- **get_crud_demo_items**: List items in the tenant. Use for "list items", "what items do we have"
- **get_crud_demo_item**: Get a specific item by id (use id from get_crud_demo_items)
- **create_crud_demo_item**: Create new item. Input: input with tenantId, name
- **update_crud_demo_item**: Update item. Input: input with id, tenantId, name
- **delete_crud_demo_item**: Delete item. Input: input with id, tenantId. ALWAYS confirm before deleting!
- **get_documents**: List documents (files) uploaded by the user
- **get_action_logs**: Search activity/audit logs. Supports: entityType, actionType
  (CREATE/UPDATE/DELETE), actorEmail, fromDatetime, toDatetime, search

### DO NOT USE for data: search, introspect (schema exploration only)

### CRUD Demo Items - Create/Update/Delete:
- **Creating**: Required: name, tenantId (auto-injected). Example: "Add item called Q1 Planning"
- **Updating**: Use get_crud_demo_items to find id, then update_crud_demo_item with id, tenantId, name
- **Deleting**: ALWAYS confirm before deleting. Only execute after explicit user confirmation.

### Activity Logs - Search and Filter:
get_action_logs supports: entityType (e.g. CrudDemoItem, Tenant), actionType
(CREATE, UPDATE, DELETE), actorEmail, fromDatetime, toDatetime (ISO format),
search. Use when user asks about recent activity or audit trail.

### Communication Guidelines:
- **Language**: Respond in the SAME LANGUAGE the user writes in
- **Format**: Use markdown (bullets, tables) for readability
- **Data**: Never translate entity names or identifiers
- **Permissions**: If a tool fails with permission error, explain what access is needed

IMPORTANT: USE THE TOOLS to get real data. Never make up data. tenantId is automatic."""
)


def get_navigator_system_prompt() -> str:
    """Generate SaaS Navigator system prompt with current date."""
    from datetime import date

    today = date.today().strftime("%B %d, %Y")
    return NAVIGATOR_SYSTEM_PROMPT_TEMPLATE.format(today_date=today)


class EntityTracker:
    """
    Tracks entities (items) from tool results to enable automatic link injection in AI responses.
    """

    def __init__(self):
        self.items = {}

    def extract_from_tool_result(self, tool_name: str, result: str):
        """Extract entities from a tool result JSON."""
        try:
            data = json.loads(result) if isinstance(result, str) else result

            if tool_name in ("get_crud_demo_items", "GetCrudDemoItems"):
                self._extract_crud_items(data)
            elif tool_name in ("get_crud_demo_item", "GetCrudDemoItem"):
                self._extract_crud_item(data)

        except (json.JSONDecodeError, TypeError, KeyError) as e:
            logger.debug(f"Could not extract entities from {tool_name}: {e}")

    def _unwrap_graphql_data(self, data):
        if isinstance(data, dict) and "data" in data:
            return data["data"]
        return data

    def _extract_crud_items(self, data):
        data = self._unwrap_graphql_data(data)
        conn = data.get("allCrudDemoItems", {})
        edges = conn.get("edges", []) if isinstance(conn, dict) else []
        for edge in edges:
            node = edge.get("node", {})
            if node.get("id") and node.get("name"):
                self.items[node["name"]] = node["id"]

    def _extract_crud_item(self, data):
        data = self._unwrap_graphql_data(data)
        node = data.get("crudDemoItem", {})
        if node and node.get("id") and node.get("name"):
            self.items[node["name"]] = node["id"]

    def add_links_to_text(self, text: str) -> str:
        """Post-process text to add markdown links for known items."""
        import re

        for name, entity_id in sorted(self.items.items(), key=lambda x: len(x[0]), reverse=True):
            if f"[{name}](" in text:
                continue
            pattern = re.compile(r"(?<!\[)" + re.escape(name) + r"(?!\]\()", re.IGNORECASE)
            replacement = f"[{name}](item:{entity_id})"
            text = pattern.sub(replacement, text, count=1)

        return text


# Import centralized throttle classes for consistent rate limiting
try:
    from common.ratelimiting import MCPProxyThrottle, MCPChatThrottle as CentralizedMCPChatThrottle

    CENTRALIZED_THROTTLES = True
except ImportError:
    CENTRALIZED_THROTTLES = False
    MCPProxyThrottle = None
    CentralizedMCPChatThrottle = None


class MCPThrottle(UserRateThrottle):
    """
    Rate limiting for MCP requests.

    Deprecated: Use common.ratelimiting.MCPProxyThrottle instead.
    Kept for backwards compatibility.

    Rate is configurable via RATE_LIMITS['ai.mcp.proxy'] (default: 30/min)
    """

    scope = "mcp_proxy"

    def __init__(self):
        super().__init__()
        # Try to get rate from centralized config
        try:
            from common.ratelimiting import get_rate_limit
            from common.ratelimiting.constants import RateLimitCategory

            self.rate = get_rate_limit(RateLimitCategory.AI_MCP_PROXY)
        except ImportError:
            self.rate = "30/min"


class MCPChatThrottle(UserRateThrottle):
    """
    Rate limiting for AI chat.

    Deprecated: Use common.ratelimiting.MCPChatThrottle instead.
    Kept for backwards compatibility.

    Rate is configurable via RATE_LIMITS['ai.chat.message'] (default: 10/min)
    """

    scope = "mcp_chat"

    def __init__(self):
        super().__init__()
        # Try to get rate from centralized config
        try:
            from common.ratelimiting import get_rate_limit
            from common.ratelimiting.constants import RateLimitCategory

            self.rate = get_rate_limit(RateLimitCategory.AI_CHAT_MESSAGE)
        except ImportError:
            self.rate = "20/min"


class MCPProxyView(APIView):
    """
    Proxy MCP requests to Apollo MCP Server with tenant context.

    This view:
    1. Validates the user has access to the specified tenant
    2. Injects tenantId into all operation variables
    3. Forwards requests to the MCP Server
    4. Returns responses to the client

    Rate Limiting:
    - Configured via RATE_LIMITS['ai.mcp.proxy'] (default: 30 requests/min)
    - Uses tiered limits based on user subscription
    """

    permission_classes = [IsAuthenticated]
    # Use centralized throttle if available, otherwise fall back to local
    throttle_classes = [MCPProxyThrottle] if CENTRALIZED_THROTTLES and MCPProxyThrottle else [MCPThrottle]

    def get_mcp_server_url(self):
        """Get the MCP server URL from settings."""
        return getattr(settings, "MCP_SERVER_URL", "http://mcp-server:4000")

    def validate_tenant_access(self, user, tenant_id: str) -> bool:
        """Check if user has access to the specified tenant."""
        try:
            # Decode Relay ID if it's base64 encoded
            actual_tenant_id = decode_relay_id(tenant_id)
            membership = TenantMembership.objects.filter(
                user=user, tenant_id=actual_tenant_id, is_accepted=True
            ).exists()
            return membership
        except Exception as e:
            logger.error(f"Error validating tenant access: {e}")
            return False

    def inject_tenant_id(self, data: dict, tenant_id: str) -> dict:
        """Inject tenantId into variables if present."""
        if "variables" in data and isinstance(data["variables"], dict):
            data["variables"]["tenantId"] = tenant_id
        elif "variables" not in data:
            data["variables"] = {"tenantId": tenant_id}
        return data

    def post(self, request, tenant_id: str):
        """
        Proxy an MCP request to the Apollo MCP Server.

        The request body should contain the MCP message format.
        TenantId is automatically injected into all GraphQL variables.
        """
        # Validate tenant access
        if not self.validate_tenant_access(request.user, tenant_id):
            logger.warning(f"User {request.user.id} attempted to access tenant {tenant_id} without permission")
            return Response({"error": "Access denied to this tenant"}, status=status.HTTP_403_FORBIDDEN)

        # Get the request data
        try:
            mcp_request = request.data
        except Exception as e:
            logger.error(f"Failed to parse request body: {e}")
            return Response({"error": "Invalid request body"}, status=status.HTTP_400_BAD_REQUEST)

        # Inject tenant ID into variables
        mcp_request = self.inject_tenant_id(mcp_request, tenant_id)

        # Log the request (without sensitive data)
        logger.info(
            f"MCP request from user {request.user.id} for tenant {tenant_id}: "
            f"method={mcp_request.get('method', 'unknown')}"
        )

        # Forward to MCP Server
        mcp_url = f"{self.get_mcp_server_url()}/mcp"

        try:
            # Build headers - forward auth and add tenant context
            headers = {
                "Content-Type": "application/json",
                "X-Tenant-ID": tenant_id,
                "X-User-ID": str(request.user.id),
                # Mark this request as coming from AI Agent for activity logging
                "X-AI-Agent-Request": "true",
            }

            # Forward Authorization header if present
            auth_header = request.headers.get("Authorization")
            if auth_header:
                headers["Authorization"] = auth_header

            # Make the request to MCP server
            with httpx.Client(timeout=60.0) as client:
                response = client.post(
                    mcp_url,
                    json=mcp_request,
                    headers=headers,
                )

            # Log response status
            logger.info(f"MCP response for user {request.user.id}: status={response.status_code}")

            # Return the response
            return Response(response.json(), status=response.status_code, content_type="application/json")

        except httpx.TimeoutException:
            logger.error(f"MCP server request timed out for tenant {tenant_id}")
            return Response(
                {"error": "AI assistant request timed out. Please try again."}, status=status.HTTP_504_GATEWAY_TIMEOUT
            )
        except httpx.ConnectError:
            logger.error(f"Failed to connect to MCP server at {mcp_url}")
            return Response(
                {"error": "AI assistant service is unavailable. Please try again later."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except Exception as e:
            logger.exception(f"Unexpected error proxying to MCP server: {e}")
            return Response(
                {"error": "An unexpected error occurred. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class MCPChatView(APIView):
    """
    AI CFO Chat endpoint with full Apollo MCP integration and SSE streaming.

    Streaming Events (SSE):
    - status: Current processing status
    - tool_start: Tool execution started
    - tool_complete: Tool execution completed
    - content: Response content (streamed)
    - done: Processing complete with metadata
    - error: Error occurred
    """

    permission_classes = [IsAuthenticated]
    throttle_classes = [MCPChatThrottle]

    def get_mcp_server_url(self):
        """Get the MCP server URL from settings."""
        return getattr(settings, "MCP_SERVER_URL", "http://mcp-server:4000")

    def get_openai_client(self):
        """Get OpenAI client instance."""
        api_key = getattr(settings, "OPENAI_API_KEY", None)
        if not api_key:
            return None
        return OpenAI(api_key=api_key)

    def validate_tenant_access(self, user, tenant_id: str) -> bool:
        """Check if user has access to the specified tenant."""
        try:
            actual_tenant_id = decode_relay_id(tenant_id)
            membership = TenantMembership.objects.filter(
                user=user, tenant_id=actual_tenant_id, is_accepted=True
            ).exists()
            return membership
        except Exception as e:
            logger.error(f"Error validating tenant access: {e}")
            return False

    def _sse_event(self, event_type: str, data: dict) -> str:
        """Format an SSE event."""
        return f"event: {event_type}\ndata: {json.dumps(data)}\n\n"

    def _stream_chat_response(
        self,
        openai_client,
        mcp_client,
        message: str,
        conversation_history: list,
        tenant_id: str,
    ) -> Generator[str, None, None]:
        """Generator that yields SSE events for the chat response."""
        tools_used = []
        entity_tracker = EntityTracker()  # Track entities for link injection

        try:
            # Status: Initializing
            yield self._sse_event("status", {"message": "Connecting to data sources..."})

            # Discover available tools from MCP server
            mcp_tools = mcp_client.list_tools()

            if not mcp_tools:
                logger.warning("No tools available from MCP server")
                yield self._sse_event("status", {"message": "Limited data access - using general knowledge"})
            else:
                # SECURITY: Filter tools based on user's RBAC permissions
                # This ensures the AI only sees tools the user can actually use
                original_count = len(mcp_tools)
                mcp_tools = mcp_client.filter_tools_by_permission(mcp_tools)

                if len(mcp_tools) < original_count:
                    logger.info(f"Filtered {original_count - len(mcp_tools)} tools due to missing permissions")
                    yield self._sse_event(
                        "status",
                        {"message": f"Connected to {len(mcp_tools)} data sources (access limited by your role)"},
                    )
                else:
                    yield self._sse_event("status", {"message": f"Connected to {len(mcp_tools)} data sources"})

            # Convert MCP tools to OpenAI format (only permitted tools)
            openai_tools = mcp_client.convert_to_openai_tools(mcp_tools) if mcp_tools else None
            logger.info(f"Discovered {len(mcp_tools) if mcp_tools else 0} permitted tools from MCP server")

            # Build messages with conversation history
            messages = [{"role": "system", "content": get_navigator_system_prompt()}]

            for hist_msg in conversation_history[-10:]:
                messages.append({"role": hist_msg.get("role", "user"), "content": hist_msg.get("content", "")})

            messages.append({"role": "user", "content": message})

            yield self._sse_event("status", {"message": "Analyzing your question..."})

            # Initial call to OpenAI
            completion_kwargs = {
                "model": "gpt-4o",
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 2000,
            }

            if openai_tools:
                completion_kwargs["tools"] = openai_tools
                completion_kwargs["tool_choice"] = "auto"

            response = openai_client.chat.completions.create(**completion_kwargs)
            assistant_message = response.choices[0].message

            # Handle tool calls
            max_iterations = 8
            iteration = 0

            while assistant_message.tool_calls and iteration < max_iterations:
                iteration += 1

                # Add assistant's response to messages
                assistant_msg_dict = {
                    "role": "assistant",
                    "content": assistant_message.content,
                    "tool_calls": [
                        {
                            "id": tc.id,
                            "type": tc.type,
                            "function": {
                                "name": tc.function.name,
                                "arguments": tc.function.arguments,
                            },
                        }
                        for tc in assistant_message.tool_calls
                    ],
                }
                messages.append(assistant_msg_dict)

                # Execute each tool call
                for tool_call in assistant_message.tool_calls:
                    tool_name = tool_call.function.name
                    display_name = get_tool_display_name(tool_name)

                    try:
                        arguments = json.loads(tool_call.function.arguments)
                    except json.JSONDecodeError:
                        arguments = {}

                    # Inject tenantId - handle both queries and mutations
                    # For queries: tenantId is a top-level variable
                    # For mutations: tenantId is inside the "input" object
                    is_mutation = tool_name.startswith(("create_", "update_", "delete_"))

                    if isinstance(arguments, dict):
                        if "input" in arguments and isinstance(arguments.get("input"), dict):
                            # Mutation with input object - inject tenantId inside input
                            arguments["input"]["tenantId"] = tenant_id
                        elif is_mutation and "input" not in arguments:
                            # Mutation without input wrapper - wrap the arguments
                            arguments = {"input": {**arguments, "tenantId": tenant_id}}
                        else:
                            # Query or other case - inject at top level
                            arguments["tenantId"] = tenant_id

                    # Notify frontend about tool execution
                    yield self._sse_event(
                        "tool_start",
                        {
                            "tool": tool_name,
                            "display_name": display_name,
                        },
                    )

                    logger.info(f"Executing MCP tool: {tool_name} for tenant {tenant_id}")
                    tools_used.append({"name": tool_name, "display_name": display_name})

                    # Execute via MCP (includes permission check)
                    tool_result = mcp_client.call_tool(tool_name, arguments, tenant_id)

                    # Format result
                    if "error" in tool_result:
                        # Check if this is a permission denied error
                        is_permission_denied = tool_result.get("permission_denied", False)
                        result_content = json.dumps(
                            {"error": tool_result["error"], "permission_denied": is_permission_denied}
                        )
                        yield self._sse_event(
                            "tool_complete",
                            {
                                "tool": tool_name,
                                "display_name": display_name,
                                "success": False,
                                "permission_denied": is_permission_denied,
                            },
                        )
                        # Log permission denials specifically
                        if is_permission_denied:
                            logger.warning(f"Permission denied for tool {tool_name}: {tool_result['error']}")
                    else:
                        result_content = tool_result.get("result", json.dumps(tool_result))
                        has_data = bool(result_content and result_content not in {"{}", "null"})

                        # Extract entities from tool results for link injection
                        if has_data:
                            entity_tracker.extract_from_tool_result(tool_name, result_content)

                        yield self._sse_event(
                            "tool_complete",
                            {
                                "tool": tool_name,
                                "display_name": display_name,
                                "success": True,
                                "has_data": has_data,
                            },
                        )

                    messages.append(
                        {
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": result_content,
                        }
                    )

                yield self._sse_event("status", {"message": "Processing data..."})

                # Get next response
                response = openai_client.chat.completions.create(**completion_kwargs)
                assistant_message = response.choices[0].message

            # Stream final response word-by-word for typewriter effect
            final_response = assistant_message.content

            if final_response:
                yield self._sse_event("status", {"message": "Generating analysis..."})

                # Post-process to add entity links
                final_response = entity_tracker.add_links_to_text(final_response)

                # Stream word-by-word for natural typing effect
                import re

                # Split into words while preserving whitespace and punctuation
                tokens = re.findall(r"\S+|\s+", final_response)

                for token in tokens:
                    yield self._sse_event("content", {"text": token})
                    # Vary delay based on token type for natural feel
                    if token.strip() in ".!?":
                        time.sleep(0.15)  # Pause at sentence end
                    elif token.strip() in ",;:":
                        time.sleep(0.08)  # Brief pause at punctuation
                    elif token.strip():
                        time.sleep(0.03)  # Normal word delay
                    # No delay for whitespace
            else:
                yield self._sse_event(
                    "content",
                    {
                        "text": (
                            "I apologize, but I couldn't generate a complete analysis. "
                            "Please try rephrasing your question."
                        )
                    },
                )

            # Done event
            unique_tools = {t["name"]: t for t in tools_used}.values()
            yield self._sse_event(
                "done",
                {
                    "tools_used": list(unique_tools),
                    "iterations": iteration,
                },
            )

        except Exception as e:
            logger.exception(f"Error in AI CFO chat stream: {e}")
            yield self._sse_event(
                "error",
                {
                    "message": "An error occurred while processing your request. Please try again.",
                },
            )

    def post(self, request, tenant_id: str):
        """Send a chat message to the AI CFO assistant (SSE streaming)."""
        # Check OpenAI configuration
        openai_client = self.get_openai_client()
        if not openai_client:
            return Response({"error": "AI Assistant is not configured."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # Validate tenant access
        if not self.validate_tenant_access(request.user, tenant_id):
            return Response({"error": "Access denied to this tenant"}, status=status.HTTP_403_FORBIDDEN)

        message = request.data.get("message")
        conversation_history = request.data.get("history", [])

        if not message:
            return Response({"error": "Message is required"}, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f"AI CFO chat from user {request.user.id} for tenant {tenant_id}")

        # Get tenant object for permission checks
        actual_tenant_id = decode_relay_id(tenant_id)
        tenant = Tenant.objects.filter(id=actual_tenant_id).first()

        # Get auth token - check header first, then fall back to cookie
        auth_header = request.headers.get("Authorization", "")

        if not auth_header:
            # Try to get token from cookie (httpOnly cookie-based auth)
            access_token = request.COOKIES.get(settings.ACCESS_TOKEN_COOKIE)
            if access_token:
                auth_header = f"Bearer {access_token}"
                logger.info(f"[MCP DEBUG] Got token from cookie: {access_token[:20]}...")
            else:
                logger.warning("[MCP DEBUG] No auth token in header or cookie!")
        else:
            logger.info(f"[MCP DEBUG] Got token from header: {auth_header[:30]}...")

        # Initialize MCP client with user and tenant for permission checks
        mcp_client = MCPClient(
            mcp_server_url=self.get_mcp_server_url(),
            auth_header=auth_header,
            user=request.user,  # For RBAC permission checks
            tenant=tenant,  # For RBAC permission checks
        )

        # Log user's permission set for debugging
        if tenant:
            user_permissions = mcp_client.get_user_permissions()
            logger.info(f"User {request.user.id} has {len(user_permissions)} permissions for tenant {tenant_id}")

        # Return streaming response
        response = StreamingHttpResponse(
            self._stream_chat_response(
                openai_client=openai_client,
                mcp_client=mcp_client,
                message=message,
                conversation_history=conversation_history,
                tenant_id=tenant_id,
            ),
            content_type="text/event-stream",
        )
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response


class MCPHealthView(APIView):
    """
    Health check endpoint for MCP integration.
    Returns the status of the MCP server connection.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Check if the MCP server is reachable."""
        mcp_url = getattr(settings, "MCP_SERVER_URL", "")

        # Check if MCP is configured
        if not mcp_url:
            return Response(
                {
                    "status": "not_configured",
                    "mcp_server": "not_configured",
                    "message": "MCP_SERVER_URL is not set. AI Assistant features are disabled.",
                }
            )

        try:
            with httpx.Client(timeout=5.0) as client:
                response = client.get(f"{mcp_url}/health")

            if response.status_code == 200:
                return Response(
                    {
                        "status": "healthy",
                        "mcp_server": "connected",
                        "url": mcp_url,
                    }
                )
            else:
                return Response(
                    {
                        "status": "degraded",
                        "mcp_server": "unhealthy",
                        "url": mcp_url,
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

        except Exception as e:
            logger.error(f"MCP health check failed: {e}")
            return Response(
                {
                    "status": "unhealthy",
                    "mcp_server": "unreachable",
                    "url": mcp_url,
                    "error": str(e),
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
