"""
Management command to check backup configurations and records.
"""

from django.core.management.base import BaseCommand
from django.db.models import Count, Sum

from apps.backup.models import BackupConfig, BackupRecord
from apps.backup.modules import get_all_modules


class Command(BaseCommand):
    help = 'Check backup configurations and records'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('\n=== Backup System Status ===\n'))

        # Show available modules
        self.stdout.write('Available Backup Modules:')
        modules = get_all_modules()
        for module in modules:
            model_count = module.get_model_count()
            self.stdout.write(f"  - {module.id}: {module.name} ({model_count} models)")
            self.stdout.write(f"    Description: {module.description}")
            self.stdout.write(f"    Apps: {', '.join(module.app_labels)}")
        self.stdout.write('')

        # Show backup configs
        configs = BackupConfig.objects.select_related('tenant').all()
        self.stdout.write(f'Backup Configurations: {configs.count()}')
        for config in configs:
            status = "ENABLED" if config.enabled else "DISABLED"
            self.stdout.write(f"  - Tenant: {config.tenant.name} ({status})")
            self.stdout.write(f"    Interval: {config.backup_interval_hours} hours")
            self.stdout.write(f"    Retention: {config.retention_days} days")
            self.stdout.write(f"    Selected Modules: {config.selected_modules or 'All'}")
            if config.selected_models:
                self.stdout.write(f"    Selected Models: {config.selected_models}")
            if config.excluded_models:
                self.stdout.write(f"    Excluded Models: {config.excluded_models}")
            self.stdout.write(f"    Email Recipients: {len(config.email_recipients or [])}")
        self.stdout.write('')

        # Show backup records summary
        records = BackupRecord.objects.select_related('tenant').all()
        self.stdout.write(f'Backup Records: {records.count()}')

        status_counts = records.values('status').annotate(count=Count('id'))
        self.stdout.write('  Status Breakdown:')
        for status_info in status_counts:
            self.stdout.write(f"    - {status_info['status']}: {status_info['count']}")

        total_size = records.aggregate(total=Sum('file_size'))['total'] or 0
        self.stdout.write(f'  Total Size: {total_size / (1024*1024):.2f} MB')
        self.stdout.write('')

        # Show recent backups
        recent = records.order_by('-created_at')[:5]
        if recent:
            self.stdout.write('Recent Backups:')
            for backup in recent:
                size_mb = (backup.file_size or 0) / (1024 * 1024)
                self.stdout.write(
                    f"  - {backup.created_at.strftime('%Y-%m-%d %H:%M:%S')} | "
                    f"{backup.tenant.name} | {backup.status} | {size_mb:.2f} MB"
                )
