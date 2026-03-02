"""
Model registry for automatic backup inclusion.

This registry automatically discovers and includes all models from all Django apps
that inherit from TenantDependentModelMixin. New models are automatically included
unless they explicitly opt out.
"""

import logging
from typing import Type, List

from django.apps import apps
from django.db import models

from common.models import TenantDependentModelMixin

logger = logging.getLogger(__name__)


class BackupModelRegistry:
    """
    Registry for models that should be included in backups.

    Models are automatically discovered at startup. Models can opt-out by
    setting _backup_excluded = True as a class attribute.
    """

    _models: list[Type[models.Model]] = []

    @classmethod
    def register(cls, model: Type[models.Model]) -> None:
        """
        Register a model for backup.

        Args:
            model: Django model class to register
        """
        if model not in cls._models:
            cls._models.append(model)
            logger.debug(f"Registered model {model.__name__} for backup")

    @classmethod
    def unregister(cls, model: Type[models.Model]) -> None:
        """
        Unregister a model from backup.

        Args:
            model: Django model class to unregister
        """
        if model in cls._models:
            cls._models.remove(model)
            logger.debug(f"Unregistered model {model.__name__} from backup")

    @classmethod
    def get_all_models(cls) -> list[Type[models.Model]]:
        """
        Get all registered models.

        Returns:
            List of model classes registered for backup
        """
        return cls._models.copy()

    @classmethod
    def auto_discover_all(cls) -> None:
        """
        Auto-discover all TenantDependentModelMixin models from all apps.

        Discovers all models from all Django apps (excluding Django core apps)
        that inherit from TenantDependentModelMixin, unless they have
        _backup_excluded = True.
        """
        discovered_count = 0
        for app_config in apps.get_app_configs():
            # Skip Django core apps
            if app_config.name.startswith('django.'):
                continue

            for model in app_config.get_models():
                # Skip if model explicitly opts out
                if getattr(model, '_backup_excluded', False):
                    logger.debug(f"Skipping model {model.__name__} (explicitly excluded)")
                    continue

                # Only include models that inherit from TenantDependentModelMixin
                if issubclass(model, TenantDependentModelMixin):
                    cls.register(model)
                    discovered_count += 1

        logger.info(f"Auto-discovered {discovered_count} models for backup")

    @classmethod
    def get_models_by_module(cls, module_id: str) -> List[Type[models.Model]]:
        """
        Get models for a specific module.

        Args:
            module_id: The module identifier (e.g., 'financial_data')

        Returns:
            List of model classes in the specified module
        """
        from .modules import get_module

        module = get_module(module_id)
        if not module:
            return []

        module_models = module.get_models()
        # Filter to only include registered models
        return [m for m in module_models if m in cls._models]

    @classmethod
    def get_models_by_app_labels(cls, app_labels: List[str]) -> List[Type[models.Model]]:
        """
        Get models for specific app labels.

        Args:
            app_labels: List of Django app labels (e.g., ['management_dashboard', 'finances'])

        Returns:
            List of model classes from the specified apps
        """
        return [m for m in cls._models if m._meta.app_label in app_labels]

    @classmethod
    def get_models_by_names(cls, model_names: List[str]) -> List[Type[models.Model]]:
        """
        Get models by their full names (app_label.ModelName).

        Args:
            model_names: List of model names in format 'app_label.ModelName'

        Returns:
            List of model classes matching the specified names
        """
        result = []
        for model_name in model_names:
            app_label, model_name_only = model_name.split('.', 1)
            try:
                model = apps.get_model(app_label, model_name_only)
                if model in cls._models:
                    result.append(model)
            except LookupError:
                logger.warning(f"Model {model_name} not found")
                continue
        return result

    @classmethod
    def is_registered(cls, model: Type[models.Model]) -> bool:
        """
        Check if a model is registered for backup.

        Args:
            model: Django model class to check

        Returns:
            True if model is registered, False otherwise
        """
        return model in cls._models
