import pytest
import factory
from django.db.models import signals

from apps.users.management.commands.init_customers_plans import Command

pytestmark = pytest.mark.django_db


class TestInitCustomerCommand:
    @factory.django.mute_signals(signals.post_save)
    def test_command_run_for_users_without_customer(self, stripe_customer_factory, tenant_factory, mocker):
        mock = mocker.patch("apps.finances.services.subscriptions.initialize_tenant")
        tenant = tenant_factory.create()
        stripe_customer_factory.create()

        Command().handle()

        mock.assert_called_once_with(tenant=tenant)
