"""
GraphQL Subscription for AI CFO Assistant.
Uses the same WebSocket infrastructure as notifications.
"""
import json
import logging
import asyncio

import channels_graphql_ws
import graphene
from django.conf import settings
from asgiref.sync import sync_to_async

logger = logging.getLogger(__name__)


# Import helpers from views (single source of truth)
from .views import (
    get_tool_display_name,
    EntityTracker,
    get_cfo_system_prompt,  # Use the full CFO prompt with link instructions
)


class AiChatEventType(graphene.ObjectType):
    """Event sent during AI chat streaming."""

    event_type = graphene.String(required=True)  # status, tool_start, tool_complete, content, done, error
    message = graphene.String()
    tool_name = graphene.String()
    tool_display_name = graphene.String()
    success = graphene.Boolean()
    has_data = graphene.Boolean()
    text = graphene.String()
    tools_used = graphene.List(graphene.String)
    conversation_id = graphene.String()


class AiChatSubscription(channels_graphql_ws.Subscription):
    """
    GraphQL subscription for AI chat streaming.
    Receives events as the AI processes messages.
    """

    notification_queue_limit = 256

    event = graphene.Field(AiChatEventType)

    class Arguments:
        conversation_id = graphene.String(required=True)

    @staticmethod
    def subscribe(root, info, conversation_id):
        """Subscribe to a specific conversation."""
        user = info.context.channels_scope.get('user')
        if not user or not user.is_authenticated:
            return []
        # Subscribe to user-specific conversation channel
        return [f"ai_chat_{user.id}_{conversation_id}"]

    @staticmethod
    async def publish(payload, info, conversation_id):
        """Publish event to subscribers."""
        return AiChatSubscription(event=AiChatEventType(**payload))


