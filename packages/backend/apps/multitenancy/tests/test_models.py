import pytest
from unittest.mock import patch
from django.utils.text import slugify
from django.db import IntegrityError

from ..models import Tenant

pytestmark = pytest.mark.django_db


class TestTenant:
    def test_save_unique_slug_generation(self, user):
        with patch("apps.multitenancy.models.slugify", side_effect=slugify) as mock_slugify:
            tenant = Tenant(name="Test Tenant", creator=user)
            tenant.save()

            mock_slugify.assert_called_once_with("Test Tenant")
            assert tenant.slug == "test-tenant"

    def test_save_unique_slug_with_collision(self, user, tenant_factory):
        tenant_factory(name="Test Tenant", creator=user)
        with patch("apps.multitenancy.models.slugify", side_effect=slugify) as mock_slugify:
            tenant = Tenant(name="Test Tenant", creator=user)
            tenant.save()

            mock_slugify.assert_called_with("Test Tenant")
            assert mock_slugify.call_count == 2
            assert tenant.slug == "test-tenant-1"

    def test_save_unique_slug_raises_different_integrity_error(self):
        tenant = Tenant(name="Test Tenant")
        try:
            tenant.save()
        except IntegrityError as e:
            assert "not-null constraint" in str(e).lower()


class TestTenantMembership:
    def test_unique_non_null_user_and_tenant(self, tenant, user, tenant_membership_factory):
        tenant_membership_factory(user=user, tenant=tenant)
        try:
            tenant_membership_factory(user=user, tenant=tenant)
        except IntegrityError:
            pass
        else:
            assert False, "IntegrityError not raised"

    def test_unique_non_null_user_and_invitee_email_address(self, tenant, tenant_membership_factory):
        tenant_membership_factory(invitee_email_address="user@example.com", tenant=tenant)
        try:
            tenant_membership_factory(invitee_email_address="user@example.com", tenant=tenant)
        except IntegrityError:
            pass
        else:
            assert False, "IntegrityError not raised"
