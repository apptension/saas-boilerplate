import pytest_factoryboy

from . import factories

pytest_factoryboy.register(factories.UserFactory)
pytest_factoryboy.register(factories.UserProfileFactory)
