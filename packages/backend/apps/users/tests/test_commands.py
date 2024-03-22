import pytest
import factory
from django.db.models import signals

from apps.users.management.commands.init_customers_plans import Command

pytestmark = pytest.mark.django_db


class TestInitCustomerCommand:
    # NOTE: TenantFactory triggers UserFactory which generates default tenant for user. Mocks are called twice.
    @factory.django.mute_signals(signals.post_save)
    def test_command_run_for_users_without_customer(self, tenant_factory, mocker):
        mock = mocker.patch("apps.finances.services.subscriptions.initialize_tenant")
        tenant = tenant_factory.create()

        Command().handle()

        _, last_call_kwargs = mock.call_args_list[-1]

        assert last_call_kwargs == {"tenant": tenant}
