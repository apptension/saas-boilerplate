"""
Service for generating XML backups of tenant data.
"""

import logging
import xml.etree.ElementTree as ET
from datetime import datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional, Type

from django.db import models
from django.utils import timezone

from .registry import BackupModelRegistry

logger = logging.getLogger(__name__)


class BackupService:
    """Service for creating XML backups of tenant data."""

    def __init__(
        self,
        tenant_id: str,
        selected_modules: Optional[List[str]] = None,
        selected_models: Optional[List[str]] = None,
        excluded_models: Optional[List[str]] = None,
    ):
        """
        Initialize backup service for a tenant.

        Args:
            tenant_id: ID of the tenant to backup
            selected_modules: Optional list of module IDs to include (e.g., ['financial_data', 'user_management'])
            selected_models: Optional list of specific models to include (format: 'app_label.ModelName')
            excluded_models: Optional list of models to exclude (format: 'app_label.ModelName')
        """
        self.tenant_id = tenant_id
        self.selected_modules = selected_modules or []
        self.selected_models = selected_models or []
        self.excluded_models = excluded_models or []
        self.model_counts: Dict[str, int] = {}

    def _get_filtered_models(self) -> List[Type[models.Model]]:
        """
        Get the list of models to backup based on selection criteria.

        Returns:
            List of model classes to backup
        """
        all_models = BackupModelRegistry.get_all_models()

        # If no modules selected, return all models (backward compatibility)
        if not self.selected_modules:
            models_to_backup = all_models
        else:
            # Get models from selected modules
            models_to_backup = []
            for module_id in self.selected_modules:
                module_models = BackupModelRegistry.get_models_by_module(module_id)
                models_to_backup.extend(module_models)

            # Remove duplicates
            models_to_backup = list(set(models_to_backup))

            # If specific models are selected, filter to only those
            if self.selected_models:
                selected_model_classes = BackupModelRegistry.get_models_by_names(self.selected_models)
                # Intersection: only models that are both in modules and in selected_models
                models_to_backup = [m for m in models_to_backup if m in selected_model_classes]

        # Exclude specified models
        if self.excluded_models:
            excluded_model_classes = BackupModelRegistry.get_models_by_names(self.excluded_models)
            models_to_backup = [m for m in models_to_backup if m not in excluded_model_classes]

        return models_to_backup

    def generate_xml(self) -> str:
        """
        Generate XML backup of filtered models for the tenant.

        Returns:
            XML string containing all backup data
        """
        # Create root element
        root = ET.Element('tenant_backup')
        root.set('tenant_id', str(self.tenant_id))
        root.set('backup_timestamp', timezone.now().isoformat())
        root.set('version', '1.0')

        # Add metadata
        metadata = ET.SubElement(root, 'metadata')
        ET.SubElement(metadata, 'backup_date').text = timezone.now().isoformat()
        if self.selected_modules:
            modules_elem = ET.SubElement(metadata, 'selected_modules')
            for module_id in self.selected_modules:
                ET.SubElement(modules_elem, 'module').text = module_id

        # Get filtered models
        models_to_backup = self._get_filtered_models()

        # Create data section
        data_section = ET.SubElement(root, 'data')

        # Backup each model
        for model in models_to_backup:
            try:
                self._backup_model(model, data_section)
            except Exception as e:
                logger.error(f"Failed to backup model {model.__name__}: {e}", exc_info=True)
                # Continue with other models even if one fails

        # Add summary
        summary = ET.SubElement(root, 'summary')
        for model_name, count in self.model_counts.items():
            model_summary = ET.SubElement(summary, 'model')
            model_summary.set('name', model_name)
            model_summary.set('count', str(count))

        # Convert to string with proper formatting
        ET.indent(root, space='  ')
        return ET.tostring(root, encoding='unicode', xml_declaration=True)

    def _backup_model(self, model: type[models.Model], parent: ET.Element) -> None:
        """
        Backup all instances of a model for the tenant.

        Args:
            model: Django model class to backup
            parent: XML parent element to add model data to
        """
        model_name = model.__name__
        full_name = f"{model._meta.app_label}.{model_name}"
        logger.debug(f"Backing up model: {full_name}")

        # Query all instances for this tenant
        try:
            queryset = model.objects.filter(tenant_id=self.tenant_id)
            count = queryset.count()

            if count == 0:
                logger.debug(f"No instances found for {full_name}")
                self.model_counts[full_name] = 0
                return

            # Create model section (use full name so restore resolves uniquely when multiple apps have same class name)
            model_section = ET.SubElement(parent, 'model')
            model_section.set('name', full_name)
            model_section.set('count', str(count))

            # Backup each instance
            for instance in queryset.iterator(chunk_size=100):
                self._backup_instance(instance, model_section)

            self.model_counts[full_name] = count
            logger.debug(f"Backed up {count} instances of {full_name}")

        except Exception as e:
            logger.error(f"Error backing up model {full_name}: {e}", exc_info=True)
            self.model_counts[full_name] = 0
            raise

    def _backup_instance(self, instance: models.Model, parent: ET.Element) -> None:
        """
        Backup a single model instance to XML.

        Args:
            instance: Django model instance to backup
            parent: XML parent element to add instance data to
        """
        item = ET.SubElement(parent, 'item')

        # Get all fields from the model
        for field in instance._meta.get_fields():
            # Skip reverse relations and many-to-many (we'll handle those separately)
            if field.many_to_many or (hasattr(field, 'related_model') and field.related_model):
                continue

            field_name = field.name
            field_value = getattr(instance, field_name, None)

            # Skip None values
            if field_value is None:
                continue

            # Serialize field value
            serialized_value = self._serialize_value(field_value, field)

            if serialized_value is not None:
                field_elem = ET.SubElement(item, field_name)
                field_elem.text = str(serialized_value)

        # Handle many-to-many fields
        for field in instance._meta.get_fields():
            if field.many_to_many:
                field_name = field.name
                related_objects = getattr(instance, field_name).all()

                if related_objects.exists():
                    m2m_elem = ET.SubElement(item, field_name)
                    for related_obj in related_objects:
                        related_elem = ET.SubElement(m2m_elem, 'item')
                        related_elem.set('id', str(related_obj.pk))
                        related_elem.text = str(related_obj)

    def _serialize_value(self, value: Any, field: models.Field) -> str:
        """
        Serialize a field value to string for XML.

        Args:
            value: Field value to serialize
            field: Django field instance

        Returns:
            String representation of the value
        """
        if value is None:
            return None

        # Handle different field types
        if isinstance(value, datetime):
            return value.isoformat()

        if isinstance(value, Decimal):
            return str(value)

        if isinstance(value, bool):
            return str(value).lower()

        if isinstance(value, (list, tuple)):
            # For JSON fields that are lists
            import json

            return json.dumps(value, ensure_ascii=False)

        if isinstance(value, dict):
            # For JSON fields that are dicts
            import json

            return json.dumps(value, ensure_ascii=False)

        if isinstance(value, models.Model):
            # For ForeignKey fields, store the ID
            return str(value.pk)

        # Default: convert to string
        return str(value)
