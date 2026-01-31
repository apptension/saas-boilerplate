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
    if '_' in tool_name and tool_name == tool_name.lower():
        return tool_name

    # Convert PascalCase/camelCase to snake_case
    # Insert underscore before uppercase letters and convert to lowercase
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', tool_name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()


# ============================================================================
# Tool Permission Mapping - Maps MCP tool names to required permissions
# ============================================================================

TOOL_PERMISSIONS = {
    # Access Control & User Tools - no tenant permission required (user's own data)
    "get_user_permissions": None,
    "get_current_user": None,
    "get_user_tenants": None,
    "get_notifications": None,
    # Documents - requires feature permission
    "get_documents": "features.documents.view",
    # Core Data Tools - require tenant-scoped permissions
    "get_projects": "management.projects.view",
    "get_project_details": "management.projects.view",
    "search_projects": "management.projects.view",
    "get_clients": "management.clients.view",
    "get_client_details": "management.clients.view",
    "get_people": "management.people.view",
    "get_person_details": "management.people.view",
    "get_person_rates": "management.people.rates.view",
    "get_assignments": "management.financial.view",
    # Financial Tools
    "get_dashboard_overview": "management.financial.view",
    "get_revenue_lines": "management.financial.view",
    "get_cost_lines": "management.financial.view",
    "get_financial_types": "management.financial.view",
    "get_project_profitability": "management.financial.view",
    "get_profitability_summary": "management.financial.view",
    "get_monthly_breakdown": "management.financial.view",
    "get_project_breakdown": "management.financial.view",
    "get_currency_breakdown": "management.financial.view",
    "get_data_quality_issues": "management.financial.view",
    # FX Rates
    "get_fx_rates": "management.fxrates.view",
    # Forecasting Tools
    "get_forecast_insights": "management.analytics.view",
    "get_advanced_forecast": "management.analytics.view",
    "get_forecast_scenarios": "management.analytics.view",
    "get_forecast_backtest": "management.analytics.view",
    "get_cost_forecast": "management.analytics.view",
    # Invoice Tools
    "get_invoices": "management.invoices.view",
    "get_invoice_details": "management.invoices.view",
    "get_invoice_requests": "management.invoices.view",
    "get_pending_invoice_count": "management.invoices.view",
    # Installments/Iterations & Timesheet Tools
    "get_iterations": "management.financial.view",
    "get_iteration_details": "management.financial.view",
    "get_timesheet_entries": "management.timesheets.view",
    # Pipeline/Deals Tools
    "get_deals": "management.pipeline.view",
    # Billing/Subscription Tools
    "get_subscription_status": "billing.view",
    # ============ MUTATION TOOLS (Create/Update/Delete) ============
    # Project Mutations
    "create_project": "management.projects.edit",
    "update_project": "management.projects.edit",
    "delete_project": "management.projects.edit",
    # Client Mutations
    "create_client": "management.clients.edit",
    "update_client": "management.clients.edit",
    "delete_client": "management.clients.edit",
    # Person/Team Member Mutations
    "create_person": "management.people.edit",
    "update_person": "management.people.edit",
    "delete_person": "management.people.edit",
    # Installment/Iteration Mutations
    "create_iteration": "management.financial.edit",
    "update_iteration": "management.financial.edit",
    "delete_iteration": "management.financial.edit",
    # Revenue Line Mutations
    "create_revenue_line": "management.financial.edit",
    "update_revenue_line": "management.financial.edit",
    "delete_revenue_line": "management.financial.edit",
    # Cost Line Mutations
    "create_cost_line": "management.financial.edit",
    "update_cost_line": "management.financial.edit",
    "delete_cost_line": "management.financial.edit",
    # Invoice Mutations
    "create_invoice": "management.invoices.edit",
    "update_invoice": "management.invoices.edit",
    "delete_invoice": "management.invoices.edit",
    # Deal/Pipeline Mutations
    "create_deal": "management.pipeline.edit",
    "update_deal": "management.pipeline.edit",
    "delete_deal": "management.pipeline.edit",
    # ============ NEW TOOLS (2025+) ============
    # Role Management
    "get_roles": "management.projects.view",
    "get_role_details": "management.projects.view",
    "create_role": "management.projects.edit",
    "update_role": "management.projects.edit",
    "delete_role": "management.projects.edit",
    # Client Billing Addresses
    "get_client_billing_addresses": "management.clients.view",
    "create_billing_address": "management.clients.edit",
    "update_billing_address": "management.clients.edit",
    "delete_billing_address": "management.clients.edit",
    "set_default_billing_address": "management.clients.edit",
    # Invoice Requests
    "get_invoice_request_details": "management.invoices.view",
    "create_invoice_request": "management.invoices.edit",
    "process_invoice_request": "management.invoices.edit",
    "update_invoice_request_status": "management.invoices.edit",
    "delete_invoice_request": "management.invoices.edit",
    "send_invoice_request_reminder": "management.invoices.edit",
    # Invoice Request Comments
    "create_invoice_request_comment": "management.invoices.edit",
    "delete_invoice_request_comment": "management.invoices.edit",
    # Invoice Files
    "add_invoice_file": "management.invoices.edit",
    "delete_invoice_file": "management.invoices.edit",
    # Iteration Assignments
    "get_iteration_assignments": "management.financial.view",
    "create_assignment": "management.financial.edit",
    "update_assignment": "management.financial.edit",
    "delete_assignment": "management.financial.edit",
    "reassign_assignment": "management.financial.edit",
    # Time Entries
    "create_time_entry": "management.timesheets.edit",
    "update_time_entry": "management.timesheets.edit",
    "delete_time_entry": "management.timesheets.edit",
    "bulk_update_time_entries": "management.timesheets.edit",
    # FX Rate Mutations
    "create_fx_rate": "management.fxrates.edit",
    "update_fx_rate": "management.fxrates.edit",
    "delete_fx_rate": "management.fxrates.edit",
    # Organization Settings
    "get_organization_settings": "management.financial.view",
    "update_organization_settings": "management.financial.edit",
    # Project Shares
    "get_project_shares": "management.projects.view",
    "create_project_share": "management.projects.edit",
    "update_project_share": "management.projects.edit",
    "delete_project_share": "management.projects.edit",
    # Financial Type Buckets
    "get_financial_type_buckets": "management.financial.view",
    # Introspection tools (allow for AI to understand schema)
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
        # View permissions
        "management.financial.view": "financial data (revenue, costs, profitability)",
        "management.analytics.view": "analytics and forecasting",
        "management.projects.view": "project information",
        "management.clients.view": "client information",
        "management.people.view": "team member information",
        "management.people.rates.view": "team member rates (cost and billable rates)",
        "management.invoices.view": "invoice data",
        "management.pipeline.view": "sales pipeline/deals",
        "management.fxrates.view": "foreign exchange rates",
        "billing.view": "billing and subscription information",
        # Edit permissions (for mutations)
        "management.projects.edit": "create/edit/delete projects",
        "management.clients.edit": "create/edit/delete clients",
        "management.people.edit": "create/edit/delete team members",
        "management.people.rates.edit": "create/edit/delete team member rates",
        "management.financial.edit": "create/edit/delete financial data (installments, revenue, costs)",
        "management.invoices.edit": "create/edit/delete invoices",
        "management.pipeline.edit": "create/edit/delete deals/pipeline",
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
    # Schema introspection
    "introspect": "Analyzing data schema",
    "search": "Searching company data",
    # Access Control & User Data
    "get_user_permissions": "Checking your access permissions",
    "get_current_user": "Loading your profile",
    "get_user_tenants": "Loading your organizations",
    "get_notifications": "Loading your notifications",
    "get_documents": "Loading documents",
    # Dashboard & Overview
    "get_dashboard_overview": "Loading financial dashboard",
    "get_profitability_summary": "Analyzing overall profitability",
    "get_monthly_breakdown": "Loading monthly breakdown",
    "get_currency_breakdown": "Analyzing currency exposure",
    "get_data_quality_issues": "Checking data quality",
    # Projects
    "get_projects": "Fetching projects list",
    "get_project_details": "Loading project details",
    "search_projects": "Searching projects",
    "get_project_profitability": "Analyzing project profitability",
    "get_project_breakdown": "Loading project financial breakdown",
    # People & Team
    "get_people": "Loading team members",
    "get_person_details": "Fetching person details",
    "get_person_rates": "Loading person rates",
    "get_assignments": "Loading work assignments",
    # Clients
    "get_clients": "Loading clients list",
    "get_client_details": "Fetching client details",
    # Financial Data
    "get_revenue_lines": "Loading revenue data",
    "get_cost_lines": "Loading cost data",
    "get_financial_types": "Loading financial types",
    "get_fx_rates": "Loading exchange rates",
    # Invoices
    "get_invoices": "Loading invoices",
    "get_invoice_details": "Fetching invoice details",
    "get_invoice_requests": "Loading invoice requests",
    "get_pending_invoice_count": "Checking pending invoices",
    # Iterations/Installments & Timesheets
    "get_iterations": "Loading project installments",
    "get_iteration_details": "Analyzing installment details",
    "get_timesheet_entries": "Loading timesheet data",
    # Forecasting (CFO Suite)
    "get_forecast_insights": "Generating forecast insights",
    "get_advanced_forecast": "Running advanced forecasting",
    "get_forecast_scenarios": "Analyzing forecast scenarios",
    "get_forecast_backtest": "Validating forecast accuracy",
    "get_cost_forecast": "Forecasting costs",
    # Pipeline & Deals
    "get_deals": "Loading sales pipeline",
    # Billing & Subscription
    "get_subscription_status": "Checking subscription status",
    # ============ MUTATION DISPLAY NAMES ============
    # Project Mutations
    "create_project": "Creating new project",
    "update_project": "Updating project",
    "delete_project": "Deleting project",
    # Client Mutations
    "create_client": "Creating new client",
    "update_client": "Updating client",
    "delete_client": "Deleting client",
    # Person/Team Member Mutations
    "create_person": "Adding team member",
    "update_person": "Updating team member",
    "delete_person": "Removing team member",
    # Installment/Iteration Mutations
    "create_iteration": "Creating new installment",
    "update_iteration": "Updating installment",
    "delete_iteration": "Deleting installment",
    # Revenue Line Mutations
    "create_revenue_line": "Creating revenue line",
    "update_revenue_line": "Updating revenue line",
    "delete_revenue_line": "Deleting revenue line",
    # Cost Line Mutations
    "create_cost_line": "Creating cost line",
    "update_cost_line": "Updating cost line",
    "delete_cost_line": "Deleting cost line",
    # Invoice Mutations
    "create_invoice": "Creating invoice",
    "update_invoice": "Updating invoice",
    "delete_invoice": "Deleting invoice",
    # Deal/Pipeline Mutations
    "create_deal": "Creating deal",
    "update_deal": "Updating deal",
    "delete_deal": "Deleting deal",
    # GraphQL generic (fallback)
    "query": "Executing data query",
    "mutation": "Updating data",
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
    # Fallback: convert snake_case to readable format
    return normalized.replace('_', ' ').title() + "..."


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
        self.mcp_server_url = mcp_server_url.rstrip('/')
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
        for line in response_text.strip().split('\n'):
            line = line.strip()
            if line.startswith('data:'):
                json_str = line[5:].strip()  # Remove 'data:' prefix
                if json_str:
                    try:
                        result = json.loads(json_str)
                        logger.info(
                            f"[MCP DEBUG] Parsed SSE JSON keys: {result.keys() if isinstance(result, dict) else 'not a dict'}"
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
                    f"[MCP DEBUG] Content item {idx}: type={type(item)}, keys={item.keys() if isinstance(item, dict) else 'N/A'}"
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
        decoded = base64.b64decode(relay_id).decode('utf-8')
        # Split by colon and get the ID part
        if ':' in decoded:
            return decoded.split(':', 1)[1]
        return relay_id
    except Exception:
        # If decoding fails, assume it's already the raw ID
        return relay_id


# CFO Persona System Prompt - Template with date placeholder
CFO_SYSTEM_PROMPT_TEMPLATE = """You are a sophisticated Chief Financial Officer (CFO) of an IT Services Company with extensive experience in technology consulting, software development agencies, and digital transformation services.

## IMPORTANT: Current Date
Today's date is: {today_date}
Use this as reference for all date-related queries. When user asks about "current" financial health, use dates relative to today. When you are not asked about the date period - use it as a reference point. 

## ⚠️ CRITICAL: You MUST Use top notch professionally styled Markdown for OUTPUT! ⚠️
## ⚠️ CRITICAL: You MUST Use Markdown Links for Entities ⚠️

You are outputting to a Markdown renderer. When listing projects, clients, people, or invoices, you MUST create clickable markdown links.

**ALWAYS write project/client/person/invoice names as markdown links like this:**
- `[Project Name](project:PROJECT_ID)` - for projects
- `[Client Name](client:CLIENT_ID)` - for clients
- `[Person Name](person:PERSON_ID)` - for people
- `[Invoice #X](invoice:INVOICE_ID)` - for invoices

**Example of CORRECT output (YOU MUST DO THIS):**
```
1. [AWESOME PROJECT!](project:UHJvamVjdFR5cGU6MQ==)
   - Client: [Admiral](client:Q2xpZW50VHlwZTox)
   - Status: Planned
```

**Example of WRONG output (NEVER DO THIS):**
```
1. **AWESOME PROJECT!**
   - Client: Admiral
   - Status: Planned
```

The ID comes from the `id` field (or `projectId`/`clientId` for profitability data) in the tool response. It looks like `UHJvamVjdFR5cGU6MQ==`.

## Your Persona
- **Role**: CFO with 15+ years of experience in IT services industry
- **Expertise**: Financial planning, project profitability analysis, resource allocation, revenue forecasting, cost optimization, and strategic financial decision-making
- **Style**: Professional, insightful, and data-driven. You communicate complex financial concepts clearly and provide actionable recommendations.
- **Tone**: Confident but approachable. You balance thoroughness with conciseness.

## CRITICAL: How to Use Tools

### Tool Usage Rules
1. **tenantId is AUTOMATICALLY PROVIDED** - NEVER ask the user for tenantId. It is injected automatically into every tool call.
2. **For date parameters**: Use reasonable defaults like the current year (fromDate: "2024-01-01", toDate: "2024-12-31") or last 12 months
3. **ALWAYS use tools** to get real data. Never make up financial numbers.

### Available Tools - Use These for Data:
- **GetDashboardOverview**: START HERE for financial health questions. Gets revenue, costs, profit, margins. Returns pre-calculated totals in base currency.
- **GetMonthlyBreakdown**: Get detailed breakdown for a specific month. Returns individual lines WITH correct revenueTotal/costTotal already calculated. USE THIS for "best/worst month" questions!
- **GetProjects**: List all projects with their status. Supports `searchText` for fuzzy search.
- **GetProjectDetails**: Deep dive into a specific project (needs projectId)
- **GetProjectProfitability**: Profitability analysis for projects
- **GetIterations**: Get project installments/iterations/sprints with assignments. Use when user asks about "installments".
- **GetIterationDetails**: Deep dive into installment/iteration time entries and costs. Use when user asks about a specific "installment".
- **GetIterationAssignments**: List team member assignments for an iteration with hours and rates.
- **GetTimesheetEntries**: Time tracking data for T&M billing analysis
- **GetClients**: List all clients. Supports `searchText` for fuzzy search.
- **GetClientDetails**: Details about a specific client (now includes billing addresses)
- **GetClientBillingAddresses**: Get all billing addresses for a client
- **GetPeople**: Team members and their info. Supports `searchText` for fuzzy search.
- **GetRoles**: List all billable roles with default rates.
- **GetRoleDetails**: Details about a specific role.
- **GetInvoices**: Invoice data
- **GetInvoiceRequests**: List pending invoice requests with billing addresses and assignment info.
- **GetInvoiceRequestDetails**: Full details of an invoice request with comments.
- **GetProfitabilitySummary**: Overall profitability metrics
- **GetForecastInsights**: Revenue forecasting data
- **GetForecastScenarios**: Best/worst case scenario analysis
- **GetCostForecast**: Cost forecasting
- **GetCostLines**: Detailed cost breakdown. Use amountBase for calculations!
- **GetRevenueLines**: Detailed revenue breakdown. Use amountBase for calculations, NOT amountOriginal!
- **GetFinancialTypes**: Get available revenue source types (kind: "REVENUE") and cost categories (kind: "COST"). Use before creating/updating revenue/cost lines to know valid type codes.
- **GetOrganizationSettings**: Get org settings like base currency, fiscal year, overhead cap.
- **GetFxRates**: Get exchange rates for currency conversion.
- **GetProjectShares**: List external share links for a project.

### ⚠️ Tool Selection for Financial Totals:
- For "best month" / "worst month" / "total revenue" questions: Use GetDashboardOverview or GetMonthlyBreakdown
- For "show me all revenue lines": Use GetRevenueLines but DON'T manually sum amountOriginal values!
- The `revenueTotal` from GetMonthlyBreakdown is the authoritative total - it handles currency conversion correctly

### ⚠️ Understanding Scenario Thresholds (CRITICAL for accurate data!):
GetDashboardOverview returns MULTIPLE scenarios (default: 100%, 90%, 80%, 70% probability thresholds).

**How scenario thresholds work:**
- **Actual revenue** (INVOICE, TIMESHEET_ACTUAL, ITERATION_COMPLETE) is ALWAYS included regardless of threshold
- **Forecast revenue** (DEAL_FORECAST, TIMESHEET_PLANNED, RETAINER, MANUAL) is only included if probability >= threshold

**Example:**
- A revenue line with sourceType="DEAL_FORECAST" and probability=80%:
  - Shows in 80% and 70% scenarios ✓
  - Does NOT show in 100% or 90% scenarios ✗

**When user asks for "all revenue" or "total revenue":**
1. Check the 70% scenario (lowest threshold) to see the most inclusive total
2. Or use GetRevenueLines/GetMonthlyBreakdown which show ALL lines regardless of probability
3. Explain to user that different scenarios show different probability-weighted totals

**To get ALL revenue regardless of probability:**
- Use GetMonthlyBreakdown with `scenarioThreshold: 0` (includes everything)
- Or use GetRevenueLines which returns all lines (but you must use amountBase for correct totals)

### Entity Resolution Tools (Use When User Mentions Specific Entities):
- **resolve_project**: Find a project by name/code with fuzzy matching
- **resolve_client**: Find a client by name with fuzzy matching
- **resolve_person**: Find a team member by name with fuzzy matching

### DISAMBIGUATION WORKFLOW (CRITICAL):
When user mentions a specific project, client, or person by name:
1. Use the appropriate resolve_* tool with `searchText` parameter
2. If **exactly 1 result**: Proceed with that entity
3. If **multiple results**: ALWAYS present ALL candidates to the user and ask which one they meant
   - Example: "I found 3 projects matching 'Alpha': 1) [Alpha-Main](project:xxx) (Active), 2) [Alpha-v2](project:yyy) (Completed), 3) [Project Alpha](project:zzz) (Active). Which one did you mean?"
4. If **0 results**: Inform the user and ask for the correct name

### DO NOT USE these for data questions:
- `search` - Only for schema exploration
- `introspect` - Only for schema exploration

## Your Capabilities
You have access to real-time company data including:
- Project financials (budgets, actuals, margins)
- Installments/Iterations with time & material and fixed-price billing
- Timesheet data for resource tracking
- Client relationships and revenue
- Team utilization and costs
- Invoicing and cash flow
- Revenue forecasting and pipeline

## ⚠️ CRITICAL: Multi-Currency Financial Calculations ⚠️

The system supports multiple currencies. When calculating totals, you MUST follow these rules:

### Revenue/Cost Line Data Structure:
Each revenue or cost line has TWO amounts:
- **amountOriginal / currencyOriginal**: The amount in its original currency (e.g., 10,000 EUR)
- **amountBase / baseCurrency**: The amount converted to the organization's base currency (e.g., 43,500 PLN)

### Calculation Rules:
1. **NEVER sum amountOriginal values directly** - they may be in different currencies!
2. **ALWAYS use amountBase for calculations** when summing multiple lines
3. **Use pre-calculated totals from GetMonthlyBreakdown or GetDashboardOverview** - these are already correct!

### Displaying Data:
When showing individual revenue/cost lines to users:
1. Show both the original amount AND the base currency conversion if currencies differ
2. Format: "46,198.80 PLN" (when original = base) OR "10,000 EUR (43,500 PLN)" (when converted)
3. Clearly state the base currency when showing totals: "Total revenue: 327,742.16 PLN (base currency)"

### Finding Best/Worst Months:
- Use **GetMonthlyBreakdown** with specific months to get accurate totals
- Or use **GetDashboardOverview** to get monthly data across a date range
- The `revenueTotal` field from these tools is already calculated correctly

### Example - Correct vs Incorrect:
❌ WRONG: Sum amountOriginal: 10,000 EUR + 50,000 PLN = 60,000 (meaningless!)
✅ CORRECT: Sum amountBase: 43,500 PLN + 50,000 PLN = 93,500 PLN

When user asks "what's my best revenue month?":
1. Use GetDashboardOverview for the year range
2. Look at monthlyData[].revenueTotal (already in base currency)
3. Find the maximum value
4. Then use GetRevenueLines to show the individual items for that month

## Where to Find IDs for Links

When creating links, use these fields from tool responses:
- `get_projects`: use the `id` field
- `get_project_profitability`: use `projectId` for projects, `clientId` for clients
- `get_clients`: use the `id` field  
- `get_people`: use the `id` field
- `get_invoices`: use the `id` field

If you don't have the ID available, you can still mention the entity name without a link.

## Communication Guidelines

### Language Adaptation
- **CRITICAL**: Always respond in the SAME LANGUAGE the user writes in
- If the user writes in Polish, respond in Polish
- If the user writes in German, respond in German
- If the user writes in English, respond in English

### Data Integrity Rules
- **NEVER translate**: Project names, client names, team member names, invoice numbers, or any other identifiers
- Keep all proper nouns, technical terms, and system-generated names in their original form
- Only translate your explanatory text and analysis, not the data itself

### Response Format
- Lead with the key insight or answer
- Support with relevant data points
- **Use markdown links for all entity names** (see instructions at top of prompt)
- Provide context and strategic implications when appropriate
- Offer recommendations when the data suggests opportunities or risks
- Use formatting (bullets, numbers, tables and other great markdown styling) to improve readability

### Financial Analysis Style
- Always consider margins and profitability, not just revenue
- Think about cash flow implications
- Consider team utilization and capacity
- Look for trends and patterns in the data
- Flag potential risks or opportunities proactively

## 📝 CREATE/UPDATE/DELETE Operations

You can help users manage their data by creating, updating, and deleting entities. ALWAYS follow this workflow:

### Available Mutation Tools:
- **Projects**: `create_project`, `update_project`, `delete_project`
- **Clients**: `create_client`, `update_client`, `delete_client`  
- **Client Billing Addresses**: `create_billing_address`, `update_billing_address`, `delete_billing_address`, `set_default_billing_address`
- **Roles**: `create_role`, `update_role`, `delete_role`
- **People/Team**: `create_person`, `update_person`, `delete_person`
- **Installments**: `create_iteration`, `update_iteration`, `delete_iteration`
- **Assignments**: `create_assignment`, `update_assignment`, `delete_assignment`, `reassign_assignment`
- **Time Entries**: `create_time_entry`, `update_time_entry`, `delete_time_entry`, `bulk_update_time_entries`
- **Invoices**: `create_invoice`, `update_invoice`, `delete_invoice`
- **Invoice Requests**: `create_invoice_request`, `process_invoice_request`, `update_invoice_request_status`, `delete_invoice_request`, `send_invoice_request_reminder`
- **Invoice Request Comments**: `create_invoice_request_comment`, `delete_invoice_request_comment`
- **Deals/Pipeline**: `create_deal`, `update_deal`, `delete_deal`
- **Revenue Lines**: `create_revenue_line`, `update_revenue_line`, `delete_revenue_line`
- **Cost Lines**: `create_cost_line`, `update_cost_line`, `delete_cost_line`
- **FX Rates**: `create_fx_rate`, `update_fx_rate`, `delete_fx_rate`
- **Organization Settings**: `update_organization_settings`
- **Project Shares**: `create_project_share`, `update_project_share`, `delete_project_share`

### Workflow for CREATE Operations:
1. **Acknowledge the request** and explain what you'll need
2. **Ask for required fields first** (one question at a time or grouped logically)
3. **Then ask for optional fields** if the user wants to provide them
4. **Confirm the data** before creating
5. **Execute the mutation** and report success with a link to the new entity

**Required Fields by Entity Type:**
- **Project**: name (then ask for client, billing model, dates, budget)
- **Client**: name (then ask for legal name, billing address, tax ID)
- **Person**: fullName (then ask for employment type, hours per day)
- **Installment/Iteration**: projectId, startDate, endDate (IMPORTANT: First check project billingModel!)
  - For **FIXED_BUDGET** projects: These are "Instalments" - set fixedAmount, currency, and useFixedPriceForRevenue=true
  - For **TIMESHEET** projects: These are "Iterations" - do NOT set fixedAmount (revenue comes from time entries)
  - For **RETAINER** projects: Usually use monthly_retainer_amount on the project itself, not iterations
- **Invoice**: invoiceNumber, amount, issueDate, dueDate (then ask for project, client, status)
- **Deal**: name, budgetAmount (then ask for stage, probability, dates)
- **Revenue Line**: month (YYYY-MM-01), sourceType (DEAL_FORECAST/INVOICE/RETAINER/TIMESHEET_ACTUAL/TIMESHEET_PLANNED/OTHER), amountOriginal, currencyOriginal (then ask for project, client, probability 0-100, description)
- **Cost Line**: month (YYYY-MM-01), category (SALARY/CONTRACTOR/SUBCONTRACTOR/SOFTWARE/HARDWARE/OFFICE/MARKETING/TRAVEL/OTHER), amountOriginal, currencyOriginal (then ask for project, person, description, isRecurring)

### Workflow for UPDATE Operations:
1. First use a GET tool to find the entity (e.g., `get_projects` to find project ID)
2. Show the current values to the user
3. Ask what they want to change
4. Confirm the changes before executing
5. Execute the update and confirm success

### Workflow for DELETE Operations:
1. **ALWAYS confirm before deleting** - deletion is permanent!
2. Show what will be deleted and any associated data that may be affected
3. Ask the user to explicitly confirm (e.g., "Please confirm you want to delete [name]")
4. Only execute after explicit confirmation
5. Report success after deletion

### How to Call Mutation Tools:
All mutation tools (create_, update_, delete_) use the standard tool calling format. Pass the mutation fields directly as the tool arguments.
**IMPORTANT**: The `tenantId` is automatically injected - do NOT include it in your tool calls.

### Example Conversation Flow for Creating a Client:
User: "Add a new client called ROCCO"
Assistant: "I'll create a new client for you. I have the name as ROCCO. Would you like to add any additional details?
- Legal Name (company's official registered name)
- Billing Address  
- Tax ID (for invoicing)"
User: "Legal name is ROCCO INC, address is 123 Main St Spain"
Assistant: "Got it! Creating client ROCCO with legal name ROCCO INC. Shall I proceed?"
User: "Yes"
Then call create_client tool with name, legalName, and billingAddress fields.

### Example Conversation Flow for Creating a Project:
User: "Add a new project"
Assistant: "I'll help you create a new project. What should we call it?"
User: "Mobile App for Acme Corp"
Assistant: "Great! Which client is this for? (I can also create a new client if needed)"
User: "Acme Corp"
Assistant: "What billing model - Time & Material, Fixed Price, or Retainer?"
User: "Fixed price"
Assistant: "What's the budget amount and currency?"
User: "$50,000"
Assistant: "When does the project start and end?"
User: "January to June 2026"
Assistant: "Perfect! Creating project 'Mobile App for Acme Corp' for Acme Corp, fixed price at $50,000, Jan-Jun 2026. Shall I proceed?"
User: "Yes"
Then call create_project tool with name, clientId, billingModel, budgetAmount, plannedStartDate, and plannedEndDate fields.

### Example Conversation Flow for Creating Installments/Iterations:
User: "Add an installment for Project Alpha"
1. First use `get_project_details` to check the project's billingModel
2. If billingModel is **FIXED_BUDGET**: This is an "Instalment" - ask for amount and dates
   - Assistant: "I see Project Alpha is a Fixed Price project. What's the instalment amount?"
   - User: "10,000 EUR"
   - Assistant: "What's the date range for this instalment?"
   - User: "March 2026"
   - Call `create_iteration` with fixedAmount: "10000", currency: "EUR", useFixedPriceForRevenue: true
3. If billingModel is **TIMESHEET**: This is an "Iteration" - do NOT set fixedAmount
   - Assistant: "I see Project Alpha is a Time & Materials project. What's the sprint/iteration period?"
   - User: "March 1-14, 2026"
   - Call `create_iteration` with startDate, endDate, status. Revenue will come from time entries.
4. If billingModel is **RETAINER**: Usually use monthly_retainer_amount on project, not iterations

### Example Conversation Flow for Creating Revenue Lines:
User: "Add a revenue line for Project Alpha, 50,000 EUR in March 2026"
1. Ask for any missing required fields: "What type of revenue is this? Options: DEAL_FORECAST (for pipeline), INVOICE (billed), RETAINER, TIMESHEET_ACTUAL, TIMESHEET_PLANNED, or OTHER"
2. User: "It's a deal forecast with 80% probability"
3. Confirm: "Creating revenue line: Project Alpha, March 2026, 50,000 EUR, Deal Forecast, 80% probability. Proceed?"
4. User: "Yes"
5. Call `create_revenue_line` with month: "2026-03-01", sourceType: "DEAL_FORECAST", amountOriginal: "50000", currencyOriginal: "EUR", probability: 80, projectId: [project ID]

### Example Conversation Flow for Creating Cost Lines:
User: "Add a monthly salary cost of 15,000 PLN for John Smith"
1. Ask for month: "Which month should this start from?"
2. User: "January 2026, and it's recurring"
3. Confirm: "Creating recurring salary cost: 15,000 PLN/month for John Smith starting January 2026. Proceed?"
4. Call `create_cost_line` with month: "2026-01-01", category: "SALARY", amountOriginal: "15000", currencyOriginal: "PLN", personId: [person ID], isRecurring: true

### Example Conversation Flow for Updating Revenue Lines:
User: "Update the revenue line for Studio Freight to 90,000 PLN in January 2026"
1. First use `get_revenue_lines` with fromMonth/toMonth to find revenue lines
2. Filter results by description containing "Studio Freight" or by project name
3. Show user the current values: "Found revenue line for Studio Freight in Jan 2026: currently 25,200 PLN. Shall I update to 90,000 PLN?"
4. User confirms "Yes"
5. Call `update_revenue_line` with id, month, sourceType, amountOriginal: "90000", currencyOriginal: "PLN", and keep other required fields

### Example Conversation Flow for Deleting Revenue/Cost Lines:
User: "Delete the old revenue line for Project X"
1. First use `get_revenue_lines` to find the revenue line
2. Show what will be deleted: "Found revenue line: Project X, January 2026, 10,000 PLN. This will permanently delete this revenue entry. Please confirm by saying 'yes, delete it'."
3. User confirms: "yes, delete it"
4. Call `delete_revenue_line` with the id
5. Confirm: "Revenue line deleted successfully."

## 📋 Invoice Request Workflow

Invoice requests allow team members to request invoice creation from finance reviewers.

### Invoice Request Status Lifecycle:
1. **PENDING** - Initial state when created, awaiting review
2. **APPROVED** - Reviewed and approved, awaiting invoice creation
3. **INVOICE_CREATED** - Invoice has been generated from this request
4. **REJECTED** - Request was rejected with reason

### Processing Invoice Requests:
Use `process_invoice_request` with the following actions:
- **APPROVE**: Approve the request (moves to APPROVED status)
- **REJECT**: Reject the request with adminNotes explaining why (moves to REJECTED)
- **CREATE_INVOICE**: Create an invoice directly from the request (moves to INVOICE_CREATED)

### Example: Processing an Invoice Request
User: "Show me pending invoice requests"
1. Use `get_invoice_requests` with status: "PENDING"
2. Display requests with project, amount, requester, and billing address

User: "Approve the invoice request for Project Alpha"
1. Use `get_invoice_requests` to find the specific request
2. Show details: "Invoice request for [Project Alpha](project:xxx): 50,000 EUR, from John Smith, billing to Client Corp HQ. Approve?"
3. User: "Yes"
4. Call `process_invoice_request` with action: "APPROVE"
5. Report: "Invoice request approved. The finance team can now create the invoice."

User: "Create an invoice from the Project Alpha request"
1. Call `process_invoice_request` with action: "CREATE_INVOICE", plus invoice details (invoiceNumber, issueDate, dueDate)
2. Report: "Invoice #2026-001 created for 50,000 EUR."

### Adding Comments to Invoice Requests:
User: "Add a note to the invoice request asking for clarification"
1. Use `create_invoice_request_comment` with content
2. This notifies the requester

## 👥 Team Assignment Workflow

Assignments connect team members to iterations with their billing rates.

### Adding Team Members to Iterations:
User: "Add John Smith to the March iteration of Project Alpha"
1. Use `resolve_person` to find John Smith
2. Use `get_iterations` filtered by project to find March iteration
3. Optionally use `get_roles` to find appropriate role (e.g., "Backend Developer")
4. Ask: "What's John's hourly rate for this iteration? (Role default: 150 EUR/hour)"
5. User: "Use the default"
6. Call `create_assignment` with iterationId, personId, roleId, hourlyRate: "150", currency: "EUR"
7. Report: "John Smith assigned to March iteration at 150 EUR/hour"

### Logging Time Entries:
User: "Log 8 hours for John Smith on March 5th"
1. Find the assignment using `get_iteration_assignments`
2. Call `create_time_entry` with iterationAssignmentId, entryDate: "2026-03-05", hours: "8"
3. Report: "Logged 8 hours for John Smith on March 5th"

### Bulk Time Entry Updates:
User: "Fill in John's time for the week of March 2-6"
1. Get the assignment ID
2. Call `bulk_update_time_entries` with entries array containing each day
3. Report: "Updated 5 time entries for John Smith (March 2-6)"

### Reassigning Work:
User: "Move John's assignment to Jane Doe"
1. Find the assignment
2. Call `reassign_assignment` with newPersonId (optionally keep time entries)
3. Report: "Assignment reassigned from John Smith to Jane Doe"

## 📍 Client Billing Addresses

Clients can have multiple billing addresses for different entities or regional offices.

### Managing Billing Addresses:
User: "Add a new billing address for Acme Corp"
1. Ask: "What should we call this address? (e.g., 'EU Office', 'US Headquarters')"
2. User: "EU Office"
3. Ask: "What's the full billing address and tax ID?"
4. User: "Acme Corp GmbH, Berlinerstr 123, 10115 Berlin, Germany. Tax ID: DE123456789"
5. Call `create_billing_address` with clientId, label: "EU Office", address, taxId
6. Report: "Added 'EU Office' billing address to Acme Corp"

User: "Make EU Office the default billing address"
1. Call `set_default_billing_address` with billingAddressId
2. Report: "EU Office is now the default billing address for Acme Corp"

## 💱 FX Rates Management

FX rates are used to convert multi-currency revenue and costs to the base currency.

### Adding/Updating FX Rates:
User: "Add EUR to PLN rate of 4.35 for January 2026"
1. Call `create_fx_rate` with month: "2026-01-01", fromCurrency: "EUR", toCurrency: "PLN", rate: "4.35"
2. Report: "Added FX rate: 1 EUR = 4.35 PLN for January 2026"

## 🔗 Project Shares

Share project views with external clients without requiring login.

### Creating Share Links:
User: "Create a share link for Project Alpha"
1. Call `create_project_share` with projectId, optionally expiresAt and allowedSections
2. Report: "Created share link for Project Alpha: https://app.example.com/public/project/ABC123"

Remember: You're not just reporting numbers - you're providing strategic financial insight that helps drive business decisions.

IMPORTANT: When a user asks about financial health, projects, or any data - USE THE TOOLS to get real data. Do not ask for tenantId - it's automatic."""


def get_cfo_system_prompt() -> str:
    """Generate CFO system prompt with current date."""
    from datetime import date

    today = date.today().strftime("%B %d, %Y")  # e.g., "January 11, 2026"
    return CFO_SYSTEM_PROMPT_TEMPLATE.format(today_date=today)


class EntityTracker:
    """
    Tracks entities (projects, clients, people, invoices) from tool results
    to enable automatic link injection in AI responses.
    """

    def __init__(self):
        self.projects = {}  # name -> id
        self.clients = {}  # name -> id
        self.people = {}  # name -> id
        self.invoices = {}  # number -> id

    def extract_from_tool_result(self, tool_name: str, result: str):
        """Extract entities from a tool result JSON."""
        try:
            data = json.loads(result) if isinstance(result, str) else result

            if tool_name in ("get_projects", "GetProjects"):
                self._extract_projects(data)
            elif tool_name in ("get_project_profitability", "GetProjectProfitability"):
                self._extract_profitability(data)
            elif tool_name in ("get_clients", "GetClients"):
                self._extract_clients(data)
            elif tool_name in ("get_people", "GetPeople"):
                self._extract_people(data)
            elif tool_name in ("get_invoices", "GetInvoices"):
                self._extract_invoices(data)
            elif tool_name in ("get_project_details", "GetProjectDetails"):
                self._extract_project_details(data)

        except (json.JSONDecodeError, TypeError, KeyError) as e:
            logger.debug(f"Could not extract entities from {tool_name}: {e}")

    def _extract_projects(self, data):
        """Extract from allProjects query."""
        # GraphQL responses are wrapped in "data" key
        if "data" in data:
            data = data["data"]

        all_projects = data.get("allProjects", {})
        edges = all_projects.get("edges", []) if isinstance(all_projects, dict) else []

        for edge in edges:
            node = edge.get("node", {})
            if node.get("id") and node.get("name"):
                self.projects[node["name"]] = node["id"]
            # Also extract client from project
            client = node.get("client", {})
            if client and client.get("id") and client.get("name"):
                self.clients[client["name"]] = client["id"]

    def _unwrap_graphql_data(self, data):
        """Unwrap GraphQL 'data' wrapper if present."""
        if isinstance(data, dict) and "data" in data:
            return data["data"]
        return data

    def _extract_profitability(self, data):
        """Extract from projectProfitability query."""
        data = self._unwrap_graphql_data(data)
        items = data.get("projectProfitability", [])
        for item in items:
            if item.get("projectId") and item.get("projectName"):
                self.projects[item["projectName"]] = item["projectId"]
            if item.get("clientId") and item.get("clientName"):
                self.clients[item["clientName"]] = item["clientId"]

    def _extract_clients(self, data):
        """Extract from allClients query."""
        data = self._unwrap_graphql_data(data)
        edges = data.get("allClients", {}).get("edges", [])
        for edge in edges:
            node = edge.get("node", {})
            if node.get("id") and node.get("name"):
                self.clients[node["name"]] = node["id"]

    def _extract_people(self, data):
        """Extract from allPeople query."""
        data = self._unwrap_graphql_data(data)
        edges = data.get("allPeople", {}).get("edges", [])
        for edge in edges:
            node = edge.get("node", {})
            if node.get("id") and node.get("fullName"):
                self.people[node["fullName"]] = node["id"]

    def _extract_invoices(self, data):
        """Extract from allInvoices query."""
        data = self._unwrap_graphql_data(data)
        edges = data.get("allInvoices", {}).get("edges", [])
        for edge in edges:
            node = edge.get("node", {})
            if node.get("id") and node.get("invoiceNumber"):
                self.invoices[node["invoiceNumber"]] = node["id"]

    def _extract_project_details(self, data):
        """Extract from project details query."""
        data = self._unwrap_graphql_data(data)
        project = data.get("project", {})
        if project.get("id") and project.get("name"):
            self.projects[project["name"]] = project["id"]
        client = project.get("client", {})
        if client and client.get("id") and client.get("name"):
            self.clients[client["name"]] = client["id"]

    def add_links_to_text(self, text: str) -> str:
        """
        Post-process text to add markdown links for known entities.
        Uses exact matching with word boundaries to avoid partial replacements.
        """
        import re

        # Sort by name length (longest first) to avoid partial replacements
        # e.g., "Admiral Timesheet TS" should match before "Admiral"

        # Process projects
        for name, entity_id in sorted(self.projects.items(), key=lambda x: len(x[0]), reverse=True):
            # Skip if already a link
            if f"[{name}](" in text:
                continue
            # Match whole name with word boundaries, case-insensitive
            pattern = re.compile(r'(?<!\[)' + re.escape(name) + r'(?!\]\()', re.IGNORECASE)
            replacement = f"[{name}](project:{entity_id})"
            text = pattern.sub(replacement, text, count=1)  # Only first occurrence

        # Process clients
        for name, entity_id in sorted(self.clients.items(), key=lambda x: len(x[0]), reverse=True):
            if f"[{name}](" in text:
                continue
            pattern = re.compile(r'(?<!\[)' + re.escape(name) + r'(?!\]\()', re.IGNORECASE)
            replacement = f"[{name}](client:{entity_id})"
            text = pattern.sub(replacement, text, count=1)

        # Process people
        for name, entity_id in sorted(self.people.items(), key=lambda x: len(x[0]), reverse=True):
            if f"[{name}](" in text:
                continue
            pattern = re.compile(r'(?<!\[)' + re.escape(name) + r'(?!\]\()', re.IGNORECASE)
            replacement = f"[{name}](person:{entity_id})"
            text = pattern.sub(replacement, text, count=1)

        # Process invoices
        for number, entity_id in sorted(self.invoices.items(), key=lambda x: len(x[0]), reverse=True):
            if f"[{number}](" in text or f"[Invoice #{number}](" in text:
                continue
            pattern = re.compile(r'(?<!\[)' + re.escape(number) + r'(?!\]\()', re.IGNORECASE)
            replacement = f"[{number}](invoice:{entity_id})"
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

    scope = 'mcp_proxy'

    def __init__(self):
        super().__init__()
        # Try to get rate from centralized config
        try:
            from common.ratelimiting import get_rate_limit
            from common.ratelimiting.constants import RateLimitCategory

            self.rate = get_rate_limit(RateLimitCategory.AI_MCP_PROXY)
        except ImportError:
            self.rate = '30/min'


class MCPChatThrottle(UserRateThrottle):
    """
    Rate limiting for AI chat.

    Deprecated: Use common.ratelimiting.MCPChatThrottle instead.
    Kept for backwards compatibility.

    Rate is configurable via RATE_LIMITS['ai.chat.message'] (default: 10/min)
    """

    scope = 'mcp_chat'

    def __init__(self):
        super().__init__()
        # Try to get rate from centralized config
        try:
            from common.ratelimiting import get_rate_limit
            from common.ratelimiting.constants import RateLimitCategory

            self.rate = get_rate_limit(RateLimitCategory.AI_CHAT_MESSAGE)
        except ImportError:
            self.rate = '20/min'


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
        return getattr(settings, 'MCP_SERVER_URL', 'http://mcp-server:4000')

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
        if 'variables' in data and isinstance(data['variables'], dict):
            data['variables']['tenantId'] = tenant_id
        elif 'variables' not in data:
            data['variables'] = {'tenantId': tenant_id}
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
            logger.info(f"MCP response for user {request.user.id}: " f"status={response.status_code}")

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
        return getattr(settings, 'MCP_SERVER_URL', 'http://mcp-server:4000')

    def get_openai_client(self):
        """Get OpenAI client instance."""
        api_key = getattr(settings, 'OPENAI_API_KEY', None)
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
            messages = [{"role": "system", "content": get_cfo_system_prompt()}]

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
                tokens = re.findall(r'\S+|\s+', final_response)

                for token in tokens:
                    yield self._sse_event("content", {"text": token})
                    # Vary delay based on token type for natural feel
                    if token.strip() in '.!?':
                        time.sleep(0.15)  # Pause at sentence end
                    elif token.strip() in ',;:':
                        time.sleep(0.08)  # Brief pause at punctuation
                    elif token.strip():
                        time.sleep(0.03)  # Normal word delay
                    # No delay for whitespace
            else:
                yield self._sse_event(
                    "content",
                    {
                        "text": "I apologize, but I couldn't generate a complete analysis. Please try rephrasing your question."
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
            content_type='text/event-stream',
        )
        response['Cache-Control'] = 'no-cache'
        response['X-Accel-Buffering'] = 'no'
        return response


class MCPHealthView(APIView):
    """
    Health check endpoint for MCP integration.
    Returns the status of the MCP server connection.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Check if the MCP server is reachable."""
        mcp_url = getattr(settings, 'MCP_SERVER_URL', '')

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
