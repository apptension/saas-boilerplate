"""
Just-in-Time (JIT) Provisioning service.
Handles automatic user creation and updates during SSO authentication.
"""

import logging
from typing import Tuple

from django.db import transaction
from django.utils import timezone

from apps.users.models import User
from apps.multitenancy.models import TenantMembership, TenantMembershipRole, OrganizationRole
from apps.multitenancy.constants import TenantUserRole, SystemRoleType
from apps.multitenancy.permissions import create_system_roles_for_tenant
from apps.sso.models import (
    TenantSSOConnection,
    SSOUserLink,
    SSOAuditLog,
)
from apps.sso.constants import SSOAuditEventType

logger = logging.getLogger(__name__)


class JITProvisioningService:
    """
    Just-in-Time provisioning service for SSO users.

    Handles:
    - Creating users on first SSO login
    - Updating user attributes on subsequent logins
    - Mapping IdP groups to tenant roles
    - Creating tenant memberships
    """

    def __init__(self, sso_connection: TenantSSOConnection):
        """
        Initialize the provisioning service.

        Args:
            sso_connection: The SSO connection configuration
        """
        self.connection = sso_connection
        self.tenant = sso_connection.tenant

    @transaction.atomic
    def provision_or_update_user(
        self,
        idp_user_id: str,
        email: str,
        first_name: str = "",
        last_name: str = "",
        groups: list = None,
        raw_attributes: dict = None,
        ip_address: str = None,
        user_agent: str = "",
    ) -> Tuple[User, SSOUserLink, bool]:
        """
        Provision a new user or update an existing one.

        Args:
            idp_user_id: Unique identifier from the IdP
            email: User's email address
            first_name: User's first name
            last_name: User's last name
            groups: List of IdP group memberships
            raw_attributes: Raw attributes from the IdP
            ip_address: Request IP for audit
            user_agent: Request user agent for audit

        Returns:
            Tuple of (user, sso_link, is_new_user)
        """
        groups = groups or []
        raw_attributes = raw_attributes or {}

        # Check for existing SSO link
        existing_link = (
            SSOUserLink.objects.filter(
                sso_connection=self.connection,
                idp_user_id=idp_user_id,
            )
            .select_related("user")
            .first()
        )

        if existing_link:
            # Update existing user
            user = existing_link.user
            is_new = False

            # Update link attributes
            existing_link.idp_email = email
            existing_link.idp_first_name = first_name
            existing_link.idp_last_name = last_name
            existing_link.idp_groups = groups
            existing_link.idp_raw_attributes = raw_attributes
            existing_link.save()

            # Update user profile if attributes changed
            self._update_user_profile(user, first_name, last_name)

            # Ensure tenant membership exists (handles case where user was removed or never added)
            role = self.connection.get_role_for_groups(groups)
            self._ensure_tenant_membership(user, role)

            # Update role based on groups (may upgrade/downgrade if group mapping changed)
            self._update_user_role(user, groups)

            self._log_event(
                event_type=SSOAuditEventType.USER_UPDATED,
                user=user,
                description=f"User {email} updated via SSO",
                ip_address=ip_address,
                user_agent=user_agent,
            )

            link = existing_link

        else:
            # Check if JIT provisioning is enabled
            if not self.connection.jit_provisioning_enabled:
                raise ValueError("JIT provisioning is disabled. User must be pre-provisioned via SCIM.")

            # Check domain restrictions
            if not self._is_domain_allowed(email):
                raise ValueError("Email domain is not allowed for this SSO connection.")

            # Look for existing user by email
            user = User.objects.filter(email__iexact=email).first()

            if user:
                # Link existing user to SSO
                is_new = False
            else:
                # Create new user
                user = self._create_user(email, first_name, last_name)
                is_new = True

            # Create SSO link
            link = SSOUserLink.objects.create(
                user=user,
                sso_connection=self.connection,
                idp_user_id=idp_user_id,
                idp_email=email,
                idp_first_name=first_name,
                idp_last_name=last_name,
                idp_groups=groups,
                idp_raw_attributes=raw_attributes,
                provisioned_via_jit=True,
            )

            # Create or update tenant membership
            role = self.connection.get_role_for_groups(groups)
            membership = TenantMembership.objects.filter(
                user=user,
                tenant=self.tenant,
            ).first()
            old_role = membership.role if membership else None
            self._ensure_tenant_membership(user, role)

            event_type = SSOAuditEventType.USER_PROVISIONED if is_new else SSOAuditEventType.USER_UPDATED
            self._log_event(
                event_type=event_type,
                user=user,
                description=f"User {email} {'provisioned' if is_new else 'linked'} via JIT",
                metadata={'groups': groups, 'old_role': old_role, 'new_role': role},
                ip_address=ip_address,
                user_agent=user_agent,
            )

        # Record login on the link
        link.record_login()

        # Update connection stats
        self.connection.last_login_at = timezone.now()
        self.connection.login_count += 1
        self.connection.save(update_fields=["last_login_at", "login_count"])

        return user, link, is_new if not existing_link else False

    def _create_user(self, email: str, first_name: str, last_name: str) -> User:
        """Create a new user with profile."""
        # Create user without password (SSO-only)
        user = User.objects.create_user(email=email, password=None)
        user.set_unusable_password()
        user.is_confirmed = True  # SSO users are confirmed via IdP
        user.save()

        # Update profile
        if hasattr(user, "profile"):
            user.profile.first_name = first_name
            user.profile.last_name = last_name
            user.profile.save()

        return user

    def _update_user_profile(self, user: User, first_name: str, last_name: str):
        """Update user profile with IdP attributes."""
        if hasattr(user, "profile"):
            profile = user.profile
            changed = False

            if first_name and profile.first_name != first_name:
                profile.first_name = first_name
                changed = True

            if last_name and profile.last_name != last_name:
                profile.last_name = last_name
                changed = True

            if changed:
                profile.save()

    def _update_user_role(self, user: User, groups: list):
        """Update user's tenant role based on IdP groups."""
        role = self.connection.get_role_for_groups(groups)

        membership = TenantMembership.objects.filter(
            user=user,
            tenant=self.tenant,
        ).first()

        if not membership:
            return

        if membership.role != role:
            role_priority = {
                TenantUserRole.OWNER: 3,
                TenantUserRole.ADMIN: 2,
                TenantUserRole.MEMBER: 1,
            }

            current_priority = role_priority.get(membership.role, 0)
            new_priority = role_priority.get(role, 0)

            if new_priority >= current_priority:
                old_role = membership.role
                membership.role = role
                membership.save(update_fields=["role", "updated_at"])

                # Update RBAC role to match
                self._sync_rbac_role(membership, role, user)

                self._log_event(
                    event_type=SSOAuditEventType.GROUP_MAPPING_APPLIED,
                    user=user,
                    description=f"Role updated to {role} based on group mapping",
                    metadata={"groups": groups, "old_role": old_role, "new_role": role},
                )
        else:
            # Even if legacy role matches, ensure RBAC role exists
            self._ensure_rbac_role(membership, role, user)

    def _sync_rbac_role(self, membership: TenantMembership, legacy_role: str, user: User):
        """Replace existing RBAC system roles with the one matching the new legacy role."""
        system_role_type = self.LEGACY_TO_SYSTEM_ROLE.get(legacy_role, SystemRoleType.MEMBER)

        if not OrganizationRole.objects.filter(tenant=self.tenant, system_role_type__isnull=False).exists():
            create_system_roles_for_tenant(self.tenant)

        # Remove existing system role assignments (keep custom roles untouched)
        TenantMembershipRole.objects.filter(
            membership=membership,
            role__system_role_type__isnull=False,
        ).delete()

        org_role = OrganizationRole.objects.filter(
            tenant=self.tenant,
            system_role_type=system_role_type,
        ).first()

        if org_role:
            TenantMembershipRole.objects.create(
                membership=membership,
                role=org_role,
                assigned_by=user,
            )

    # Maps legacy TenantUserRole values to SystemRoleType values
    LEGACY_TO_SYSTEM_ROLE = {
        TenantUserRole.OWNER: SystemRoleType.OWNER,
        TenantUserRole.ADMIN: SystemRoleType.ADMIN,
        TenantUserRole.MEMBER: SystemRoleType.MEMBER,
    }

    def _ensure_tenant_membership(self, user: User, role: str):
        """Ensure user has a membership in the tenant with proper RBAC role."""
        membership, created = TenantMembership.objects.get_or_create(
            user=user,
            tenant=self.tenant,
            defaults={
                "role": role,
                "is_accepted": True,
                "invitation_accepted_at": timezone.now(),
            },
        )

        if not created and not membership.is_accepted:
            membership.is_accepted = True
            membership.invitation_accepted_at = timezone.now()
            membership.save(update_fields=["is_accepted", "invitation_accepted_at"])

        self._ensure_rbac_role(membership, role, user)

        return membership

    def _ensure_rbac_role(self, membership: TenantMembership, legacy_role: str, user: User):
        """Assign the corresponding RBAC system role to the membership."""
        system_role_type = self.LEGACY_TO_SYSTEM_ROLE.get(legacy_role, SystemRoleType.MEMBER)

        # Ensure system roles exist for this tenant
        if not OrganizationRole.objects.filter(tenant=self.tenant, system_role_type__isnull=False).exists():
            create_system_roles_for_tenant(self.tenant)

        org_role = OrganizationRole.objects.filter(
            tenant=self.tenant,
            system_role_type=system_role_type,
        ).first()

        if org_role:
            TenantMembershipRole.objects.get_or_create(
                membership=membership,
                role=org_role,
                defaults={'assigned_by': user},
            )

    def _is_domain_allowed(self, email: str) -> bool:
        """Check if the email domain is allowed for this SSO connection."""
        if not self.connection.allowed_domains:
            # No restrictions
            return True

        domain = email.split("@")[-1].lower()
        return domain in [d.lower() for d in self.connection.allowed_domains]

    def _log_event(
        self,
        event_type: str,
        user: User = None,
        description: str = "",
        metadata: dict = None,
        ip_address: str = None,
        user_agent: str = "",
    ):
        """Log an audit event."""
        SSOAuditLog.log_event(
            event_type=event_type,
            tenant=self.tenant,
            user=user,
            sso_connection=self.connection,
            description=description,
            ip_address=ip_address,
            user_agent=user_agent,
            metadata=metadata or {},
        )
