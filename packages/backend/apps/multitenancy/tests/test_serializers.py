import pytest
from unittest.mock import Mock

from ..models import TenantMembership
from ..constants import TenantUserRole
from ..serializers import CreateTenantInvitationSerializer


pytestmark = pytest.mark.django_db


class TestCreateTenantInvitationSerializer:
    def test_create_invitation_existing_user(self, user, tenant_factory):
        tenant = tenant_factory(name="Test Tenant")

        data = {
            "email": user.email,
            "role": TenantUserRole.ADMIN,
            "tenant_id": str(tenant.id),
        }
        serializer = CreateTenantInvitationSerializer(data=data, context={'request': Mock(tenant=tenant)})
        assert serializer.is_valid()

        result = serializer.create(serializer.validated_data)

        assert result['ok']
        assert (
            TenantMembership.objects.get_not_accepted()
            .filter(user=user, tenant=tenant, role=TenantUserRole.ADMIN)
            .exists()
        )

    def test_create_invitation_new_user(self, user, tenant_factory):
        tenant = tenant_factory(name="Test Tenant")

        data = {
            "email": "new_user@example.com",
            "role": TenantUserRole.MEMBER,
            "tenant_id": str(tenant.id),
        }
        serializer = CreateTenantInvitationSerializer(data=data, context={'request': Mock(tenant=tenant)})
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

    def test_create_invitation_existing_user_duplicate(self, user, tenant_factory):
        tenant = tenant_factory(name="Test Tenant")
        TenantMembership.objects.create(user=user, tenant=tenant, role=TenantUserRole.ADMIN)

        data = {
            "email": user.email,
            "role": TenantUserRole.MEMBER,
            "tenant_id": str(tenant.id),
        }
        serializer = CreateTenantInvitationSerializer(data=data, context={'request': Mock(tenant=tenant)})

        assert not serializer.is_valid()
        assert 'Invitation already exists' in serializer.errors['non_field_errors'][0]
