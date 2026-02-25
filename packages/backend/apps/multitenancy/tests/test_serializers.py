import pytest
from unittest.mock import Mock

from ..models import TenantMembership, OrganizationRole, TenantMembershipRole
from ..constants import TenantUserRole, TenantType, SystemRoleType
from ..serializers import (
    CreateTenantInvitationSerializer,
    ResendTenantInvitationSerializer,
    UpdateTenantMembershipSerializer,
)


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


class TestResendTenantInvitationSerializer:
    def test_resend_invitation_for_existing_user(self, mocker, user, user_factory, tenant_factory):
        mocker.patch("apps.multitenancy.tokens.TenantInvitationTokenGenerator.make_token", return_value="token")
        # Mock where it's imported - the serializer imports notifications module and then imports from it in create()
        mock_email_instance = mocker.Mock()
        mock_send_email = mocker.patch(
            "apps.multitenancy.serializers.notifications.TenantInvitationEmail", return_value=mock_email_instance
        )
        mock_send_notification = mocker.patch(
            "apps.multitenancy.serializers.notifications.send_tenant_invitation_notification"
        )
        creator = user_factory()

        tenant = tenant_factory(name="Test Tenant", type=TenantType.ORGANIZATION)
        membership = TenantMembership.objects.create(
            user=user, tenant=tenant, role=TenantUserRole.MEMBER, is_accepted=False, creator=creator
        )

        data = {
            "id": str(membership.id),
            "tenant_id": str(tenant.id),
        }
        serializer = ResendTenantInvitationSerializer(data=data, context={'request': Mock(tenant=tenant, user=creator)})
        assert serializer.is_valid()

        result = serializer.create(serializer.validated_data)

        assert result['ok']
        mock_send_email.assert_called_once()
        mock_send_notification.assert_called_once()

    def test_resend_invitation_for_invitee_email(self, mocker, user_factory, tenant_factory):
        mocker.patch("apps.multitenancy.tokens.TenantInvitationTokenGenerator.make_token", return_value="token")
        # Mock where it's imported - the serializer imports notifications module and then imports from it in create()
        mock_email_instance = mocker.Mock()
        mock_send_email = mocker.patch(
            "apps.multitenancy.serializers.notifications.TenantInvitationEmail", return_value=mock_email_instance
        )
        mock_send_notification = mocker.patch(
            "apps.multitenancy.serializers.notifications.send_tenant_invitation_notification"
        )
        creator = user_factory()

        tenant = tenant_factory(name="Test Tenant", type=TenantType.ORGANIZATION)
        membership = TenantMembership.objects.create(
            invitee_email_address="test@example.com",
            tenant=tenant,
            role=TenantUserRole.MEMBER,
            is_accepted=False,
            creator=creator,
        )

        data = {
            "id": str(membership.id),
            "tenant_id": str(tenant.id),
        }
        serializer = ResendTenantInvitationSerializer(data=data, context={'request': Mock(tenant=tenant, user=creator)})
        assert serializer.is_valid()

        result = serializer.create(serializer.validated_data)

        assert result['ok']
        mock_send_email.assert_called_once()
        # For invitee emails without user, notification is not sent
        mock_send_notification.assert_not_called()

    def test_resend_invitation_not_found(self, user_factory, tenant_factory):
        creator = user_factory()
        tenant = tenant_factory(name="Test Tenant", type=TenantType.ORGANIZATION)

        data = {
            "id": "nonexistent-id",
            "tenant_id": str(tenant.id),
        }
        serializer = ResendTenantInvitationSerializer(data=data, context={'request': Mock(tenant=tenant, user=creator)})

        # Should fail validation because the membership doesn't exist
        assert not serializer.is_valid()

    def test_resend_invitation_already_accepted(self, user, user_factory, tenant_factory):
        creator = user_factory()
        tenant = tenant_factory(name="Test Tenant", type=TenantType.ORGANIZATION)
        membership = TenantMembership.objects.create(
            user=user, tenant=tenant, role=TenantUserRole.MEMBER, is_accepted=True, creator=creator
        )

        data = {
            "id": membership.id,
            "tenant_id": str(tenant.id),
        }
        serializer = ResendTenantInvitationSerializer(data=data, context={'request': Mock(tenant=tenant, user=creator)})

        # Should fail because it's already accepted
        assert not serializer.is_valid()


