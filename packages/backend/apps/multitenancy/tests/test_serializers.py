import pytest
from unittest.mock import Mock

from ..models import TenantMembership
from ..constants import TenantUserRole, TenantType
from ..serializers import CreateTenantInvitationSerializer


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
