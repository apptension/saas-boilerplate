"""
WebSocket consumer for AI CFO Assistant.
Provides real-time streaming responses via WebSockets.

Security Features:
- JWT authentication via WebSocket middleware
- Tenant access validation
- Rate limiting per user (configurable via RATE_LIMITS in settings)
- Hourly quotas to control OpenAI API costs
"""

import json
import logging
import asyncio
from typing import Optional

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.conf import settings
from asgiref.sync import sync_to_async

# Rate limiting for WebSocket connections
try:
    from common.ratelimiting import WebSocketRateLimiter
    from common.ratelimiting.constants import RateLimitCategory

    RATE_LIMITING_AVAILABLE = True
except ImportError:
    RATE_LIMITING_AVAILABLE = False
    WebSocketRateLimiter = None
    RateLimitCategory = None

logger = logging.getLogger(__name__)


from .views import get_navigator_system_prompt, get_tool_display_name


class AiAssistantConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for AI CFO Assistant.
    Handles real-time chat with streaming responses.

    Rate Limiting:
    - Per-minute limit: Configured via RATE_LIMITS['ai.chat.message'] (default: 10/min)
    - Per-hour limit: Configured via RATE_LIMITS['ai.chat.hourly'] (default: 60/hour)
    - Limits are per-user and can vary by subscription tier
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.tenant_id: Optional[str] = None
        self.user = None
        self.mcp_client = None
        self.openai_client = None
        self.conversation_history = []

        # Initialize rate limiter if available
        if RATE_LIMITING_AVAILABLE and WebSocketRateLimiter:
            self.rate_limiter = WebSocketRateLimiter(
                category=RateLimitCategory.AI_CHAT_MESSAGE,
                hourly_category=RateLimitCategory.AI_CHAT_HOURLY,
            )
        else:
            self.rate_limiter = None
            logger.warning("Rate limiting not available for AI Assistant WebSocket")

    async def connect(self):
        """Handle WebSocket connection."""
        # Get user from scope (set by JWT middleware)
        self.user = self.scope.get("user")

        if not self.user or not self.user.is_authenticated:
            logger.warning("Unauthenticated WebSocket connection attempt")
            await self.close(code=4001)
            return

        # Extract tenant_id from URL route
        self.tenant_id = self.scope["url_route"]["kwargs"].get("tenant_id")

        if not self.tenant_id:
            logger.warning("No tenant_id in WebSocket connection")
            await self.close(code=4002)
            return

        # Validate tenant access
        has_access = await self.validate_tenant_access()
        if not has_access:
            logger.warning(f"User {self.user.id} denied access to tenant {self.tenant_id}")
            await self.close(code=4003)
            return

        # Initialize clients
        await self.initialize_clients()

        if not self.openai_client:
            await self.send_json({"type": "error", "message": "AI Assistant is not configured"})
            await self.close(code=4004)
            return

        await self.accept()
        logger.info(f"AI Assistant WebSocket connected for user {self.user.id}, tenant {self.tenant_id}")

        # Send connection confirmation
        await self.send_json({"type": "connected", "message": "Connected to AI Assistant"})

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection."""
        logger.info(f"AI Assistant WebSocket disconnected: {close_code}")

    @sync_to_async
    def validate_tenant_access(self) -> bool:
        """Check if user has access to the tenant."""
        try:
            from apps.multitenancy.models import TenantMembership
            import base64

            # Decode relay ID if needed
            try:
                decoded = base64.b64decode(self.tenant_id).decode("utf-8")
                raw_tenant_id = decoded.split(":", 1)[1] if ":" in decoded else self.tenant_id
            except Exception:
                raw_tenant_id = self.tenant_id

            return TenantMembership.objects.filter(user=self.user, tenant_id=raw_tenant_id, is_accepted=True).exists()
        except Exception as e:
            logger.error(f"Error validating tenant access: {e}")
            return False

    @sync_to_async
    def initialize_clients(self):
        """Initialize OpenAI and MCP clients."""
        import openai
        from .views import MCPClient

        # Initialize OpenAI
        openai_api_key = getattr(settings, "OPENAI_API_KEY", None)
        if openai_api_key:
            self.openai_client = openai.OpenAI(api_key=openai_api_key)

        # Get auth token for MCP
        # In WebSocket, we get the token from the scope
        auth_header = ""
        headers = dict(self.scope.get("headers", []))

        # Try cookie first (as bytes)
        cookies = headers.get(b"cookie", b"").decode()
        if cookies:
            for cookie in cookies.split("; "):
                if cookie.startswith(f"{settings.ACCESS_TOKEN_COOKIE}="):
                    token = cookie.split("=", 1)[1]
                    auth_header = f"Bearer {token}"
                    break

        # Initialize MCP client
        mcp_server_url = getattr(settings, "MCP_SERVER_URL", "http://mcp-server:4000")
        self.mcp_client = MCPClient(
            mcp_server_url=mcp_server_url,
            auth_header=auth_header,
        )

    async def receive_json(self, content):
        """Handle incoming JSON messages."""
        message_type = content.get("type", "message")

        if message_type == "message":
            user_message = content.get("message", "")
            if user_message:
                await self.handle_chat_message(user_message)
        elif message_type == "clear":
            self.conversation_history = []
            await self.send_json({"type": "cleared"})
        elif message_type == "ping":
            await self.send_json({"type": "pong"})

    async def handle_chat_message(self, message: str):
        """Process a chat message and stream the response."""
        try:
            # Check rate limits before processing
            if self.rate_limiter:
                result = await self.rate_limiter.check_async(
                    user_id=str(self.user.id) if self.user else None,
                    tenant_id=self.tenant_id,
                )
                if not result.is_allowed:
                    await self.send_json(
                        {
                            "type": "error",
                            "message": result.message,
                            "retry_after": result.retry_after,
                        }
                    )
                    logger.warning(
                        f"Rate limit exceeded for user {self.user.id} in tenant {self.tenant_id}: "
                        f"{result.current_count}/{result.limit}"
                    )
                    return

            # Send status
            await self.send_json({"type": "status", "message": "Connecting to data sources..."})

            # Get MCP tools
            mcp_tools = await sync_to_async(self.mcp_client.list_tools)()

            if not mcp_tools:
                await self.send_json({"type": "status", "message": "Limited data access - using general knowledge"})
            else:
                await self.send_json({"type": "status", "message": f"Connected to {len(mcp_tools)} data sources"})

            # Convert to OpenAI format
            openai_tools = (
                await sync_to_async(self.mcp_client.convert_to_openai_tools)(mcp_tools) if mcp_tools else None
            )

            # Build messages
            messages = [{"role": "system", "content": get_navigator_system_prompt()}]

            # Add conversation history (last 10 messages)
            for hist_msg in self.conversation_history[-10:]:
                messages.append({"role": hist_msg.get("role", "user"), "content": hist_msg.get("content", "")})

            messages.append({"role": "user", "content": message})

            # Add to history
            self.conversation_history.append({"role": "user", "content": message})

            await self.send_json({"type": "status", "message": "Analyzing your question..."})

            # Call OpenAI
            completion_kwargs = {
                "model": "gpt-4o",
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 2000,
            }

            if openai_tools:
                completion_kwargs["tools"] = openai_tools
                completion_kwargs["tool_choice"] = "auto"

            response = await sync_to_async(self.openai_client.chat.completions.create)(**completion_kwargs)

            assistant_message = response.choices[0].message
            tools_used = []

            # Handle tool calls
            max_iterations = 8
            iteration = 0

            while assistant_message.tool_calls and iteration < max_iterations:
                iteration += 1

                # Add assistant message to context
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

                # Execute each tool
                for tool_call in assistant_message.tool_calls:
                    tool_name = tool_call.function.name
                    display_name = get_tool_display_name(tool_name)

                    try:
                        arguments = json.loads(tool_call.function.arguments)
                    except json.JSONDecodeError:
                        arguments = {}

                    arguments["tenantId"] = self.tenant_id

                    # Notify frontend
                    await self.send_json(
                        {
                            "type": "tool_start",
                            "tool": tool_name,
                            "display_name": display_name,
                        }
                    )

                    tools_used.append({"name": tool_name, "display_name": display_name})

                    # Execute tool
                    tool_result = await sync_to_async(self.mcp_client.call_tool)(tool_name, arguments, self.tenant_id)

                    # Format result
                    if "error" in tool_result:
                        result_content = json.dumps({"error": tool_result["error"]})
                        await self.send_json(
                            {
                                "type": "tool_complete",
                                "tool": tool_name,
                                "display_name": display_name,
                                "success": False,
                            }
                        )
                    else:
                        result_content = tool_result.get("result", json.dumps(tool_result))
                        has_data = bool(result_content and result_content not in {"{}", "null"})
                        await self.send_json(
                            {
                                "type": "tool_complete",
                                "tool": tool_name,
                                "display_name": display_name,
                                "success": True,
                                "has_data": has_data,
                            }
                        )

                    messages.append(
                        {
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": result_content,
                        }
                    )

                await self.send_json({"type": "status", "message": "Processing data..."})

                # Get next response
                response = await sync_to_async(self.openai_client.chat.completions.create)(**completion_kwargs)
                assistant_message = response.choices[0].message

            # Stream final response
            final_response = assistant_message.content

            if final_response:
                await self.send_json({"type": "status", "message": "Generating analysis..."})

                # Stream word by word
                import re

                tokens = re.findall(r"\S+|\s+", final_response)

                for token in tokens:
                    await self.send_json(
                        {
                            "type": "content",
                            "text": token,
                        }
                    )
                    # Small delay for natural feel
                    if token.strip() in ".!?":
                        await asyncio.sleep(0.08)
                    elif token.strip() in ",;:":
                        await asyncio.sleep(0.04)
                    elif token.strip():
                        await asyncio.sleep(0.015)

                # Add to history
                self.conversation_history.append({"role": "assistant", "content": final_response})
            else:
                await self.send_json(
                    {
                        "type": "content",
                        "text": (
                            "I apologize, but I couldn't generate a complete analysis. "
                            "Please try rephrasing your question."
                        ),
                    }
                )

            # Done
            unique_tools = {t["name"]: t for t in tools_used}.values()
            await self.send_json(
                {
                    "type": "done",
                    "tools_used": list(unique_tools),
                }
            )

        except Exception as e:
            logger.exception(f"Error in AI chat: {e}")
            await self.send_json(
                {"type": "error", "message": "An error occurred while processing your request. Please try again."}
            )
