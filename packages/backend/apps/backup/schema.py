"""
GraphQL schema for backup functionality.
"""

import logging

import graphene
from graphene import relay
from graphene_django import DjangoObjectType
from graphql_relay import from_global_id, to_global_id

from common.graphql.acl import permission_classes, requires
from common.acl.policies import IsTenantMemberAccess

from apps.multitenancy import models as tenant_models
from apps.multitenancy.schema import TenantMembershipType

from . import models
from .modules import get_all_modules, get_module

logger = logging.getLogger(__name__)


# ============ Backup Types ============


class BackupConfigType(DjangoObjectType):
    """GraphQL type for BackupConfig."""

    email_recipients = graphene.List(graphene.ID, description="List of user IDs (as GraphQL global IDs)")
    selected_modules = graphene.List(graphene.String, description="List of module IDs selected for backup")
    selected_models = graphene.List(graphene.String, description="List of specific model names selected")
    excluded_models = graphene.List(graphene.String, description="List of model names excluded from backup")

    class Meta:
        model = models.BackupConfig
        interfaces = (relay.Node,)
        fields = ('id', 'enabled', 'backup_interval_hours', 'retention_days', 'created_at', 'updated_at')

    @staticmethod
    def resolve_email_recipients(parent, info):
        """Convert stored hashids to GraphQL global IDs."""
        if not parent.email_recipients:
            return []
        return [to_global_id("User", user_id) for user_id in parent.email_recipients if user_id]

    @staticmethod
    def resolve_selected_modules(parent, info):
        """Return selected module IDs."""
        return parent.selected_modules or []

    @staticmethod
    def resolve_selected_models(parent, info):
        """Return selected model names."""
        return parent.selected_models or []

    @staticmethod
    def resolve_excluded_models(parent, info):
        """Return excluded model names."""
        return parent.excluded_models or []


class BackupRecordType(DjangoObjectType):
    """GraphQL type for BackupRecord."""

    download_url = graphene.String(description="Signed download URL for the backup file")
    is_encrypted = graphene.Boolean(description="Whether this backup file is encrypted at rest")

    class Meta:
        model = models.BackupRecord
        interfaces = (relay.Node,)
        fields = "__all__"

    def resolve_download_url(self, info):
        """Generate signed download URL for the backup file."""
        return self.get_download_url()

    def resolve_is_encrypted(self, info):
        """Return whether the backup is encrypted."""
        return self.is_encrypted


class BackupRecordConnection(graphene.Connection):
    """Connection class for paginated BackupRecord lists."""

    class Meta:
        node = BackupRecordType


class RestoreRecordType(DjangoObjectType):
    """GraphQL type for RestoreRecord."""

    total_created = graphene.Int(description="Total records created across all models")
    total_updated = graphene.Int(description="Total records updated across all models")
    total_skipped = graphene.Int(description="Total records skipped across all models")
    total_failed = graphene.Int(description="Total records failed across all models")

    class Meta:
        model = models.RestoreRecord
        interfaces = (relay.Node,)
        fields = (
            'id',
            'backup_record',
            'status',
            'conflict_strategy',
            'model_counts',
            'error_message',
            'started_at',
            'completed_at',
            'created_at',
            'updated_at',
        )

    def resolve_conflict_strategy(self, info):
        """Resolve conflict_strategy, normalizing any invalid stored values."""
        value = self.conflict_strategy
        # Handle case where database has invalid value like "EnumMeta.SKIP"
        if value and "EnumMeta" in str(value):
            # Extract the strategy name from "EnumMeta.SKIP" -> "SKIP"
            if ".SKIP" in str(value):
                return "SKIP"
            elif ".UPDATE" in str(value):
                return "UPDATE"
            elif ".FAIL" in str(value):
                return "FAIL"
        # Return the value as-is if it's valid
        if value in ["SKIP", "UPDATE", "FAIL"]:
            return value
        # Default fallback
        return "SKIP"

    def resolve_total_created(self, info):
        return self.total_created

    def resolve_total_updated(self, info):
        return self.total_updated

    def resolve_total_skipped(self, info):
        return self.total_skipped

    def resolve_total_failed(self, info):
        return self.total_failed


class RestoreRecordConnection(graphene.Connection):
    """Connection class for paginated RestoreRecord lists."""

    class Meta:
        node = RestoreRecordType


# ============ Module Types ============


