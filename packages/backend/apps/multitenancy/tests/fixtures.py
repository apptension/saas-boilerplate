import pytest_factoryboy

from . import factories

pytest_factoryboy.register(factories.TenantFactory)
pytest_factoryboy.register(factories.TenantMembershipFactory)
