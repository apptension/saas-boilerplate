"""
Management command to generate or ensure a tenant backup encryption key exists.
Works with both AWS Secrets Manager and DB fallback (BACKUP_MASTER_KEY).
"""

from django.core.management.base import BaseCommand, CommandError

from apps.backup.encryption import get_backup_encryption_service
from apps.multitenancy.models import Tenant


class Command(BaseCommand):
    help = 'Generate or ensure a backup encryption key exists for a tenant (AWS or DB fallback)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--tenant-id',
            type=str,
            required=True,
            help='Tenant ID to generate/ensure encryption key for',
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force regeneration (DB: delete and recreate; AWS: overwrite existing secret)',
        )

    def handle(self, *args, **options):
        tenant_id = options['tenant_id']
        force = options['force']

        try:
            tenant = Tenant.objects.get(pk=tenant_id)
        except Tenant.DoesNotExist:
            raise CommandError(f"Tenant with ID {tenant_id} not found")

        self.stdout.write(f"Ensuring encryption key for tenant: {tenant.name} ({tenant_id})")

        encryption_service = get_backup_encryption_service()

        if force:
            from apps.backup.models import BackupTenantEncryptionKey

            BackupTenantEncryptionKey.objects.filter(tenant=tenant).delete()
            if encryption_service.secrets_service.client:
                # AWS: overwrite by storing a new key (store_secret does put if exists)
                import base64

                new_key = encryption_service._generate_key()
                key_base64 = base64.b64encode(new_key).decode('utf-8')
                encryption_service.secrets_service.store_secret(
                    tenant_id=tenant_id,
                    secret_type='encryption_key',
                    secret_value=key_base64,
                    description=f"Backup encryption key for tenant {tenant_id}",
                )

        key = encryption_service.get_or_create_tenant_key(tenant_id)
        if key:
            self.stdout.write(self.style.SUCCESS(f"Encryption key ready for tenant {tenant_id}"))
        else:
            raise CommandError(
                f"Failed to get or create encryption key for tenant {tenant_id}. "
                "Ensure AWS credentials are set or BACKUP_MASTER_KEY is set for DB fallback."
            )