class BackupModuleType(graphene.ObjectType):
    """GraphQL type for a backup module."""

    id = graphene.String(description="Module identifier")
    name = graphene.String(description="Human-readable module name")
    description = graphene.String(description="Module description")
    model_count = graphene.Int(description="Number of models in this module")


class BackupModelType(graphene.ObjectType):
    """GraphQL type for a backupable model."""

    app_label = graphene.String(description="Django app label")
    model_name = graphene.String(description="Model class name")
    display_name = graphene.String(description="Human-readable model name")
    full_name = graphene.String(description="Full model name (app_label.ModelName)")


# ============ Backup Mutations ============


class BackupConfigInput(graphene.InputObjectType):
    """Input type for backup configuration."""

    tenant_id = graphene.ID(required=True)
    enabled = graphene.Boolean(required=True)
    backup_interval_hours = graphene.Int(required=True)
    retention_days = graphene.Int(required=True)
    email_recipients = graphene.List(graphene.ID, description="List of user IDs to receive email notifications")
    selected_modules = graphene.List(graphene.String, description="List of module IDs to include in backups")
    selected_models = graphene.List(
        graphene.String, description="Optional: Specific models to include (format: 'app_label.ModelName')"
    )
    excluded_models = graphene.List(
        graphene.String, description="Optional: Specific models to exclude (format: 'app_label.ModelName')"
    )


class UpdateBackupConfigMutation(graphene.Mutation):
    """Create or update backup configuration for a tenant."""

    class Arguments:
        input = BackupConfigInput(required=True)

    backup_config = graphene.Field(BackupConfigType)
    ok = graphene.Boolean()
    error = graphene.String()

    @classmethod
    def mutate(cls, root, info, input):
        from graphql import GraphQLError
        from apps.multitenancy.models import Tenant

        try:
            if not info or not hasattr(info, 'context'):
                raise GraphQLError("Invalid request context")

            _, tenant_id = from_global_id(input['tenant_id'])
            tenant = Tenant.objects.get(pk=tenant_id)

            # Verify user has access to this tenant
            user = getattr(info.context, 'user', None)
            if not user or not user.is_authenticated:
                raise GraphQLError("Authentication required")

            # Decode email recipient IDs
            email_recipient_ids = []
            if input.get('email_recipients'):
                for recipient_id in input['email_recipients']:
                    if recipient_id:  # Skip empty strings
                        try:
                            _, decoded_id = from_global_id(recipient_id)
                            if decoded_id:  # Only add if decoded ID is not empty
                                email_recipient_ids.append(decoded_id)
                        except Exception:
                            # Skip invalid IDs
                            pass

            # Get selected modules, models, and excluded models
            selected_modules = input.get('selected_modules', []) or []
            selected_models = input.get('selected_models', []) or []
            excluded_models = input.get('excluded_models', []) or []

            # Get or create backup config
            backup_config, created = models.BackupConfig.objects.update_or_create(
                tenant=tenant,
                defaults={
                    'enabled': input['enabled'],
                    'backup_interval_hours': input['backup_interval_hours'],
                    'retention_days': input['retention_days'],
                    'email_recipients': email_recipient_ids,
                    'selected_modules': selected_modules,
                    'selected_models': selected_models,
                    'excluded_models': excluded_models,
                },
            )

            return cls(backup_config=backup_config, ok=True)

        except Exception as e:
            logger.exception(f"Failed to update backup config: {e}")
            return cls(ok=False, error=str(e))


class DeleteBackupMutation(graphene.Mutation):
    """Delete a backup record and its file."""

    class Arguments:
        backup_id = graphene.ID(required=True)

    ok = graphene.Boolean()
    error = graphene.String()

    @classmethod
    def mutate(cls, root, info, backup_id):
        from graphql import GraphQLError
        from common.storages import get_exports_storage

        try:
            if not info or not hasattr(info, 'context'):
                raise GraphQLError("Invalid request context")

            _, decoded_id = from_global_id(backup_id)
            backup = models.BackupRecord.objects.get(pk=decoded_id)

            # Verify user has access to this tenant
            user = getattr(info.context, 'user', None)
            if not user or not user.is_authenticated:
                raise GraphQLError("Authentication required")

            # Delete file from storage
            if backup.file_path:
                try:
                    storage = get_exports_storage()
                    storage.delete(backup.file_path)
                except Exception as e:
                    logger.warning(f"Failed to delete backup file {backup.file_path}: {e}")

            # Delete backup record
            backup.delete()

            return cls(ok=True)

        except models.BackupRecord.DoesNotExist:
            return cls(ok=False, error="Backup not found")
        except Exception as e:
            logger.exception(f"Failed to delete backup: {e}")
            return cls(ok=False, error=str(e))


