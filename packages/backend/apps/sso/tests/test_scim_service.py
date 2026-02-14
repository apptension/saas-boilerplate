"""
Tests for SCIM service.
"""

import pytest
from apps.sso.services.scim import SCIMService, SCIMError
from apps.sso.models import SCIMToken, SSOUserLink
from apps.sso import constants
from apps.users.tests.factories import UserFactory
from apps.multitenancy.tests.factories import TenantMembershipFactory
from apps.multitenancy.models import TenantMembership
from apps.multitenancy.constants import TenantUserRole

from . import factories


pytestmark = pytest.mark.django_db


@pytest.fixture
def scim_service_setup(tenant):
    connection = factories.TenantSSOConnectionFactory(
        tenant=tenant,
        status=constants.SSOConnectionStatus.ACTIVE,
    )
    token, raw = SCIMToken.create_for_tenant(
        tenant=tenant,
        name="Test SCIM",
        sso_connection=connection,
    )
    return SCIMService(token), token, raw


class TestSCIMError:
    """Tests for SCIMError class."""

    def test_to_response_format(self):
        error = SCIMError("Test error", status=400, scim_type="invalidValue")
        response = error.to_response()
        assert response["schemas"] == ["urn:ietf:params:scim:api:messages:2.0:Error"]
        assert response["status"] == "400"
        assert response["scimType"] == "invalidValue"
        assert response["detail"] == "Test error"


class TestSCIMServiceListUsers:
    """Tests for SCIMService.list_users."""

    def test_list_users_empty(self, scim_service_setup):
        service, _, _ = scim_service_setup
        result = service.list_users()
        assert result["totalResults"] == 0
        assert result["Resources"] == []
        assert "schemas" in result

    def test_list_users_with_scim_provisioned_user(self, scim_service_setup, user, tenant):
        service, token, _ = scim_service_setup
        link = factories.SSOUserLinkFactory(
            user=user,
            sso_connection=token.sso_connection,
            idp_user_id="idp_123",
            provisioned_via_scim=True,
        )

        result = service.list_users()
        assert result["totalResults"] == 1
        assert len(result["Resources"]) == 1
        assert result["Resources"][0]["userName"] == user.email
        assert result["Resources"][0]["id"] == "idp_123"

    def test_list_users_with_filter(self, scim_service_setup, tenant):
        service, token, _ = scim_service_setup
        user1 = UserFactory(email="alice@example.com")
        user2 = UserFactory(email="bob@example.com")
        factories.SSOUserLinkFactory(
            user=user1,
            sso_connection=token.sso_connection,
            idp_user_id="alice_id",
            provisioned_via_scim=True,
        )
        factories.SSOUserLinkFactory(
            user=user2,
            sso_connection=token.sso_connection,
            idp_user_id="bob_id",
            provisioned_via_scim=True,
        )

        service, token, _ = scim_service_setup
        result = service.list_users(filter_expr='userName eq "alice@example.com"')
        assert result["totalResults"] == 1
        assert result["Resources"][0]["userName"] == "alice@example.com"

    def test_list_users_pagination(self, scim_service_setup):
        service, token, _ = scim_service_setup
        for i in range(5):
            u = UserFactory(email=f"user{i}@example.com")
            factories.SSOUserLinkFactory(
                user=u,
                sso_connection=token.sso_connection,
                idp_user_id=f"idp_{i}",
                provisioned_via_scim=True,
            )

        service, _, _ = scim_service_setup
        result = service.list_users(start_index=1, count=2)
        assert result["totalResults"] == 5
        assert len(result["Resources"]) == 2
        assert result["startIndex"] == 1
        assert result["itemsPerPage"] == 2


class TestSCIMServiceGetUser:
    """Tests for SCIMService.get_user."""

    def test_get_user_not_found(self, scim_service_setup):
        service, _, _ = scim_service_setup
        with pytest.raises(SCIMError) as exc_info:
            service.get_user("nonexistent")
        assert exc_info.value.status == 404
        assert exc_info.value.scim_type == "notFound"

    def test_get_user_by_external_id(self, scim_service_setup, user):
        service, token, _ = scim_service_setup
        factories.SSOUserLinkFactory(
            user=user,
            sso_connection=token.sso_connection,
            idp_user_id="ext_123",
            provisioned_via_scim=True,
        )
        service, _, _ = scim_service_setup
        result = service.get_user("ext_123")
        assert result["userName"] == user.email
        assert result["id"] == "ext_123"