class TestUpdateTenantMembershipSerializerSecurity:
    """
    SECURITY: Tests for owner demotion protection in UpdateTenantMembershipSerializer.
    """

    def test_cannot_demote_last_legacy_owner(self, user, tenant_factory, tenant_membership_factory):
        """
        SECURITY: The last legacy owner cannot be demoted to a non-owner role.
        """
        tenant = tenant_factory(name="Test Tenant", type=TenantType.ORGANIZATION)
        owner_membership = tenant_membership_factory(
            user=user, tenant=tenant, role=TenantUserRole.OWNER, is_accepted=True
        )

        request = Mock(tenant=tenant, user=user)
        data = {'id': str(owner_membership.pk), 'role': TenantUserRole.MEMBER}
        serializer = UpdateTenantMembershipSerializer(data=data, context={'request': request})

        assert not serializer.is_valid()
        assert "at least one owner" in str(serializer.errors).lower()

    def test_can_demote_owner_when_other_legacy_owners_exist(
        self, user, user_factory, tenant_factory, tenant_membership_factory
    ):
        """
        An owner can be demoted when other legacy owners exist.
        """
        tenant = tenant_factory(name="Test Tenant", type=TenantType.ORGANIZATION)
        owner2 = user_factory(email="owner2@test.com")

        tenant_membership_factory(user=user, tenant=tenant, role=TenantUserRole.OWNER, is_accepted=True)
        owner2_membership = tenant_membership_factory(
            user=owner2, tenant=tenant, role=TenantUserRole.OWNER, is_accepted=True
        )

        request = Mock(tenant=tenant, user=user)
        data = {'id': str(owner2_membership.pk), 'role': TenantUserRole.MEMBER}
        serializer = UpdateTenantMembershipSerializer(
            instance=owner2_membership, data=data, context={'request': request}, partial=True
        )

        assert serializer.is_valid(), serializer.errors

    def test_changing_legacy_role_preserves_rbac_owner_status(
        self, user, user_factory, tenant_factory, tenant_membership_factory
    ):
        """
        Test that changing legacy role doesn't remove RBAC owner status.
        If a user has RBAC owner role, they remain an owner regardless of legacy role changes.
        """
        tenant = tenant_factory(name="Test Tenant", type=TenantType.ORGANIZATION)

        # Create a member (not legacy owner) who is also an RBAC owner
        membership = tenant_membership_factory(user=user, tenant=tenant, role=TenantUserRole.MEMBER, is_accepted=True)

        from ..permissions import create_system_roles_for_tenant

        create_system_roles_for_tenant(tenant)
        owner_role = OrganizationRole.objects.get(tenant=tenant, system_role_type=SystemRoleType.OWNER)
        TenantMembershipRole.objects.get_or_create(membership=membership, role=owner_role)

        request = Mock(tenant=tenant, user=user)
        # Changing from MEMBER to ADMIN legacy role should be allowed
        # because the user still has RBAC owner role
        data = {'id': str(membership.pk), 'role': TenantUserRole.ADMIN}
        serializer = UpdateTenantMembershipSerializer(
            instance=membership, data=data, context={'request': request}, partial=True
        )

        # Should pass because user remains owner through RBAC role
        assert serializer.is_valid(), serializer.errors

        # Verify user is still counted as an owner
        owner_count = TenantMembershipRole.objects.filter(
            membership__tenant=tenant, role__system_role_type=SystemRoleType.OWNER, membership__is_accepted=True
        ).count()
        assert owner_count == 1

    def test_can_demote_when_rbac_owner_exists(self, user, user_factory, tenant_factory, tenant_membership_factory):
        """
        A legacy owner can be demoted when an RBAC owner exists.
        """
        tenant = tenant_factory(name="Test Tenant", type=TenantType.ORGANIZATION)

        # Legacy owner to be demoted
        legacy_owner_membership = tenant_membership_factory(
            user=user, tenant=tenant, role=TenantUserRole.OWNER, is_accepted=True
        )

        from ..permissions import create_system_roles_for_tenant

        create_system_roles_for_tenant(tenant)
        owner_role = OrganizationRole.objects.get(tenant=tenant, system_role_type=SystemRoleType.OWNER)
        other_user = user_factory(email="rbac_owner@test.com")
        other_membership = tenant_membership_factory(
            user=other_user, tenant=tenant, role=TenantUserRole.MEMBER, is_accepted=True
        )
        TenantMembershipRole.objects.create(membership=other_membership, role=owner_role)

        request = Mock(tenant=tenant, user=other_user)
        data = {'id': str(legacy_owner_membership.pk), 'role': TenantUserRole.MEMBER}
        serializer = UpdateTenantMembershipSerializer(
            instance=legacy_owner_membership, data=data, context={'request': request}, partial=True
        )

        # Should pass because there's still an RBAC owner
        assert serializer.is_valid(), serializer.errors

    def test_non_owner_cannot_modify_owner_membership(
        self, user, user_factory, tenant_factory, tenant_membership_factory
    ):
        """
        SECURITY: Non-owners should not be able to modify owner memberships.
        """
        from rest_framework.exceptions import PermissionDenied

        tenant = tenant_factory(name="Test Tenant", type=TenantType.ORGANIZATION)

        # Owner membership to modify
        owner = user_factory(email="owner@test.com")
        owner_membership = tenant_membership_factory(
            user=owner, tenant=tenant, role=TenantUserRole.OWNER, is_accepted=True
        )

        # Non-owner trying to modify
        non_owner = user
        tenant_membership_factory(user=non_owner, tenant=tenant, role=TenantUserRole.ADMIN, is_accepted=True)

        request = Mock(tenant=tenant, user=non_owner)
        data = {'id': str(owner_membership.pk), 'role': TenantUserRole.MEMBER}
        serializer = UpdateTenantMembershipSerializer(
            instance=owner_membership, data=data, context={'request': request}, partial=True
        )

        # Should raise PermissionDenied due to permission check
        with pytest.raises(PermissionDenied) as exc_info:
            serializer.is_valid(raise_exception=True)

        assert "owner" in str(exc_info.value).lower()
