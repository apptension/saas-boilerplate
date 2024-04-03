from django.db import migrations
from django.utils.text import slugify
from django.apps.registry import apps as global_apps

from ..constants import TenantType, TenantUserRole


def move_user_to_tenant(apps, schema_editor):
    Customer = apps.get_model('djstripe', 'Customer')
    Tenant = apps.get_model('multitenancy', 'Tenant')
    User = apps.get_model('users', 'User')
    connection = schema_editor.connection

    for customer in Customer.objects.all():
        default_tenant = Tenant.objects.filter(type=TenantType.DEFAULT, creator_id=customer.subscriber_id).first()
        if not default_tenant:
            user = User.objects.filter(pk=customer.subscriber_id).first()
            default_tenant = Tenant.objects.create(
                creator_id=customer.subscriber_id, type=TenantType.DEFAULT, name=user.email, slug=slugify(user.email))
            default_tenant.members.add(
                customer.subscriber_id,
                through_defaults={"tenant": default_tenant, "role": TenantUserRole.OWNER, "is_accepted": True}
            )
        tenant_id = default_tenant.id.id
        customer_id = customer.id
        with connection.cursor() as cursor:
            cursor.execute(
                "UPDATE djstripe_customer SET new_subscriber_id = %s WHERE id = %s",
                [tenant_id, customer_id],
            )


def revert_move_user_to_tenant(apps, schema_editor):
    Customer = global_apps.get_model('djstripe', 'Customer')
    Tenant = apps.get_model('multitenancy', 'Tenant')
    connection = schema_editor.connection

    for customer in Customer.objects.all():
        connected_tenant = Tenant.objects.filter(pk=customer.subscriber_id).first()
        if connected_tenant and connected_tenant.type == TenantType.DEFAULT:
            tenant_id = connected_tenant.creator_id.id
            customer_id = customer.id
            with connection.cursor() as cursor:
                cursor.execute(
                    "UPDATE djstripe_customer SET new_subscriber_id = %s WHERE id = %s",
                    [tenant_id, customer_id],
                )


class Migration(migrations.Migration):
    dependencies = [
        ('multitenancy', '0003_alter_tenantmembership_unique_together_and_more'),
        ('djstripe', '0012_2_8'),
    ]

    operations = [
        # SQL for adding the new_subscriber_id column with foreign key definition
        migrations.RunSQL(
            'ALTER TABLE djstripe_customer ADD COLUMN new_subscriber_id integer REFERENCES multitenancy_tenant(id);',
            reverse_sql=[
                'ALTER TABLE djstripe_customer DROP COLUMN subscriber_id;',
                'ALTER TABLE djstripe_customer RENAME COLUMN new_subscriber_id TO subscriber_id;'
            ],
        ),

        # Python function to move user data to tenant
        migrations.RunPython(move_user_to_tenant, revert_move_user_to_tenant),

        # SQL for removing the old subscriber_id column and renaming the new_subscriber_id column back to subscriber_id
        migrations.RunSQL(
            [
                'ALTER TABLE djstripe_customer DROP COLUMN subscriber_id;',
                'ALTER TABLE djstripe_customer RENAME COLUMN new_subscriber_id TO subscriber_id;'
            ],
            reverse_sql=[
                'ALTER TABLE djstripe_customer ADD COLUMN new_subscriber_id integer REFERENCES users_user(id);',
            ]
        ),
    ]
