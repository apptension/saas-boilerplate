import pytest
from unittest.mock import Mock

from ..models import TenantMembership
from ..constants import TenantUserRole, TenantType
from ..serializers import CreateTenantInvitationSerializer, AcceptTenantInvitationSerializer


pytestmark = pytest.mark.django_db


class TestCreateTenantInvitationSerializer:
    def test_create_invitation_existing_user(self, mocker, user, user_factory, tenant_factory):
        make_token = mocker.patch(
            "apps.multitenancy.tokens.TenantInvitationTokenGenerator.make_token", return_value="token"
        )
        creator = user_factory()

        tenant = tenant_factory(name="Test Tenant", type=TenantType.ORGANIZATION)

        data = {
            "email": user.email,
            "role": TenantUserRole.ADMIN,
            "tenant_id": str(tenant.id),
        }
        serializer = CreateTenantInvitationSerializer(data=data, context={'request': Mock(tenant=tenant, user=creator)})
        assert serializer.is_valid()

        result = serializer.create(serializer.validated_data)

        assert result['ok']
        assert (
            TenantMembership.objects.get_not_accepted()
            .filter(user=user, tenant=tenant, role=TenantUserRole.ADMIN)
            .exists()
        )
        make_token.assert_called_once()

    def test_create_invitation_new_user(self, mocker, user_factory, tenant_factory):
        make_token = mocker.patch(
            "apps.multitenancy.tokens.TenantInvitationTokenGenerator.make_token", return_value="token"
        )
        creator = user_factory()
        tenant = tenant_factory(name="Test Tenant", type=TenantType.ORGANIZATION)

        data = {
            "email": "new_user@example.com",
            "role": TenantUserRole.MEMBER,
            "tenant_id": str(tenant.id),
        }
        serializer = CreateTenantInvitationSerializer(data=data, context={'request': Mock(tenant=tenant, user=creator)})
        assert serializer.is_valid()

        result = serializer.create(serializer.validated_data)

        assert result['ok']
        assert (
            TenantMembership.objects.get_not_accepted()
            .filter(
                invitee_email_address='new_user@example.com',
                tenant=tenant,
                role=TenantUserRole.MEMBER,
                user__isnull=True,
            )
            .exists()
        )
        make_token.assert_called_once()

    def test_create_invitation_for_default_tenant_new_user(self, tenant_factory):
        tenant = tenant_factory(name="Test Tenant", type=TenantType.DEFAULT)

        data = {
            "email": "new_user@example.com",
            "role": TenantUserRole.MEMBER,
            "tenant_id": str(tenant.id),
        }
        serializer = CreateTenantInvitationSerializer(data=data, context={'request': Mock(tenant=tenant)})
        assert not serializer.is_valid()
        assert "Invitation for personal tenant cannot be created." in serializer.errors['non_field_errors'][0]

    def test_create_invitation_existing_user_duplicate(self, user, tenant_factory):
        tenant = tenant_factory(name="Test Tenant", type=TenantType.ORGANIZATION)
        TenantMembership.objects.create(user=user, tenant=tenant, role=TenantUserRole.ADMIN)

        data = {
            "email": user.email,
            "role": TenantUserRole.MEMBER,
            "tenant_id": str(tenant.id),
        }
        serializer = CreateTenantInvitationSerializer(data=data, context={'request': Mock(tenant=tenant)})

        assert not serializer.is_valid()
        assert 'Invitation already exists' in serializer.errors['non_field_errors'][0]


class TestAcceptTenantInvitationSerializer:
    def test_accept_invitation_auto_sets_timestamp(self, mocker, user, tenant_factory):
        """Test that accepting invitation uses model save() which auto-sets invitation_accepted_at"""
        # Create a pending membership
        tenant = tenant_factory(type=TenantType.ORGANIZATION)
        membership = TenantMembership.objects.create(
            user=user, tenant=tenant, role=TenantUserRole.MEMBER, is_accepted=False
        )

        # Mock the token check
        mocker.patch("apps.multitenancy.serializers.tenant_invitation_token.check_token", return_value=True)
        mocker.patch("apps.multitenancy.serializers.notifications.send_accepted_tenant_invitation_notification")

        # Accept the invitation
        data = {"id": str(membership.id), "token": "valid_token"}
        serializer = AcceptTenantInvitationSerializer(data=data, context={"request": Mock(user=user)})
        assert serializer.is_valid()

        result = serializer.create(serializer.validated_data)

        # Verify
        assert result["ok"]
        membership.refresh_from_db()
        assert membership.is_accepted is True
        # The key test: invitation_accepted_at should be auto-set by model's save()
        assert membership.invitation_accepted_at is not None
