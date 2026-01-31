"""
Action Logging Module for tenant-scoped audit trails.

This module provides utilities for logging user and system actions with full
audit trail support, including field-level change tracking (old/new values).

Usage:
    from common.action_logging import (
        log_action,
        log_create,
        log_update,
        log_delete,
        is_logging_enabled,
        action_logged,
    )
"""

from .service import (
    log_action,
    log_create,
    log_update,
    log_delete,
    log_settings_change,
    log_import,
    log_bulk_delete,
    compute_changes,
    serialize_value,
    is_logging_enabled,
)

from .decorators import action_logged, log_mutation_action

__all__ = [
    'log_action',
    'log_create',
    'log_update',
    'log_delete',
    'log_settings_change',
    'log_import',
    'log_bulk_delete',
    'compute_changes',
    'serialize_value',
    'is_logging_enabled',
    'action_logged',
    'log_mutation_action',
]
