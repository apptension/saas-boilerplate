import pytest
import pytest_factoryboy
from . import factories

pytest_factoryboy.register(factories.GroupFactory)
pytest_factoryboy.register(factories.UserFactory)
pytest_factoryboy.register(factories.UserProfileFactory)
pytest_factoryboy.register(factories.UserAvatarFactory)


@pytest.fixture()
def image_factory():
    return factories.image_factory
