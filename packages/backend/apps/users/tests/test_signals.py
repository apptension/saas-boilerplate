import pytest
from stripe.error import AuthenticationError

pytestmark = pytest.mark.django_db


class TestUserPostSaveSignal:
    def test_signal_is_not_raising_exception_on_auth_error(self, user_factory, mocker):
        mock = mocker.patch("apps.finances.services.subscriptions.initialize_user", side_effect=AuthenticationError())
        sentry_mock = mocker.patch("apps.finances.signals.logger.error")

        user_factory.create()

        mock.assert_called_once()
        sentry_mock.assert_called_once()

    def test_reraise_stripe_error(self, user_factory, totp_mock, mocker):
        initial_error = Exception
        mocker.patch("apps.finances.services.subscriptions.initialize_user", side_effect=initial_error())

        with pytest.raises(initial_error) as error:
            user_factory.create()

        assert initial_error == error.type