class TriggerBackupMutation(graphene.Mutation):
    """Manually trigger a backup for a tenant."""

    class Arguments:
        tenant_id = graphene.ID(required=True)

    ok = graphene.Boolean()
    error = graphene.String()
    backup_id = graphene.ID()

    @classmethod
    def mutate(cls, root, info, tenant_id):
        from graphql import GraphQLError
        from apps.multitenancy.models import Tenant
        from .tasks import create_backup

        try:
            if not info or not hasattr(info, 'context'):
                raise GraphQLError("Invalid request context")

            _, decoded_tenant_id = from_global_id(tenant_id)
            tenant = Tenant.objects.get(pk=decoded_tenant_id)

            # Verify user has access to this tenant
            user = getattr(info.context, 'user', None)
            if not user or not user.is_authenticated:
                raise GraphQLError("Authentication required")

            # Get backup config if exists
            try:
                backup_config = models.BackupConfig.objects.get(tenant=tenant)
                config_id = str(backup_config.id)
            except models.BackupConfig.DoesNotExist:
                config_id = None

            # Trigger backup task
            task = create_backup.delay(
                tenant_id=decoded_tenant_id,
                config_id=config_id,
            )

            return cls(ok=True, backup_id=None)  # Backup ID will be created by the task

        except Tenant.DoesNotExist:
            return cls(ok=False, error="Tenant not found")
        except Exception as e:
            logger.exception(f"Failed to trigger backup: {e}")
            return cls(ok=False, error=str(e))


class ConflictStrategyEnum(graphene.Enum):
    """Enum for backup restore conflict strategies."""

    SKIP = "SKIP"
    UPDATE = "UPDATE"
    FAIL = "FAIL"


class RestoreBackupMutation(graphene.Mutation):
    """Trigger a backup restoration for a tenant."""

    class Arguments:
        backup_id = graphene.ID(required=True, description="ID of the backup record to restore from")
        conflict_strategy = ConflictStrategyEnum(
            required=True,
            description="Strategy for handling conflicting records: SKIP, UPDATE, or FAIL",
        )

    ok = graphene.Boolean()
    error = graphene.String()
    restore_id = graphene.ID(description="ID of the created restore record")

    @classmethod
    def mutate(cls, root, info, backup_id, conflict_strategy):
        from graphql import GraphQLError
        from .tasks import restore_backup

        try:
            if not info or not hasattr(info, 'context'):
                raise GraphQLError("Invalid request context")

            _, decoded_id = from_global_id(backup_id)
            backup_record = models.BackupRecord.objects.get(pk=decoded_id)

            # Verify user has access
            user = getattr(info.context, 'user', None)
            if not user or not user.is_authenticated:
                raise GraphQLError("Authentication required")

            # Verify backup is completed
            if backup_record.status != models.BackupRecord.Status.COMPLETED:
                return cls(ok=False, error="Can only restore from completed backups")

            # Verify backup has a file
            if not backup_record.file_path:
                return cls(ok=False, error="Backup file not found")

            # Extract string value from Graphene enum
            # Graphene enums can be enum objects, so extract the actual value
            if hasattr(conflict_strategy, 'value'):
                conflict_strategy_value = conflict_strategy.value
            elif isinstance(conflict_strategy, str):
                conflict_strategy_value = conflict_strategy
            else:
                # Try to get the enum member name
                conflict_strategy_value = getattr(conflict_strategy, 'name', None)
                if conflict_strategy_value not in ["SKIP", "UPDATE", "FAIL"]:
                    # Last resort: convert to string and validate
                    conflict_strategy_value = str(conflict_strategy)
                    if conflict_strategy_value not in ["SKIP", "UPDATE", "FAIL"]:
                        logger.warning(
                            f"Invalid conflict_strategy: {conflict_strategy}, type: {type(conflict_strategy)}"
                        )
                        conflict_strategy_value = "SKIP"

            # Ensure it's a valid value
            if conflict_strategy_value not in ["SKIP", "UPDATE", "FAIL"]:
                return cls(ok=False, error=f"Invalid conflict strategy: {conflict_strategy_value}")

            # Create restore record
            restore_record = models.RestoreRecord.objects.create(
                tenant=backup_record.tenant,
                backup_record=backup_record,
                status=models.RestoreRecord.Status.PENDING,
                conflict_strategy=conflict_strategy_value,
            )

            # Trigger async restore task (pass as string to avoid serialization issues)
            restore_backup.delay(
                backup_record_id=str(backup_record.id),
                restore_record_id=str(restore_record.id),
                conflict_strategy=conflict_strategy_value,
            )

            restore_global_id = to_global_id('RestoreRecordType', str(restore_record.id))
            return cls(ok=True, restore_id=restore_global_id)

        except models.BackupRecord.DoesNotExist:
            return cls(ok=False, error="Backup not found")
        except Exception as e:
            logger.exception(f"Failed to trigger restore: {e}")
            return cls(ok=False, error=str(e))