class TestSCIMServiceCreateUser:
    """Tests for SCIMService.create_user."""

    def test_create_user_missing_username(self, scim_service_setup):
        service, _, _ = scim_service_setup
        with pytest.raises(SCIMError) as exc_info:
            service.create_user({})
        assert exc_info.value.status == 400
        assert "userName" in exc_info.value.message

    def test_create_user_duplicate_external_id(self, scim_service_setup, user):
        service, token, _ = scim_service_setup
        factories.SSOUserLinkFactory(
            user=user,
            sso_connection=token.sso_connection,
            idp_user_id="existing_id",
            provisioned_via_scim=True,
        )
        service, _, _ = scim_service_setup
        with pytest.raises(SCIMError) as exc_info:
            service.create_user({"userName": "new@example.com", "externalId": "existing_id"})
        assert exc_info.value.status == 409

    def test_create_user_success(self, scim_service_setup, tenant):
        service, _, _ = scim_service_setup
        scim_user = {
            "userName": "newuser@example.com",
            "externalId": "idp_new_123",
            "name": {"givenName": "New", "familyName": "User"},
        }
        result = service.create_user(scim_user)
        assert result["userName"] == "newuser@example.com"
        assert result["id"] == "idp_new_123"
        assert result["name"]["givenName"] == "New"
        assert result["name"]["familyName"] == "User"

        from apps.users.models import User

        user = User.objects.get(email="newuser@example.com")
        assert user.profile.first_name == "New"
        assert user.profile.last_name == "User"


class TestSCIMServiceUpdateUser:
    """Tests for SCIMService.update_user."""

    def test_update_user_not_found(self, scim_service_setup):
        service, _, _ = scim_service_setup
        with pytest.raises(SCIMError) as exc_info:
            service.update_user("nonexistent", {"name": {"givenName": "X"}})
        assert exc_info.value.status == 404

    def test_update_user_success(self, scim_service_setup, user):
        service, token, _ = scim_service_setup
        link = factories.SSOUserLinkFactory(
            user=user,
            sso_connection=token.sso_connection,
            idp_user_id="update_me",
            provisioned_via_scim=True,
        )
        user.profile.first_name = "Old"
        user.profile.last_name = "Name"
        user.profile.save()

        service, _, _ = scim_service_setup
        result = service.update_user(
            "update_me",
            {"name": {"givenName": "Updated", "familyName": "User"}},
        )
        assert result["name"]["givenName"] == "Updated"
        assert result["name"]["familyName"] == "User"

        user.refresh_from_db()
        assert user.profile.first_name == "Updated"


class TestSCIMServiceDeleteUser:
    """Tests for SCIMService.delete_user."""

    def test_delete_user_not_found(self, scim_service_setup):
        service, _, _ = scim_service_setup
        with pytest.raises(SCIMError) as exc_info:
            service.delete_user("nonexistent")
        assert exc_info.value.status == 404

    def test_delete_user_success(self, scim_service_setup, user, tenant):
        service, token, _ = scim_service_setup
        TenantMembershipFactory(user=user, tenant=tenant, is_accepted=True)
        link = factories.SSOUserLinkFactory(
            user=user,
            sso_connection=token.sso_connection,
            idp_user_id="delete_me",
            provisioned_via_scim=True,
        )

        service, _, _ = scim_service_setup
        service.delete_user("delete_me")

        assert not SSOUserLink.objects.filter(idp_user_id="delete_me").exists()
        assert not TenantMembership.objects.filter(user=user, tenant=tenant).exists()


class TestSCIMServiceListGroups:
    """Tests for SCIMService.list_groups."""

    def test_list_groups(self, scim_service_setup):
        service, _, _ = scim_service_setup
        result = service.list_groups()
        assert "Resources" in result
        assert len(result["Resources"]) == 3
        role_ids = {r["id"] for r in result["Resources"]}
        assert "role_owner" in role_ids
        assert "role_admin" in role_ids
        assert "role_member" in role_ids


class TestSCIMServiceGetGroup:
    """Tests for SCIMService.get_group."""

    def test_get_group_not_found(self, scim_service_setup):
        service, _, _ = scim_service_setup
        with pytest.raises(SCIMError) as exc_info:
            service.get_group("invalid_role")
        assert exc_info.value.status == 404

    def test_get_group_success(self, scim_service_setup):
        service, _, _ = scim_service_setup
        result = service.get_group("role_member")
        assert result["id"] == "role_member"
        assert result["displayName"] == TenantUserRole.MEMBER
