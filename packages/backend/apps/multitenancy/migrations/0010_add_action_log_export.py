# Generated manually

import django.db.models.deletion
import hashid_field.field
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('multitenancy', '0009_add_action_log'),
    ]

    operations = [
        migrations.CreateModel(
            name='ActionLogExport',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', hashid_field.field.HashidAutoField(
                    alphabet='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890',
                    min_length=7,
                    prefix='',
                    primary_key=True,
                    serialize=False
                )),
                ('status', models.CharField(
                    choices=[
                        ('pending', 'Pending'),
                        ('processing', 'Processing'),
                        ('completed', 'Completed'),
                        ('failed', 'Failed'),
                    ],
                    default='pending',
                    max_length=20
                )),
                ('error_message', models.TextField(blank=True)),
                ('started_at', models.DateTimeField(blank=True, null=True)),
                ('completed_at', models.DateTimeField(blank=True, null=True)),
                ('filters', models.JSONField(
                    default=dict,
                    help_text='Filter parameters used for the export'
                )),
                ('file_path', models.CharField(
                    blank=True,
                    help_text='Path to the generated file in storage',
                    max_length=500
                )),
                ('file_size', models.BigIntegerField(
                    blank=True,
                    help_text='Size of the generated file in bytes',
                    null=True
                )),
                ('log_count', models.IntegerField(
                    blank=True,
                    help_text='Number of logs in the export',
                    null=True
                )),
                ('celery_task_id', models.CharField(blank=True, max_length=255)),
                ('requested_by', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='action_log_exports',
                    to=settings.AUTH_USER_MODEL
                )),
                ('tenant', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='action_log_exports',
                    to='multitenancy.tenant'
                )),
            ],
            options={
                'verbose_name': 'Action Log Export',
                'verbose_name_plural': 'Action Log Exports',
                'ordering': ['-created_at'],
            },
        ),
    ]
