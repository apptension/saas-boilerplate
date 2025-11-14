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

    def test_save_auto_sets_invitation_accepted_at(self, tenant_membership_factory):
        """Test that saving accepted membership auto-sets timestamp"""
        membership = tenant_membership_factory(is_accepted=False, invitation_accepted_at=None)
        assert membership.invitation_accepted_at is None

        membership.is_accepted = True
        membership.save()

        assert membership.invitation_accepted_at is not None

    def test_save_clears_invitation_accepted_at_when_not_accepted(self, tenant_membership_factory):
        """Test that saving unaccepted membership clears timestamp"""
        from django.utils import timezone

        membership = tenant_membership_factory(is_accepted=True, invitation_accepted_at=timezone.now())

        membership.is_accepted = False
        membership.save()

        assert membership.invitation_accepted_at is None

    def test_save_doesnt_override_existing_invitation_accepted_at(self, tenant_membership_factory):
        """Test that save doesn't override existing accepted timestamp"""
        from django.utils import timezone

        original_time = timezone.now()
        membership = tenant_membership_factory(is_accepted=True, invitation_accepted_at=original_time)

        # Save again without changes
        membership.save()

        # Should keep original timestamp
        assert membership.invitation_accepted_at == original_time

    def test_model_str_with_user(self, tenant_membership_factory):
        """Test __str__ method with user"""
        membership = tenant_membership_factory(is_accepted=True)
        result = str(membership)

        assert membership.user.email in result
        assert membership.tenant.name in result
        assert membership.role in result

    def test_model_str_without_user(self, tenant_membership_factory):
        """Test __str__ method without user (pending invitation)"""
        membership = tenant_membership_factory(user=None, is_accepted=False, invitee_email_address="test@example.com")
        result = str(membership)

        assert "test@example.com" in result
        assert "pending" in result
        assert membership.tenant.name in result

    def test_clean_raises_error_for_invalid_state(self, tenant_membership_factory):
        """Test clean method validates data consistency"""
        from django.core.exceptions import ValidationError
        from django.utils import timezone

        membership = tenant_membership_factory(is_accepted=False, invitation_accepted_at=None)

        # Manually set invalid state (pending with accepted date)
        membership.is_accepted = False
        membership.invitation_accepted_at = timezone.now()

        # Should raise ValidationError
        with pytest.raises(ValidationError):
            membership.clean()
