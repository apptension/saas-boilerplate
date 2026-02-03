"""
GraphQL Security Middleware

This module provides security-related middleware for GraphQL operations.
"""

import logging

from django.conf import settings
from graphql.error import GraphQLError

logger = logging.getLogger(__name__)


class DisableIntrospectionMiddleware:
    """
    Middleware to disable GraphQL introspection in non-debug environments.

    SECURITY: GraphQL introspection exposes the entire API schema, which can
    help attackers understand the API structure and find potential vulnerabilities.
    This middleware blocks introspection queries in production.

    In DEBUG mode, introspection is allowed for development convenience.

    Usage:
        Add to GRAPHENE["MIDDLEWARE"] in settings.py:
        GRAPHENE = {
            "MIDDLEWARE": [
                "common.graphql.security.DisableIntrospectionMiddleware",
                ...
            ],
        }
    """

    # NOTE: __typename is NOT blocked - it's a meta field used by Apollo Client
    # for type resolution and cache normalization. Only block true introspection.
    INTROSPECTION_FIELDS = {"__schema", "__type"}
    INTROSPECTION_ERROR = "GraphQL introspection is disabled in production."

    def resolve(self, next, root, info, **args):
        """
        Check if the query is an introspection query and block it in production.

        Args:
            next: The next resolver in the middleware chain
            root: The root value
            info: GraphQL ResolveInfo object
            **args: Additional arguments

        Returns:
            The result of the next resolver, or raises GraphQLError for introspection

        Raises:
            GraphQLError: If introspection is attempted in production
        """
        # Allow introspection in DEBUG mode
        if settings.DEBUG:
            return next(root, info, **args)

        # Check if this is an introspection query
        field_name = info.field_name.lower() if info.field_name else ""
        if field_name in self.INTROSPECTION_FIELDS:
            raise GraphQLError(self.INTROSPECTION_ERROR)

        return next(root, info, **args)


class SanitizeErrorsMiddleware:
    """
    Middleware to sanitize error messages in production.

    SECURITY: In production, detailed error messages can leak sensitive
    information about the application's internals. This middleware ensures
    that only safe error messages are returned to clients.

    In DEBUG mode, full error details are preserved for development.

    Usage:
        Add to GRAPHENE["MIDDLEWARE"] in settings.py:
        GRAPHENE = {
            "MIDDLEWARE": [
                "common.graphql.security.SanitizeErrorsMiddleware",
                ...
            ],
        }
    """

    GENERIC_ERROR = "An error occurred while processing your request."

    # Error types that are safe to expose to users
    SAFE_ERROR_TYPES = (
        "ValidationError",
        "GraphQlValidationError",
        "PermissionDenied",
        "AuthenticationFailed",
        "NotAuthenticated",
        "NotFound",
        "Http404",
    )

    def on_error(self, error):
        """
        Handle errors by sanitizing messages in production.

        Args:
            error: The exception that occurred

        Returns:
            The original error (in debug) or re-raises with sanitized message
        """
        # In DEBUG mode, preserve full error details
        if settings.DEBUG:
            raise error

        # Log the actual error before sanitizing (for debugging production issues)
        error_type = type(error).__name__
        original_error = getattr(error, "original_error", None)
        original_type = type(original_error).__name__ if original_error else None

        logger.error(
            f"GraphQL error being sanitized: {error_type}: {error}. Original error: {original_type}: {original_error}"
        )

        # Check if this is a "safe" error type that can be exposed
        if hasattr(error, "original_error"):
            if original_type in self.SAFE_ERROR_TYPES:
                raise error
        elif error_type in self.SAFE_ERROR_TYPES:
            raise error

        # For GraphQLError, check if it has a safe message
        if isinstance(error, GraphQLError):
            # Check if the error message starts with known safe prefixes
            safe_prefixes = (
                "You don't have permission",
                "Authentication required",
                "Not found",
                "Validation error",
                "Invalid",
                "permission_denied",
            )
            if error.message and any(error.message.lower().startswith(p.lower()) for p in safe_prefixes):
                raise error

        # For unknown errors, return generic message
        raise GraphQLError(self.GENERIC_ERROR)

    def resolve(self, next, root, info, **args):
        """
        Wrap the resolver to catch and sanitize errors.

        Args:
            next: The next resolver in the middleware chain
            root: The root value
            info: GraphQL ResolveInfo object
            **args: Additional arguments

        Returns:
            The result of the next resolver

        Raises:
            GraphQLError: With sanitized message in production
        """
        # TEMPORARILY DISABLED - causing login issues
        # TODO: Fix promise error handling before re-enabling
        return next(root, info, **args)
