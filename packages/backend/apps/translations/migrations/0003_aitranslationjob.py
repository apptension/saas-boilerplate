"""
Migration for AI Translation Job model.
"""

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('translations', '0002_create_default_locales'),
    ]

    operations = [
        migrations.CreateModel(
            name='AITranslationJob',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(
                    choices=[
                        ('pending', 'Pending'),
                        ('in_progress', 'In Progress'),
                        ('completed', 'Completed'),
                        ('failed', 'Failed'),
                        ('cancelled', 'Cancelled')
                    ],
                    db_index=True,
                    default='pending',
                    max_length=20
                )),
                ('total_keys', models.PositiveIntegerField(default=0)),
                ('processed_keys', models.PositiveIntegerField(default=0)),
                ('failed_keys', models.PositiveIntegerField(default=0)),
                ('skipped_keys', models.PositiveIntegerField(
                    default=0,
                    help_text='Keys skipped (already translated)'
                )),
                ('overwrite_existing', models.BooleanField(
                    default=False,
                    help_text='Whether to overwrite existing translations'
                )),
                ('auto_publish', models.BooleanField(
                    default=False,
                    help_text='Automatically set status to Published after translation'
                )),
                ('batch_size', models.PositiveIntegerField(
                    default=20,
                    help_text='Number of keys to translate in each batch'
                )),
                ('error_message', models.TextField(blank=True)),
                ('failed_key_ids', models.JSONField(
                    blank=True,
                    default=list,
                    help_text='List of key IDs that failed to translate'
                )),
                ('celery_task_id', models.CharField(blank=True, max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('started_at', models.DateTimeField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('created_by', models.ForeignKey(
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='ai_translation_jobs',
                    to=settings.AUTH_USER_MODEL
                )),
                ('source_locale', models.ForeignKey(
                    help_text='Source locale to translate from',
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='ai_jobs_as_source',
                    to='translations.locale'
                )),
                ('target_locale', models.ForeignKey(
                    help_text='Target locale to translate to',
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='ai_jobs_as_target',
                    to='translations.locale'
                )),
            ],
            options={
                'verbose_name': 'AI Translation Job',
                'verbose_name_plural': 'AI Translation Jobs',
                'ordering': ['-created_at'],
            },
        ),
    ]