class SendAiMessageMutation(graphene.Mutation):
    """
    Mutation to send a message to the AI assistant.
    The response is streamed via the AiChatSubscription.
    """

    class Arguments:
        message = graphene.String(required=True)
        tenant_id = graphene.String(required=True)
        conversation_id = graphene.String(required=True)
        history = graphene.List(graphene.JSONString)

    ok = graphene.Boolean()
    error = graphene.String()

    @classmethod
    def mutate(cls, root, info, message, tenant_id, conversation_id, history=None):
        user = info.context.user
        if not user or not user.is_authenticated:
            return SendAiMessageMutation(ok=False, error="Authentication required")

        # Get JWT token - works for both HTTP and WebSocket contexts
        jwt_token = None

        # Check if this is an HTTP request (mutations often come via HTTP)
        if hasattr(info.context, 'COOKIES'):
            # HTTP request - get token from cookies
            jwt_token = info.context.COOKIES.get(settings.ACCESS_TOKEN_COOKIE)
            logger.info(f"[AI] Got JWT token from HTTP cookies: {'present' if jwt_token else 'missing'}")
        elif hasattr(info.context, 'channels_scope'):
            # WebSocket context - get token from scope
            jwt_token = info.context.channels_scope.get('jwt_token')
            logger.info(f"[AI] Got JWT token from WebSocket scope: {'present' if jwt_token else 'missing'}")
        else:
            logger.warning("[AI] Unable to extract JWT token from context")

        # Start async processing in background
        import threading

        thread = threading.Thread(
            target=cls._process_message_sync,
            args=(user.id, message, tenant_id, conversation_id, history or [], jwt_token),
        )
        thread.start()

        return SendAiMessageMutation(ok=True)

    @classmethod
    def _process_message_sync(cls, user_id, message, tenant_id, conversation_id, history, jwt_token):
        """Process message synchronously in a thread."""
        import asyncio

        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(
                cls._process_message(user_id, message, tenant_id, conversation_id, history, jwt_token)
            )
        finally:
            loop.close()

    @classmethod
    async def _process_message(cls, user_id, message, tenant_id, conversation_id, history, jwt_token):
        """Process the AI message and broadcast events."""
        from .views import MCPClient
        import openai

        group_name = f"ai_chat_{user_id}_{conversation_id}"

        async def broadcast(event_data):
            """Broadcast event to subscription."""
            await AiChatSubscription.broadcast(
                group=group_name,
                payload=event_data,
            )

        try:
            # Status: Starting
            await broadcast(
                {
                    "event_type": "status",
                    "message": "Connecting to data sources...",
                    "conversation_id": conversation_id,
                }
            )

            # Get OpenAI client
            openai_api_key = getattr(settings, 'OPENAI_API_KEY', None)
            if not openai_api_key:
                await broadcast(
                    {
                        "event_type": "error",
                        "message": "AI Assistant is not configured",
                        "conversation_id": conversation_id,
                    }
                )
                return

            openai_client = openai.OpenAI(api_key=openai_api_key)

            # Build auth header from JWT token
            auth_header = f"Bearer {jwt_token}" if jwt_token else ""
            logger.info(f"[AI] Auth header for MCP: {'present' if auth_header else 'MISSING'}")

            # Initialize MCP client
            mcp_server_url = getattr(settings, 'MCP_SERVER_URL', 'http://mcp-server:4000')
            mcp_client = MCPClient(
                mcp_server_url=mcp_server_url,
                auth_header=auth_header,
            )

            # Get MCP tools
            mcp_tools = await sync_to_async(mcp_client.list_tools)()

            if mcp_tools:
                await broadcast(
                    {
                        "event_type": "status",
                        "message": f"Connected to {len(mcp_tools)} data sources",
                        "conversation_id": conversation_id,
                    }
                )

            # Convert to OpenAI format
            openai_tools = await sync_to_async(mcp_client.convert_to_openai_tools)(mcp_tools) if mcp_tools else None

            # Build messages
            messages = [{"role": "system", "content": get_cfo_system_prompt()}]

            for hist_msg in (history or [])[-10:]:
                if isinstance(hist_msg, str):
                    hist_msg = json.loads(hist_msg)
                messages.append({"role": hist_msg.get("role", "user"), "content": hist_msg.get("content", "")})

            messages.append({"role": "user", "content": message})

            await broadcast(
                {
                    "event_type": "status",
                    "message": "Analyzing your question...",
                    "conversation_id": conversation_id,
                }
            )

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

            response = await sync_to_async(openai_client.chat.completions.create)(**completion_kwargs)

            assistant_message = response.choices[0].message
            tools_used = []
            entity_tracker = EntityTracker()  # Track entities for link injection

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

                    logger.info(f"[AI DEBUG] Tool call: {tool_name}")
                    logger.info(f"[AI DEBUG] Raw arguments: {tool_call.function.arguments}")

                    try:
                        arguments = json.loads(tool_call.function.arguments)
                        logger.info(f"[AI DEBUG] Parsed arguments: {json.dumps(arguments, default=str)}")
                    except json.JSONDecodeError as e:
                        logger.error(f"[AI DEBUG] JSON decode error: {e}")
                        arguments = {}

                    # Inject tenantId - handle both queries and mutations
                    # For queries: tenantId is a top-level variable
                    # For mutations: tenantId is inside the "input" object
                    is_mutation = tool_name.startswith(("create_", "update_", "delete_"))
                    logger.info(
                        f"[AI DEBUG] Is mutation: {is_mutation}, has 'input' key: {'input' in arguments if isinstance(arguments, dict) else 'N/A'}"
                    )

                    if isinstance(arguments, dict):
                        if "input" in arguments and isinstance(arguments.get("input"), dict):
                            # Mutation with input object - inject tenantId inside input
                            arguments["input"]["tenantId"] = tenant_id
                            logger.info("[AI DEBUG] Injected tenantId into existing input object")
                        elif is_mutation and "input" not in arguments:
                            # Mutation without input wrapper - wrap the arguments
                            # This handles cases where OpenAI sends fields directly instead of wrapped
                            logger.info("[AI DEBUG] Wrapping mutation arguments in input object")
                            arguments = {"input": {**arguments, "tenantId": tenant_id}}
                        else:
                            # Query or other case - inject at top level
                            arguments["tenantId"] = tenant_id
                            logger.info("[AI DEBUG] Injected tenantId at top level")

                    logger.info(f"[AI DEBUG] Final arguments: {json.dumps(arguments, default=str)}")

                    # Notify: tool starting
                    await broadcast(
                        {
                            "event_type": "tool_start",
                            "tool_name": tool_name,
                            "tool_display_name": display_name,
                            "conversation_id": conversation_id,
                        }
                    )

                    tools_used.append(display_name)

                    # Execute tool
                    logger.info(f"[AI DEBUG] Calling MCP tool: {tool_name}")
                    tool_result = await sync_to_async(mcp_client.call_tool)(tool_name, arguments, tenant_id)
                    logger.info(f"[AI DEBUG] Tool result: {json.dumps(tool_result, default=str)[:2000]}")

                    # Format result
                    if "error" in tool_result:
                        result_content = json.dumps({"error": tool_result["error"]})
                        await broadcast(
                            {
                                "event_type": "tool_complete",
                                "tool_name": tool_name,
                                "tool_display_name": display_name,
                                "success": False,
                                "conversation_id": conversation_id,
                            }
                        )
                    else:
                        result_content = tool_result.get("result", json.dumps(tool_result))
                        has_data = bool(result_content and result_content not in {"{}", "null"})

                        # Extract entities from tool results for link injection
                        if has_data:
                            entity_tracker.extract_from_tool_result(tool_name, result_content)

                        await broadcast(
                            {
                                "event_type": "tool_complete",
                                "tool_name": tool_name,
                                "tool_display_name": display_name,
                                "success": True,
                                "has_data": has_data,
                                "conversation_id": conversation_id,
                            }
                        )

                    messages.append(
                        {
                            "role": "tool",
                            "tool_call_id": tool_call.id,
                            "content": result_content,
                        }
                    )

                await broadcast(
                    {
                        "event_type": "status",
                        "message": "Processing data...",
                        "conversation_id": conversation_id,
                    }
                )

                # Get next response
                response = await sync_to_async(openai_client.chat.completions.create)(**completion_kwargs)
                assistant_message = response.choices[0].message

            # Stream final response
            final_response = assistant_message.content

            if final_response:
                # Post-process to add entity links
                final_response = entity_tracker.add_links_to_text(final_response)

                await broadcast(
                    {
                        "event_type": "status",
                        "message": "Generating analysis...",
                        "conversation_id": conversation_id,
                    }
                )

                # Stream word by word
                import re

                tokens = re.findall(r'\S+|\s+', final_response)

                for token in tokens:
                    await broadcast(
                        {
                            "event_type": "content",
                            "text": token,
                            "conversation_id": conversation_id,
                        }
                    )
                    # Small delay for natural feel
                    if token.strip() in '.!?':
                        await asyncio.sleep(0.05)
                    elif token.strip() in ',;:':
                        await asyncio.sleep(0.025)
                    elif token.strip():
                        await asyncio.sleep(0.01)

            # Done
            await broadcast(
                {
                    "event_type": "done",
                    "tools_used": list(set(tools_used)),
                    "conversation_id": conversation_id,
                }
            )

        except Exception as e:
            logger.exception(f"Error in AI chat: {e}")
            await broadcast(
                {
                    "event_type": "error",
                    "message": str(e),
                    "conversation_id": conversation_id,
                }
            )


class Subscription(graphene.ObjectType):
    """AI Assistant subscriptions."""

    ai_chat = AiChatSubscription.Field()


class Mutation(graphene.ObjectType):
    """AI Assistant mutations."""

    send_ai_message = SendAiMessageMutation.Field()
