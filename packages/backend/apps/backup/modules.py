"""
Module grouping system for organizing backup models into logical categories.

Modules are auto-discovered from Django apps that contain TenantDependentModelMixin models.
"""

import logging
from typing import Dict, List, Type, Optional
from django.apps import apps
from django.db import models

from common.models import TenantDependentModelMixin

logger = logging.getLogger(__name__)


class BackupModule:
    """Represents a logical grouping of models for backup."""

    def __init__(self, id: str, name: str, description: str, app_labels: List[str]):
        """
        Initialize a backup module.

        Args:
            id: Unique identifier for the module (e.g., 'financial_data')
            name: Human-readable name (e.g., 'Financial Data')
            description: Description of what this module contains
            app_labels: List of Django app labels to include (e.g., ['management_dashboard', 'finances'])
        """
        self.id = id
        self.name = name
        self.description = description
        self.app_labels = app_labels

    def get_models(self) -> List[Type[models.Model]]:
        """
        Get all models in this module that are eligible for backup.

        Returns:
            List of model classes that belong to this module and inherit from TenantDependentModelMixin
        """
        models_list = []
        for app_label in self.app_labels:
            try:
                app_config = apps.get_app_config(app_label)
                for model in app_config.get_models():
                    # Skip if model explicitly opts out
                    if getattr(model, '_backup_excluded', False):
                        continue

                    # Only include models that inherit from TenantDependentModelMixin
                    if issubclass(model, TenantDependentModelMixin):
                        models_list.append(model)
            except LookupError:
                # App not found, skip
                continue

        return models_list

    def get_model_count(self) -> int:
        """Get the number of models in this module."""
        return len(self.get_models())


def _format_app_name(app_label: str, app_config) -> str:
    """
    Generate a human-readable name for an app.

    Uses verbose_name if available, otherwise formats the app label.
    Example: 'management_dashboard' -> 'Management Dashboard'
    """
    # Use verbose_name if available
    if hasattr(app_config, 'verbose_name') and app_config.verbose_name:
        return app_config.verbose_name

    # Convert app label to readable format
    # Replace underscores with spaces and capitalize words
    name = app_label.replace('_', ' ').replace('.', ' / ')
    # Capitalize each word
    name = ' '.join(word.capitalize() for word in name.split())
    return name


def _auto_discover_modules() -> Dict[str, BackupModule]:
    """
    Auto-discover modules from all Django apps that have backupable models.

    Creates one module per app that contains TenantDependentModelMixin models.
    Excludes Django core apps and third-party apps.

    Returns:
        Dictionary of module_id -> BackupModule
    """
    modules = {}
    seen_apps = set()

    # Apps to exclude from auto-discovery
    excluded_app_prefixes = [
        'django.',
        'rest_framework',
        'corsheaders',
        'django_extensions',
        'django_celery',
        'djstripe',
        'django_hosts',
        'drf_yasg',
        'social_django',
        'whitenoise',
        'graphene_django',
        'channels',
        'aws_xray_sdk',
        'apps.backup',  # Exclude the backup app itself
    ]

    for app_config in apps.get_app_configs():
        app_name = app_config.name
        app_label = app_config.label

        # Skip excluded apps (check both name and label)
        if any(app_name.startswith(prefix) or app_label.startswith(prefix) for prefix in excluded_app_prefixes):
            continue

        # Skip if we've already processed this app (by label)
        if app_label in seen_apps:
            continue

        # Check if this app has any backupable models
        backupable_models = []
        for model in app_config.get_models():
            # Skip if model explicitly opts out
            if getattr(model, '_backup_excluded', False):
                continue

            # Only include models that inherit from TenantDependentModelMixin
            if issubclass(model, TenantDependentModelMixin):
                backupable_models.append(model)

        # Only create module if app has backupable models
        if backupable_models:
            module_id = app_label.replace('.', '_').replace('-', '_')
            module_name = _format_app_name(app_label, app_config)

            # Generate description
            model_count = len(backupable_models)
            description = f'{module_name} data ({model_count} {("model" if model_count == 1 else "models")})'

            modules[module_id] = BackupModule(
                id=module_id,
                name=module_name,
                description=description,
                app_labels=[app_label],
            )

            seen_apps.add(app_label)
            logger.debug(f"Auto-discovered module: {module_id} ({module_name}) with {model_count} models")

    logger.info(f"Auto-discovered {len(modules)} backup modules")
    return modules


# Cache for auto-discovered modules
_MODULES_CACHE: Optional[Dict[str, BackupModule]] = None


def _get_modules() -> Dict[str, BackupModule]:
    """Get modules, using cache if available."""
    global _MODULES_CACHE
    if _MODULES_CACHE is None:
        _MODULES_CACHE = _auto_discover_modules()
    return _MODULES_CACHE


def get_module(module_id: str) -> Optional[BackupModule]:
    """
    Get a module by its ID.

    Args:
        module_id: The module identifier

    Returns:
        BackupModule instance or None if not found
    """
    return _get_modules().get(module_id)


def get_all_modules() -> List[BackupModule]:
    """
    Get all available backup modules.

    Returns:
        List of all BackupModule instances
    """
    return list(_get_modules().values())


def get_module_by_app_label(app_label: str) -> Optional[BackupModule]:
    """
    Get the module that contains a specific app label.

    Args:
        app_label: Django app label

    Returns:
        BackupModule instance or None if not found
    """
    for module in _get_modules().values():
        if app_label in module.app_labels:
            return module
    return None


def clear_modules_cache():
    """Clear the modules cache (useful for testing or when apps are reloaded)."""
    global _MODULES_CACHE
    _MODULES_CACHE = None
