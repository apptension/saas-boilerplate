import pytest
import pytest_factoryboy

from . import factories
from apps.users.tests.factories import UserFactory

pytest_factoryboy.register(factories.TenantFactory)
pytest_factoryboy.register(factories.TenantMembershipFactory)


@pytest.fixture
def admin_user():
    """Create a superuser for admin tests"""
    return UserFactory(is_superuser=True, admin=True)
