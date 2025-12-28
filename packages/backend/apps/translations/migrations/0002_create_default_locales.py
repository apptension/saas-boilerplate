# Data migration to create default locales

from django.db import migrations


def create_default_locales(apps, schema_editor):
    """Create default English and Polish locales."""
    Locale = apps.get_model('translations', 'Locale')
    
    default_locales = [
        {
            'code': 'en',
            'name': 'English',
            'native_name': 'English',
            'is_default': True,
            'is_active': True,
            'rtl': False,
            'sort_order': 0,
        },
        {
            'code': 'pl',
            'name': 'Polish',
            'native_name': 'Polski',
            'is_default': False,
            'is_active': True,
            'rtl': False,
            'sort_order': 1,
        },
    ]
    
    for locale_data in default_locales:
        Locale.objects.get_or_create(
            code=locale_data['code'],
            defaults=locale_data
        )


def remove_default_locales(apps, schema_editor):
    """Remove default locales (for rollback)."""
    Locale = apps.get_model('translations', 'Locale')
    Locale.objects.filter(code__in=['en', 'pl']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('translations', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(
            create_default_locales,
            remove_default_locales
        ),
    ]

