import pytest

pytestmark = pytest.mark.django_db


class TestTenant:
    def test_incremental_slug_counter(self, tenant_factory):
        tenant = tenant_factory()
        tenant.name = "Tenant"
        tenant.save()
        assert "tenant" == tenant.slug

        tenant = tenant_factory()
        tenant.name = "Tenant"
        tenant.save()
        assert "tenant-1" == tenant.slug