# ============ Backup Queries ============
class DownloadBackupDecryptedMutation(graphene.Mutation):
    """Download a backup file with decryption applied in-memory."""

    class Arguments:
        backup_id = graphene.ID(required=True)

    content = graphene.String(description="Decrypted backup XML content")
    ok = graphene.Boolean()
    error = graphene.String()

    @classmethod
    def mutate(cls, root, info, backup_id):
        from graphql import GraphQLError
        from common.storages import get_exports_storage
        from .encryption import get_backup_encryption_service

        try:
            if not info or not hasattr(info, 'context'):
                raise GraphQLError("Invalid request context")

            _, decoded_id = from_global_id(backup_id)
            backup = models.BackupRecord.objects.get(pk=decoded_id)

            # Verify user has access to this tenant
            user = getattr(info.context, 'user', None)
            if not user or not user.is_authenticated:
                raise GraphQLError("Authentication required")

            if not backup.file_path:
                return cls(ok=False, error="Backup file not found")

            # Read backup file from storage
            storage = get_exports_storage()

            # Check if file exists before trying to read
            if not storage.exists(backup.file_path):
                logger.error(f"Backup file does not exist: {backup.file_path}")
                return cls(
                    ok=False,
                    error=f"Backup file not found at {backup.file_path}. The file may have been deleted or never saved.",
                )

            try:
                with storage.open(backup.file_path, 'rb') as f:
                    encrypted_content = f.read()
            except Exception as e:
                logger.error(f"Failed to read backup file {backup.file_path}: {e}", exc_info=True)
                return cls(ok=False, error=f"Failed to read backup file: {str(e)}")

            # Decrypt if encrypted
            if backup.is_encrypted:
                encryption_service = get_backup_encryption_service()
                decrypted_content = encryption_service.decrypt_backup(encrypted_content, str(backup.tenant_id))
                if decrypted_content is None:
                    return cls(ok=False, error="Failed to decrypt backup")
                content = decrypted_content
            else:
                # Not encrypted, use as-is
                content = encrypted_content

            # Decode to string
            try:
                xml_content = content.decode('utf-8')
            except UnicodeDecodeError as e:
                logger.error(f"Failed to decode backup content: {e}")
                return cls(ok=False, error="Failed to decode backup content")

            return cls(ok=True, content=xml_content)

        except models.BackupRecord.DoesNotExist:
            return cls(ok=False, error="Backup not found")
        except Exception as e:
            logger.exception(f"Failed to download backup: {e}")
            return cls(ok=False, error=str(e))


