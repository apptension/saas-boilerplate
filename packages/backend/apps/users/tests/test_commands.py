import pytest
import factory
from django.db.models import signals

from apps.users.management.commands.init_customers_plans import Command

pytestmark = pytest.mark.django_db


class TestInitCustomerCommand:
    @factory.django.mute_signals(signals.post_save)
    def test_command_run_for_users_without_customer(self, stripe_customer_factory, user_factory, mocker):
        mock = mocker.patch("apps.finances.services.subscriptions.initialize_user")
        user = user_factory.create()
        stripe_customer_factory.create()

        Command().handle()

        mock.assert_called_once_with(user=user)

    @factory.django.mute_signals(signals.post_save)
    def test_command_do_not_run_for_superusers(self, user_factory, mocker):
        mock = mocker.patch("apps.finances.services.subscriptions.initialize_user")
        user_factory.create(is_superuser=True)

        Command().handle()

        mock.assert_not_called()
