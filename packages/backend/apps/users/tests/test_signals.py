import pytest
from stripe.error import AuthenticationError

pytestmark = pytest.mark.django_db


class TestUserPostSaveSignal:
    # NOTE: TenantFactory triggers UserFactory which generates default tenant for user. Mocks are called twice.
    def test_signal_is_not_raising_exception_on_auth_error(self, tenant_factory, mocker):
        mock = mocker.patch("apps.finances.services.subscriptions.initialize_tenant", side_effect=AuthenticationError())
        sentry_mock = mocker.patch("apps.finances.signals.logger.error")

        tenant = tenant_factory.create()

        _, last_call_kwargs = mock.call_args_list[-1]

        assert last_call_kwargs == {"tenant": tenant}
        assert sentry_mock.call_count == 2

    def test_reraise_stripe_error(self, tenant_factory, totp_mock, mocker):
        initial_error = Exception
        mocker.patch("apps.finances.services.subscriptions.initialize_tenant", side_effect=initial_error())

        with pytest.raises(initial_error) as error:
            tenant_factory.create()

        assert initial_error == error.type
