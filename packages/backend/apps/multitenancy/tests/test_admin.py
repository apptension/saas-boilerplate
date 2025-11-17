import pytest
from django.contrib.admin.sites import AdminSite
from django.contrib.messages.storage.fallback import FallbackStorage
from django.test import RequestFactory

from ..admin import TenantMembershipAdmin
from ..models import TenantMembership

pytestmark = pytest.mark.django_db


class TestTenantMembershipAdmin:
    def test_get_queryset_shows_pending_memberships(self, tenant_membership_factory, admin_user):
        """Test that admin shows both accepted and pending memberships"""
        # Create accepted and pending memberships
        accepted = tenant_membership_factory(is_accepted=True)
        pending = tenant_membership_factory(is_accepted=False, invitee_email_address="pending@example.com")

        # Setup admin
        site = AdminSite()
        admin = TenantMembershipAdmin(TenantMembership, site)
        request = RequestFactory().get('/admin/multitenancy/tenantmembership/')
        request.user = admin_user

        # Get queryset
        queryset = admin.get_queryset(request)

        # Both should be visible
        assert accepted in queryset
        assert pending in queryset
        assert queryset.count() >= 2

    def test_user_display_with_user(self, tenant_membership_factory):
        """Test user_display shows email when user exists"""
        membership = tenant_membership_factory(is_accepted=True)
        site = AdminSite()
        admin = TenantMembershipAdmin(TenantMembership, site)

        result = admin.user_display(membership)

        assert result == membership.user.email

    def test_user_display_without_user(self, tenant_membership_factory):
        """Test user_display shows dash when user is None"""
        membership = tenant_membership_factory(user=None, is_accepted=False, invitee_email_address="test@example.com")
        site = AdminSite()
        admin = TenantMembershipAdmin(TenantMembership, site)

        result = admin.user_display(membership)

        assert result == "—"

    def test_invitee_email_display_pending(self, tenant_membership_factory):
        """Test invitee_email_display shows email for pending invitations"""
        membership = tenant_membership_factory(user=None, is_accepted=False, invitee_email_address="invite@example.com")
        site = AdminSite()
        admin = TenantMembershipAdmin(TenantMembership, site)

        result = admin.invitee_email_display(membership)

        assert result == "invite@example.com"

    def test_invitee_email_display_accepted_without_email(self, tenant_membership_factory):
        """Test invitee_email_display shows dash for accepted memberships without invitee email"""
        membership = tenant_membership_factory(is_accepted=True, invitee_email_address="")
        site = AdminSite()
        admin = TenantMembershipAdmin(TenantMembership, site)

        result = admin.invitee_email_display(membership)

        assert result == "—"

    def test_invitee_email_display_accepted_with_email(self, tenant_membership_factory):
        """Test invitee_email_display shows historical email for accepted memberships"""
        membership = tenant_membership_factory(is_accepted=True, invitee_email_address="historical@example.com")
        site = AdminSite()
        admin = TenantMembershipAdmin(TenantMembership, site)

        result = admin.invitee_email_display(membership)

        assert "historical@example.com" in result
        assert "(accepted)" in result

    def test_status_display_accepted(self, tenant_membership_factory):
        """Test status_display for accepted membership"""
        membership = tenant_membership_factory(is_accepted=True)
        site = AdminSite()
        admin = TenantMembershipAdmin(TenantMembership, site)

        result = admin.status_display(membership)

        assert "Accepted" in result
        assert "green" in result

    def test_status_display_pending(self, tenant_membership_factory):
        """Test status_display for pending membership"""
        membership = tenant_membership_factory(is_accepted=False)
        site = AdminSite()
        admin = TenantMembershipAdmin(TenantMembership, site)

        result = admin.status_display(membership)

        assert "Pending" in result
        assert "orange" in result

    def test_accept_invitations_action(self, tenant_membership_factory, admin_user):
        """Test bulk accept invitations action"""
        # Create pending memberships
        pending1 = tenant_membership_factory(is_accepted=False)
        pending2 = tenant_membership_factory(is_accepted=False)

        site = AdminSite()
        admin = TenantMembershipAdmin(TenantMembership, site)
        request = RequestFactory().post('/admin/multitenancy/tenantmembership/')
        request.user = admin_user

        # Mock messages framework
        setattr(request, 'session', 'session')
        messages = FallbackStorage(request)
        setattr(request, '_messages', messages)

        queryset = TenantMembership.objects.get_all().filter(id__in=[pending1.id, pending2.id])

        # Execute action
        admin.accept_invitations(request, queryset)

        # Verify
        pending1.refresh_from_db()
        pending2.refresh_from_db()

        assert pending1.is_accepted is True
        assert pending2.is_accepted is True
        assert pending1.invitation_accepted_at is not None
        assert pending2.invitation_accepted_at is not None

    def test_accept_invitations_action_ignores_already_accepted(self, tenant_membership_factory, admin_user):
        """Test bulk accept action only affects pending invitations"""
        # Create one accepted and one pending
        accepted = tenant_membership_factory(is_accepted=True)
        pending = tenant_membership_factory(is_accepted=False)

        site = AdminSite()
        admin = TenantMembershipAdmin(TenantMembership, site)
        request = RequestFactory().post('/admin/multitenancy/tenantmembership/')
        request.user = admin_user

        # Mock messages framework
        setattr(request, 'session', 'session')
        messages = FallbackStorage(request)
        setattr(request, '_messages', messages)

        queryset = TenantMembership.objects.get_all().filter(id__in=[accepted.id, pending.id])

        # Execute action
        admin.accept_invitations(request, queryset)

        # Verify only pending was affected
        pending.refresh_from_db()

        assert pending.is_accepted is True
        assert pending.invitation_accepted_at is not None
