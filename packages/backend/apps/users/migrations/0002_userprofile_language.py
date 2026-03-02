# Generated migration for adding language field to UserProfile

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='language',
            field=models.CharField(
                choices=[
                    ('en', 'English'),
                    ('pl', 'Polish'),
                    ('de', 'German'),
                    ('fr', 'French'),
                    ('es', 'Spanish'),
                ],
                default='en',
                help_text="User's preferred language for emails and notifications",
                max_length=5,
            ),
        ),
    ]