class BackupQuery(graphene.ObjectType):
    """Queries for backup functionality."""

    backup_config = graphene.Field(
        BackupConfigType,
        tenant_id=graphene.ID(required=True),
        description="Get backup configuration for a tenant",
    )

    backup_records = relay.ConnectionField(
        BackupRecordConnection,
        tenant_id=graphene.ID(required=True),
        description="Get backup records for a tenant",
    )

    available_backup_modules = graphene.List(
        BackupModuleType,
        tenant_id=graphene.ID(required=True),
        description="Get all available backup modules",
    )

    available_backup_models = graphene.List(
        BackupModelType,
        tenant_id=graphene.ID(required=True),
        module_id=graphene.String(required=True),
        description="Get all available models for a specific module",
    )

    restore_records = relay.ConnectionField(
        RestoreRecordConnection,
        tenant_id=graphene.ID(required=True),
        description="Get restore records for a tenant",
    )

    backup_eligible_recipients = graphene.List(
        TenantMembershipType,
        tenant_id=graphene.ID(required=True),
        description="Tenant members who have backup.manage permission (for email recipients)",
    )

    @staticmethod
    @permission_classes(IsTenantMemberAccess, requires('backup.view'))
    def resolve_backup_config(root, info, tenant_id, **kwargs):
        """Get backup configuration for a tenant."""
        _, pk = from_global_id(tenant_id)
        return models.BackupConfig.objects.filter(tenant_id=pk).first()

    @staticmethod
    @permission_classes(IsTenantMemberAccess, requires('backup.view'))
    def resolve_backup_records(root, info, tenant_id, **kwargs):
        """Get backup records for a tenant."""
        _, pk = from_global_id(tenant_id)
        queryset = models.BackupRecord.objects.filter(tenant_id=pk).order_by('-created_at')
        return queryset

    @staticmethod
    @permission_classes(IsTenantMemberAccess, requires('backup.view'))
    def resolve_available_backup_modules(root, info, tenant_id, **kwargs):
        """Get all available backup modules."""
        # Verify tenant_id is provided (permission check ensures user has access)
        from_global_id(tenant_id)  # Validate format
        modules = get_all_modules()
        return [
            BackupModuleType(
                id=module.id,
                name=module.name,
                description=module.description,
                model_count=module.get_model_count(),
            )
            for module in modules
        ]

    @staticmethod
    @permission_classes(IsTenantMemberAccess, requires('backup.view'))
    def resolve_restore_records(root, info, tenant_id, **kwargs):
        """Get restore records for a tenant."""
        _, pk = from_global_id(tenant_id)
        return models.RestoreRecord.objects.filter(tenant_id=pk).order_by('-created_at')

    @staticmethod
    @permission_classes(IsTenantMemberAccess, requires('backup.view'))
    def resolve_backup_eligible_recipients(root, info, tenant_id, **kwargs):
        """Return tenant members who have backup.manage permission (for email recipients)."""
        _, pk = from_global_id(tenant_id)
        tenant = tenant_models.Tenant.objects.filter(pk=pk).first()
        if not tenant:
            return []
        memberships = (
            tenant_models.TenantMembership.objects.filter(tenant=tenant, is_accepted=True)
            .select_related('user')
            .exclude(user__isnull=True)
        )
        result = []
        for membership in memberships:
            if membership.user and 'backup.manage' in tenant_models.get_user_permissions_for_tenant(
                membership.user, tenant
            ):
                result.append(membership)
        return result

    @staticmethod
    def _format_model_display_name(model):
        """
        Generate a human-readable display name for a model.

        Uses verbose_name if it's been explicitly customized (not just the default),
        with proper capitalization. Otherwise converts class name to readable format.
        Example: 'ProjectShare' -> 'Project Share', 'InvoiceRequest' -> 'Invoice Request'
        """
        import re

        # Get verbose_name from Meta
        verbose_name = model._meta.verbose_name

        # Check if verbose_name is explicitly set (not Django's default)
        # Django's default verbose_name is just the lowercase class name
        default_verbose_name = model.__name__.lower()

        # If verbose_name is explicitly customized (different from default), use it with capitalization
        if verbose_name and verbose_name != default_verbose_name:
            # Capitalize each word in the verbose_name
            return ' '.join(word.capitalize() for word in verbose_name.split())

        # Otherwise, convert class name to readable format
        # Insert spaces before capital letters (except the first one)
        name = model.__name__
        # Add space before capital letters (but not at the start)
        name = re.sub(r'(?<!^)(?=[A-Z])', ' ', name)
        return name

    @staticmethod
    @permission_classes(IsTenantMemberAccess, requires('backup.view'))
    def resolve_available_backup_models(root, info, tenant_id, module_id, **kwargs):
        """Get all available models for a specific module."""
        # Verify tenant_id is provided (permission check ensures user has access)
        from_global_id(tenant_id)  # Validate format
        module = get_module(module_id)
        if not module:
            return []

        models_list = module.get_models()
        return [
            BackupModelType(
                app_label=model._meta.app_label,
                model_name=model.__name__,
                display_name=BackupQuery._format_model_display_name(model),
                full_name=f"{model._meta.app_label}.{model.__name__}",
            )
            for model in models_list
        ]


# ============ Backup Mutations ============


class BackupMutation(graphene.ObjectType):
    """Mutations for backup functionality."""

    update_backup_config = permission_classes(requires('backup.manage'))(UpdateBackupConfigMutation.Field())
    delete_backup = permission_classes(requires('backup.manage'))(DeleteBackupMutation.Field())
    trigger_backup = permission_classes(requires('backup.manage'))(TriggerBackupMutation.Field())
    download_backup_decrypted = permission_classes(requires('backup.view'))(DownloadBackupDecryptedMutation.Field())
    restore_backup = permission_classes(requires('backup.manage'))(RestoreBackupMutation.Field())
