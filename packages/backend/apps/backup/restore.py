"""
Service for restoring tenant data from XML backups.

Parses the XML structure produced by BackupService.generate_xml(),
resolves model classes, handles FK dependency ordering, deserializes
field values, and applies the chosen conflict strategy.
"""

import json
import logging

import defusedxml.ElementTree as ET
from collections import defaultdict
from xml.etree.ElementTree import Element
from datetime import datetime
from decimal import Decimal, InvalidOperation
from typing import Any, Dict, List, Optional, Set, Tuple, Type

import hashid_field
from django.apps import apps
from django.db import models, transaction, IntegrityError
from django.utils import timezone
from django.utils.dateparse import parse_datetime

logger = logging.getLogger(__name__)


class RestoreConflictError(Exception):
    """Raised when a conflict is detected and the strategy is FAIL."""


class RestoreValidationError(Exception):
    """Raised when XML content is invalid or cannot be parsed."""


class RestoreService:
    """
    Service for restoring tenant data from XML backups.

    Parses the XML produced by BackupService, resolves Django model classes,
    topologically sorts by FK dependencies, deserializes field values,
    and imports records using the specified conflict strategy.
    """

    CONFLICT_SKIP = "SKIP"
    CONFLICT_UPDATE = "UPDATE"
    CONFLICT_FAIL = "FAIL"

    def __init__(self, tenant_id: str, conflict_strategy: str = "SKIP"):
        """
        Initialize restore service for a tenant.

        Args:
            tenant_id: ID of the tenant to restore data into
            conflict_strategy: One of SKIP, UPDATE, or FAIL
        """
        if conflict_strategy not in (self.CONFLICT_SKIP, self.CONFLICT_UPDATE, self.CONFLICT_FAIL):
            raise ValueError(f"Invalid conflict strategy: {conflict_strategy}")

        self.tenant_id = tenant_id
        self.conflict_strategy = conflict_strategy
        self.model_counts: Dict[str, Dict[str, int]] = {}
        self.errors: List[str] = []

    def restore_from_xml(self, xml_content: str) -> Dict[str, Dict[str, int]]:
        """
        Restore tenant data from an XML backup string.

        Args:
            xml_content: XML string produced by BackupService.generate_xml()

        Returns:
            Dictionary of model counts: {ModelName: {created: N, updated: N, skipped: N, failed: N}}

        Raises:
            RestoreValidationError: If XML is invalid
            RestoreConflictError: If FAIL strategy and a conflict is detected
        """
        # Parse XML
        try:
            root = ET.fromstring(xml_content)
        except ET.ParseError as e:
            raise RestoreValidationError(f"Invalid XML content: {e}")

        # Validate root element
        if root.tag != 'tenant_backup':
            raise RestoreValidationError(
                f"Invalid backup format: expected 'tenant_backup' root element, got '{root.tag}'"
            )

        # Find data section
        data_section = root.find('data')
        if data_section is None:
            raise RestoreValidationError("No 'data' section found in backup XML")

        # Collect all model sections from XML
        model_sections = data_section.findall('model')
        if not model_sections:
            logger.info("No model data found in backup XML, nothing to restore")
            return {}

        # Resolve model classes and prepare data
        model_data = self._resolve_model_sections(model_sections)

        # Sort models by FK dependencies (parents first)
        sorted_models = self._topological_sort(model_data)

        # Import data within a transaction
        if self.conflict_strategy == self.CONFLICT_FAIL:
            # For FAIL strategy, wrap entire operation in atomic transaction
            with transaction.atomic():
                self._import_all_models(sorted_models, model_data)
        else:
            # For SKIP/UPDATE, process each model in its own transaction
            self._import_all_models(sorted_models, model_data)

        return self.model_counts

    def _resolve_model_sections(self, model_sections: List[Element]) -> Dict[Type[models.Model], List[Element]]:
        """
        Resolve model names from XML to Django model classes.

        Args:
            model_sections: List of <model> XML elements

        Returns:
            Dictionary mapping model classes to their item elements
        """
        model_data: Dict[Type[models.Model], List[Element]] = {}

        for model_section in model_sections:
            model_name = model_section.get('name')
            if not model_name:
                logger.warning("Skipping model section without name attribute")
                continue

            # Find the model class - search all apps
            model_class = self._find_model_class(model_name)
            if model_class is None:
                logger.warning(f"Model '{model_name}' not found in any app, skipping")
                self.errors.append(f"Model '{model_name}' not found, skipped")
                continue

            items = model_section.findall('item')
            if items:
                model_data[model_class] = items

        return model_data

    def _find_model_class(self, model_name: str) -> Optional[Type[models.Model]]:
        """
        Find a Django model class by full name (app_label.ModelName) or class name.

        If model_name contains a dot, it is treated as app_label.ModelName and
        resolved via apps.get_model. Otherwise all apps are searched by class name
        (for backward compatibility with backups that only stored the class name).

        Args:
            model_name: Full name (e.g. 'management_dashboard.Invoice') or class name (e.g. 'Invoice')

        Returns:
            Model class or None if not found
        """
        if '.' in model_name:
            app_label, model_name_only = model_name.split('.', 1)
            try:
                return apps.get_model(app_label, model_name_only)
            except LookupError:
                return None
        for app_config in apps.get_app_configs():
            for model in app_config.get_models():
                if model.__name__ == model_name:
                    return model
        return None

    def _topological_sort(self, model_data: Dict[Type[models.Model], List[Element]]) -> List[Type[models.Model]]:
        """
        Sort model classes by FK dependencies so parents are restored before children.

        Uses Kahn's algorithm for topological sorting.

        Args:
            model_data: Dictionary of model classes to their data

        Returns:
            List of model classes in dependency order (parents first)
        """
        models_set = set(model_data.keys())

        # Build adjacency graph: model -> set of models it depends on
        dependencies: Dict[Type[models.Model], Set[Type[models.Model]]] = defaultdict(set)

        for model_class in models_set:
            for field in model_class._meta.get_fields():
                if (
                    isinstance(field, models.ForeignKey)
                    and field.related_model in models_set
                    and field.related_model != model_class
                ):
                    dependencies[model_class].add(field.related_model)

        # Kahn's algorithm
        # In-degree: how many dependencies each model has within our set
        in_degree: Dict[Type[models.Model], int] = {m: 0 for m in models_set}
        for model_class, deps in dependencies.items():
            in_degree[model_class] = len(deps)

        # Start with models that have no dependencies
        queue = [m for m in models_set if in_degree[m] == 0]
        sorted_result: List[Type[models.Model]] = []

        while queue:
            # Sort queue by model name for deterministic ordering
            queue.sort(key=lambda m: m.__name__)
            current = queue.pop(0)
            sorted_result.append(current)

            # Reduce in-degree for models that depend on current
            for model_class in models_set:
                if current in dependencies.get(model_class, set()):
                    in_degree[model_class] -= 1
                    if in_degree[model_class] == 0:
                        queue.append(model_class)

        # If not all models were sorted, there's a circular dependency
        if len(sorted_result) < len(models_set):
            remaining = models_set - set(sorted_result)
            logger.warning(
                f"Circular dependency detected among: {[m.__name__ for m in remaining]}. "
                "These models will be appended at the end."
            )
            sorted_result.extend(sorted(remaining, key=lambda m: m.__name__))

        return sorted_result

    def _import_all_models(
        self,
        sorted_models: List[Type[models.Model]],
        model_data: Dict[Type[models.Model], List[Element]],
    ) -> None:
        """
        Import all models in dependency order.

        Args:
            sorted_models: Models sorted by FK dependencies
            model_data: Dictionary of model classes to their item elements
        """
        # Collect M2M data to process after all objects are created
        m2m_deferred: List[Tuple[Type[models.Model], Any, Dict[str, List[str]]]] = []

        for model_class in sorted_models:
            items = model_data.get(model_class, [])
            if not items:
                continue

            model_name = model_class.__name__
            counts = {'created': 0, 'updated': 0, 'skipped': 0, 'failed': 0}

            for item_elem in items:
                try:
                    result, m2m_data = self._import_item(model_class, item_elem)
                    counts[result] += 1

                    if m2m_data and result in ('created', 'updated'):
                        # Defer M2M assignment
                        pk_elem = item_elem.find('id')
                        if pk_elem is not None and pk_elem.text:
                            m2m_deferred.append((model_class, pk_elem.text, m2m_data))

                except RestoreConflictError:
                    raise  # Re-raise for FAIL strategy
                except Exception as e:
                    logger.error(f"Failed to restore {model_name} item: {e}", exc_info=True)
                    counts['failed'] += 1
                    self.errors.append(f"{model_name}: {str(e)}")

            self.model_counts[model_name] = counts
            logger.info(
                f"Restored {model_name}: "
                f"{counts['created']} created, {counts['updated']} updated, "
                f"{counts['skipped']} skipped, {counts['failed']} failed"
            )

        # Process deferred M2M relationships
        for model_class, pk_value, m2m_data in m2m_deferred:
            try:
                self._restore_m2m(model_class, pk_value, m2m_data)
            except Exception as e:
                logger.error(f"Failed to restore M2M for {model_class.__name__} pk={pk_value}: {e}")
                self.errors.append(f"{model_class.__name__} M2M: {str(e)}")

    def _get_safe_update_values(self, model_class: Type[models.Model], field_values: Dict[str, Any]) -> Dict[str, Any]:
        """
        Return field_values safe for updating an existing instance.
        FK values from backup may reference IDs that no longer exist (e.g. after
        restore, related models got new hashids). Only set FK if the related
        object exists; otherwise use None when nullable.
        """
        safe = {}
        for attr, value in field_values.items():
            if attr == 'id':
                continue
            try:
                field = model_class._meta.get_field(attr)
            except Exception:
                safe[attr] = value
                continue
            if isinstance(field, models.ForeignKey):
                if value is None or value == '':
                    safe[attr] = None
                    continue
                if not field.related_model.objects.filter(pk=value).exists():
                    if field.null:
                        safe[attr] = None
                    else:
                        logger.debug(
                            f"Skipping FK {model_class.__name__}.{attr}={value} (related object does not exist)"
                        )
                    continue
            safe[attr] = value
        return safe

    def _fill_required_defaults(self, model_class: Type[models.Model], kwargs: Dict[str, Any]) -> Dict[str, Any]:
        """
        Fill default values for non-nullable (non-FK) fields that are missing or None
        so that create() does not violate NOT NULL constraints when backup omitted them.
        """
        result = dict(kwargs)
        for field in model_class._meta.get_fields():
            if not hasattr(field, 'column') or field.many_to_many:
                continue
            if isinstance(field, models.ForeignKey):
                continue
            if getattr(field, 'primary_key', False):
                continue
            if getattr(field, 'null', True):
                continue
            name = field.name
            if name in result and result[name] is not None:
                continue
            if isinstance(field, models.DecimalField):
                result[name] = Decimal('0')
            elif isinstance(
                field,
                (
                    models.IntegerField,
                    models.BigIntegerField,
                    models.PositiveIntegerField,
                    models.PositiveBigIntegerField,
                    models.SmallIntegerField,
                ),
            ):
                result[name] = 0
            elif isinstance(field, (models.CharField, models.TextField)):
                result[name] = ''
            elif isinstance(field, models.BooleanField):
                result[name] = False
            elif isinstance(field, models.DateTimeField):
                result[name] = timezone.now()
            elif isinstance(field, models.DateField):
                result[name] = timezone.now().date()
            elif isinstance(field, models.FloatField):
                result[name] = 0.0
        return result

    def _import_item(self, model_class: Type[models.Model], item_elem: Element) -> Tuple[str, Dict[str, List[str]]]:
        """
        Import a single item from XML into the database.

        Args:
            model_class: Django model class
            item_elem: XML element containing the item data

        Returns:
            Tuple of (result_type, m2m_data) where result_type is
            'created', 'updated', 'skipped', or 'failed',
            and m2m_data is a dict of field_name -> list of related PKs
        """
        model_name = model_class.__name__
        field_map = {f.name: f for f in model_class._meta.get_fields() if hasattr(f, 'column') or f.many_to_many}

        # Separate regular fields from M2M fields
        field_values = {}
        m2m_data: Dict[str, List[str]] = {}

        for child_elem in item_elem:
            field_name = child_elem.tag

            if field_name not in field_map:
                continue

            field = field_map[field_name]

            if field.many_to_many:
                # Collect M2M related IDs
                related_ids = []
                for related_item in child_elem.findall('item'):
                    related_id = related_item.get('id')
                    if related_id:
                        related_ids.append(related_id)
                if related_ids:
                    m2m_data[field_name] = related_ids
                continue

            # Skip the tenant field - we always use the target tenant
            if field_name == 'tenant':
                continue

            # Deserialize the field value
            try:
                value = self._deserialize_value(child_elem.text, field)
                field_values[field_name] = value
            except Exception as e:
                logger.warning(f"Failed to deserialize {model_name}.{field_name}: {e}")
                continue

        field_values['tenant_id'] = self.tenant_id
        pk_value = field_values.pop('id', None)

        if pk_value is None:
            try:
                with transaction.atomic():
                    model_class.objects.create(**self._fill_required_defaults(model_class, field_values))
                return 'created', m2m_data
            except IntegrityError as e:
                error_str = str(e).lower()
                if 'unique' in error_str or 'duplicate' in error_str:
                    if self.conflict_strategy == self.CONFLICT_SKIP:
                        return 'skipped', {}
                    if self.conflict_strategy == self.CONFLICT_FAIL:
                        raise RestoreConflictError(
                            f"Unique constraint violation: {model_name} conflicts with existing record"
                        )
                    if self.conflict_strategy == self.CONFLICT_UPDATE:
                        existing_by_unique = None
                        if model_name == 'Invoice' and 'invoice_number' in field_values:
                            existing_by_unique = model_class.objects.filter(
                                tenant_id=self.tenant_id, invoice_number=field_values['invoice_number']
                            ).first()
                        if existing_by_unique:
                            try:
                                safe_values = self._get_safe_update_values(model_class, field_values)
                                with transaction.atomic():
                                    for attr, value in safe_values.items():
                                        setattr(existing_by_unique, attr, value)
                                    existing_by_unique.save()
                                return 'updated', m2m_data
                            except Exception:
                                return 'failed', {}
                return 'failed', {}
            except Exception:
                return 'failed', {}

        # Check if record already exists
        try:
            existing = model_class.objects.filter(pk=pk_value).first()
        except Exception:
            existing = None

        if existing:
            # Record exists - apply conflict strategy
            if self.conflict_strategy == self.CONFLICT_SKIP:
                return 'skipped', {}

            elif self.conflict_strategy == self.CONFLICT_FAIL:
                raise RestoreConflictError(f"Conflict: {model_name} with pk={pk_value} already exists")

            elif self.conflict_strategy == self.CONFLICT_UPDATE:
                try:
                    safe_values = self._get_safe_update_values(model_class, field_values)
                    with transaction.atomic():
                        for attr, value in safe_values.items():
                            setattr(existing, attr, value)
                        existing.save()
                    return 'updated', m2m_data
                except IntegrityError:
                    return 'failed', {}
                except Exception:
                    return 'failed', {}
        else:
            try:
                with transaction.atomic():
                    field_values['id'] = pk_value
                    model_class.objects.create(**self._fill_required_defaults(model_class, field_values))
                return 'created', m2m_data
            except IntegrityError as e:
                error_str = str(e).lower()
                if 'unique' in error_str or 'duplicate' in error_str:
                    if self.conflict_strategy == self.CONFLICT_SKIP:
                        return 'skipped', {}
                    if self.conflict_strategy == self.CONFLICT_FAIL:
                        raise RestoreConflictError(
                            f"Unique constraint violation: {model_name} with pk={pk_value} "
                            "conflicts with existing record"
                        )
                    if self.conflict_strategy == self.CONFLICT_UPDATE:
                        existing_by_unique = None
                        if model_name == 'Invoice' and 'invoice_number' in field_values:
                            existing_by_unique = (
                                model_class.objects.filter(
                                    tenant_id=self.tenant_id, invoice_number=field_values['invoice_number']
                                )
                                .exclude(pk=pk_value)
                                .first()
                            )
                        if existing_by_unique:
                            try:
                                safe_values = self._get_safe_update_values(model_class, field_values)
                                with transaction.atomic():
                                    for attr, value in safe_values.items():
                                        setattr(existing_by_unique, attr, value)
                                    existing_by_unique.save()
                                return 'updated', m2m_data
                            except Exception:
                                return 'failed', {}
                return 'failed', {}
            except Exception:
                return 'failed', {}

    def _restore_m2m(self, model_class: Type[models.Model], pk_value: Any, m2m_data: Dict[str, List[str]]) -> None:
        """
        Restore many-to-many relationships for a model instance.

        Args:
            model_class: Django model class
            pk_value: Primary key of the instance
            m2m_data: Dictionary of field_name -> list of related PKs
        """
        try:
            instance = model_class.objects.get(pk=pk_value)
        except model_class.DoesNotExist:
            logger.warning(f"Cannot restore M2M: {model_class.__name__} pk={pk_value} not found")
            return

        for field_name, related_pks in m2m_data.items():
            try:
                m2m_manager = getattr(instance, field_name)
                # Get existing related objects by PK
                related_model = m2m_manager.model
                existing_related = related_model.objects.filter(pk__in=related_pks)
                m2m_manager.set(existing_related)
                logger.debug(
                    f"Set M2M {model_class.__name__}.{field_name}: "
                    f"{existing_related.count()}/{len(related_pks)} found"
                )
            except Exception as e:
                logger.error(f"Failed to restore M2M {model_class.__name__}.{field_name}: {e}")

    def _deserialize_value(self, text: Optional[str], field: models.Field) -> Any:
        """
        Deserialize a string value from XML back to a Python type
        based on the Django field type.

        Args:
            text: String value from XML element
            field: Django field instance

        Returns:
            Deserialized Python value
        """
        if text is None or text == '':
            if field.null:
                return None
            if isinstance(field, (models.CharField, models.TextField)):
                return ''
            return None

        # Handle ForeignKey fields - return the raw PK value
        if isinstance(field, models.ForeignKey):
            return text

        # Handle HashID fields - they store encoded string values, not integers
        if isinstance(field, (hashid_field.HashidAutoField, hashid_field.HashidField)):
            return text

        # Handle specific field types
        if isinstance(field, models.BooleanField):
            return text.lower() in ('true', '1', 'yes')

        if isinstance(field, (models.IntegerField, models.BigIntegerField)):
            return int(text)

        if isinstance(field, (models.PositiveIntegerField, models.PositiveBigIntegerField)):
            return int(text)

        if isinstance(field, models.FloatField):
            return float(text)

        if isinstance(field, models.DecimalField):
            try:
                return Decimal(text)
            except InvalidOperation:
                logger.warning(f"Invalid decimal value: {text}")
                return Decimal('0')

        if isinstance(field, models.DateTimeField):
            parsed = parse_datetime(text)
            if parsed:
                return parsed
            try:
                return datetime.fromisoformat(text)
            except ValueError:
                logger.warning(f"Invalid datetime value: {text}")
                return None

        if isinstance(field, models.DateField):
            try:
                from django.utils.dateparse import parse_date

                return parse_date(text)
            except ValueError:
                logger.warning(f"Invalid date value: {text}")
                return None

        if isinstance(field, models.JSONField):
            try:
                return json.loads(text)
            except (json.JSONDecodeError, TypeError):
                # If it's not valid JSON, return as string
                return text

        if isinstance(field, models.UUIDField):
            import uuid

            try:
                return uuid.UUID(text)
            except ValueError:
                logger.warning(f"Invalid UUID value: {text}")
                return None

        # For CharField, TextField, and others - return as string
        return text
