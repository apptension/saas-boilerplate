import pytest
import pytest_factoryboy
from . import factories

pytest_factoryboy.register(factories.GroupFactory)
pytest_factoryboy.register(factories.UserFactory)
pytest_factoryboy.register(factories.UserProfileFactory)
pytest_factoryboy.register(factories.UserAvatarFactory)
pytest_factoryboy.register(factories.StripeCustomerFactory)


@pytest.fixture()
def image_factory():
    return factories.image_factory


@pytest.fixture
def totp_mock(mocker):
    def _factory(verify):
        totp_mock = mocker.Mock()
        totp_mock.verify.return_value = verify
        mocker.patch('pyotp.TOTP', return_value=totp_mock)

    return _factory
