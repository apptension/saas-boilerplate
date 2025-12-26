"""
SCIM 2.0 (System for Cross-domain Identity Management) implementation.
Provides directory synchronization endpoints for user and group provisioning.
"""

import logging
from typing import Optional, Dict, Any, List, Tuple
from datetime import datetime

from django.db import transaction
from django.utils import timezone

from apps.users.models import User, UserProfile
from apps.multitenancy.models import Tenant, TenantMembership
from apps.multitenancy.constants import TenantUserRole
from apps.sso.models import SCIMToken, SSOUserLink, SSOAuditLog, TenantSSOConnection
from apps.sso.constants import SSOAuditEventType

logger = logging.getLogger(__name__)


class SCIMError(Exception):
    """SCIM error with status code and details."""
    
    def __init__(self, message: str, status: int = 400, scim_type: str = 'invalidValue'):
        self.message = message
        self.status = status
        self.scim_type = scim_type
        super().__init__(message)
    
    def to_response(self) -> Dict[str, Any]:
        """Convert to SCIM error response format."""
        return {
            'schemas': ['urn:ietf:params:scim:api:messages:2.0:Error'],
            'status': str(self.status),
            'scimType': self.scim_type,
            'detail': self.message,
        }


class SCIMService:
    """
    SCIM 2.0 Service implementation.
    Handles user and group provisioning/deprovisioning from IdPs.
    """
    
    # SCIM schema URIs
    USER_SCHEMA = 'urn:ietf:params:scim:schemas:core:2.0:User'
    GROUP_SCHEMA = 'urn:ietf:params:scim:schemas:core:2.0:Group'
    ENTERPRISE_USER_SCHEMA = 'urn:ietf:params:scim:schemas:extension:enterprise:2.0:User'
    LIST_RESPONSE_SCHEMA = 'urn:ietf:params:scim:api:messages:2.0:ListResponse'
    
    def __init__(self, token: SCIMToken):
        """
        Initialize SCIM service with authenticated token.
        
        Args:
            token: Authenticated SCIMToken instance
        """
        self.token = token
        self.tenant = token.tenant
        self.sso_connection = token.sso_connection
    
    def _log_event(
        self,
        event_type: str,
        user: User = None,
        description: str = '',
        metadata: dict = None,
        success: bool = True,
        error_message: str = '',
        ip_address: str = None,
    ):
        """Log a SCIM audit event."""
        SSOAuditLog.log_event(
            event_type=event_type,
            tenant=self.tenant,
            user=user,
            sso_connection=self.sso_connection,
            description=description,
            metadata=metadata or {},
            success=success,
            error_message=error_message,
            ip_address=ip_address,
        )
    
    # ==================
    # User Operations
    # ==================
    
    def list_users(
        self,
        filter_expr: str = None,
        start_index: int = 1,
        count: int = 100,
    ) -> Dict[str, Any]:
        """
        List users in SCIM format.
        
        Args:
            filter_expr: SCIM filter expression (e.g., 'userName eq "john@example.com"')
            start_index: 1-based starting index for pagination
            count: Number of results to return
        
        Returns:
            SCIM ListResponse
        """
        # Get all users that are members of this tenant via SSO
        queryset = SSOUserLink.objects.filter(
            sso_connection__tenant=self.tenant,
            provisioned_via_scim=True,
        ).select_related('user', 'user__profile')
        
        # Apply filter if provided
        if filter_expr:
            queryset = self._apply_user_filter(queryset, filter_expr)
        
        total_count = queryset.count()
        
        # Paginate
        start = max(0, start_index - 1)  # Convert to 0-based
        queryset = queryset[start:start + count]
        
        # Format response
        resources = [self._user_to_scim(link.user, link) for link in queryset]
        
        return {
            'schemas': [self.LIST_RESPONSE_SCHEMA],
            'totalResults': total_count,
            'startIndex': start_index,
            'itemsPerPage': len(resources),
            'Resources': resources,
        }
    
    def get_user(self, scim_id: str) -> Dict[str, Any]:
        """
        Get a single user by SCIM ID.
        
        Args:
            scim_id: SCIM identifier (user's external ID or internal ID)
        
        Returns:
            SCIM User resource
        
        Raises:
            SCIMError: If user not found
        """
        link = self._find_user_link(scim_id)
        if not link:
            raise SCIMError('User not found', status=404, scim_type='notFound')
        
        return self._user_to_scim(link.user, link)
    
    @transaction.atomic
    def create_user(self, scim_user: Dict[str, Any], ip_address: str = None) -> Dict[str, Any]:
        """
        Create a new user from SCIM data.
        
        Args:
            scim_user: SCIM User resource
            ip_address: Request IP for audit
        
        Returns:
            Created SCIM User resource
        
        Raises:
            SCIMError: If creation fails
        """
        # Extract required fields
        user_name = scim_user.get('userName')
        if not user_name:
            raise SCIMError('userName is required', status=400)
        
        external_id = scim_user.get('externalId', user_name)
        
        # Check if user already exists
        existing_link = SSOUserLink.objects.filter(
            sso_connection__tenant=self.tenant,
            idp_user_id=external_id,
        ).first()
        
        if existing_link:
            raise SCIMError('User already exists', status=409, scim_type='uniqueness')
        
        # Extract name
        name = scim_user.get('name', {})
        first_name = name.get('givenName', '')
        last_name = name.get('familyName', '')
        
        # Extract email
        emails = scim_user.get('emails', [])
        email = user_name  # Default to userName
        for e in emails:
            if isinstance(e, dict):
                if e.get('primary') or not email:
                    email = e.get('value')
            elif isinstance(e, str):
                email = e
        
        # Check if user with this email exists
        existing_user = User.objects.filter(email__iexact=email).first()
        
        if existing_user:
            # Link existing user
            user = existing_user
        else:
            # Create new user
            user = User.objects.create_user(email=email)
        
        # Update profile
        if hasattr(user, 'profile'):
            user.profile.first_name = first_name
            user.profile.last_name = last_name
            user.profile.save()
        
        # Create tenant membership if not exists
        membership, _ = TenantMembership.objects.get_or_create(
            user=user,
            tenant=self.tenant,
            defaults={
                'role': TenantUserRole.MEMBER,
                'is_accepted': True,
            }
        )
        
        # Create SSO link
        link = SSOUserLink.objects.create(
            user=user,
            sso_connection=self.sso_connection or self._get_default_connection(),
            idp_user_id=external_id,
            idp_email=email,
            idp_first_name=first_name,
            idp_last_name=last_name,
            provisioned_via_scim=True,
        )
        
        self._log_event(
            event_type=SSOAuditEventType.SCIM_USER_CREATED,
            user=user,
            description=f'User {email} created via SCIM',
            metadata={'external_id': external_id},
            ip_address=ip_address,
        )
        
        return self._user_to_scim(user, link)
    
    @transaction.atomic
    def update_user(
        self,
        scim_id: str,
        scim_user: Dict[str, Any],
        ip_address: str = None,
    ) -> Dict[str, Any]:
        """
        Update an existing user.
        
        Args:
            scim_id: SCIM identifier
            scim_user: Updated SCIM User resource
            ip_address: Request IP for audit
        
        Returns:
            Updated SCIM User resource
        """
        link = self._find_user_link(scim_id)
        if not link:
            raise SCIMError('User not found', status=404, scim_type='notFound')
        
        user = link.user
        
        # Update name
        name = scim_user.get('name', {})
        if name:
            first_name = name.get('givenName')
            last_name = name.get('familyName')
            
            if hasattr(user, 'profile'):
                if first_name is not None:
                    user.profile.first_name = first_name
                    link.idp_first_name = first_name
                if last_name is not None:
                    user.profile.last_name = last_name
                    link.idp_last_name = last_name
                user.profile.save()
        
        # Update active status
        active = scim_user.get('active')
        if active is not None:
            user.is_active = active
            user.save()
        
        link.save()
        
        self._log_event(
            event_type=SSOAuditEventType.SCIM_USER_UPDATED,
            user=user,
            description=f'User {user.email} updated via SCIM',
            ip_address=ip_address,
        )
        
        return self._user_to_scim(user, link)
    
    @transaction.atomic
    def delete_user(self, scim_id: str, ip_address: str = None) -> None:
        """
        Delete (deactivate) a user.
        
        Args:
            scim_id: SCIM identifier
            ip_address: Request IP for audit
        """
        link = self._find_user_link(scim_id)
        if not link:
            raise SCIMError('User not found', status=404, scim_type='notFound')
        
        user = link.user
        email = user.email
        
        # Remove from tenant (don't delete user entirely)
        TenantMembership.objects.filter(
            user=user,
            tenant=self.tenant,
        ).delete()
        
        # Remove SSO link
        link.delete()
        
        self._log_event(
            event_type=SSOAuditEventType.SCIM_USER_DELETED,
            user=user,
            description=f'User {email} deleted via SCIM',
            ip_address=ip_address,
        )
    
    def patch_user(
        self,
        scim_id: str,
        operations: List[Dict[str, Any]],
        ip_address: str = None,
    ) -> Dict[str, Any]:
        """
        Apply SCIM PATCH operations to a user.
        
        Args:
            scim_id: SCIM identifier
            operations: List of PATCH operations
            ip_address: Request IP for audit
        
        Returns:
            Updated SCIM User resource
        """
        link = self._find_user_link(scim_id)
        if not link:
            raise SCIMError('User not found', status=404, scim_type='notFound')
        
        user = link.user
        
        for op in operations:
            op_type = op.get('op', '').lower()
            path = op.get('path', '')
            value = op.get('value')
            
            if op_type == 'replace':
                if path == 'active' or path == '' and 'active' in value:
                    active_value = value if path == 'active' else value.get('active')
                    user.is_active = active_value
                    user.save()
                
                elif path.startswith('name.') or (path == '' and 'name' in value):
                    name_data = value if path.startswith('name.') else value.get('name', {})
                    if hasattr(user, 'profile'):
                        if 'givenName' in str(path) or 'givenName' in name_data:
                            user.profile.first_name = name_data.get('givenName', value)
                        if 'familyName' in str(path) or 'familyName' in name_data:
                            user.profile.last_name = name_data.get('familyName', value)
                        user.profile.save()
            
            elif op_type == 'add':
                # Handle add operations similarly
                pass
            
            elif op_type == 'remove':
                # Handle remove operations
                pass
        
        self._log_event(
            event_type=SSOAuditEventType.SCIM_USER_UPDATED,
            user=user,
            description=f'User {user.email} patched via SCIM',
            metadata={'operations': operations},
            ip_address=ip_address,
        )
        
        return self._user_to_scim(user, link)
    
    # ==================
    # Group Operations
    # ==================
    
    def list_groups(
        self,
        filter_expr: str = None,
        start_index: int = 1,
        count: int = 100,
    ) -> Dict[str, Any]:
        """
        List groups in SCIM format.
        For this implementation, we expose tenant roles as groups.
        """
        # We map tenant roles to SCIM groups
        groups = [
            {'displayName': TenantUserRole.OWNER, 'id': 'role_owner'},
            {'displayName': TenantUserRole.ADMIN, 'id': 'role_admin'},
            {'displayName': TenantUserRole.MEMBER, 'id': 'role_member'},
        ]
        
        resources = [self._role_to_scim_group(g) for g in groups]
        
        return {
            'schemas': [self.LIST_RESPONSE_SCHEMA],
            'totalResults': len(resources),
            'startIndex': 1,
            'itemsPerPage': len(resources),
            'Resources': resources,
        }
    
    def get_group(self, scim_id: str) -> Dict[str, Any]:
        """Get a single group by SCIM ID."""
        role_map = {
            'role_owner': TenantUserRole.OWNER,
            'role_admin': TenantUserRole.ADMIN,
            'role_member': TenantUserRole.MEMBER,
        }
        
        role = role_map.get(scim_id)
        if not role:
            raise SCIMError('Group not found', status=404, scim_type='notFound')
        
        return self._role_to_scim_group({'displayName': role, 'id': scim_id})
    
    # ==================
    # Helper Methods
    # ==================
    
    def _find_user_link(self, scim_id: str) -> Optional[SSOUserLink]:
        """Find a user link by SCIM ID."""
        # Try finding by external ID first
        link = SSOUserLink.objects.filter(
            sso_connection__tenant=self.tenant,
            idp_user_id=scim_id,
        ).select_related('user', 'user__profile').first()
        
        if not link:
            # Try finding by internal user ID
            link = SSOUserLink.objects.filter(
                sso_connection__tenant=self.tenant,
                user__id=scim_id,
            ).select_related('user', 'user__profile').first()
        
        return link
    
    def _get_default_connection(self) -> Optional[TenantSSOConnection]:
        """Get the default SSO connection for the tenant."""
        return TenantSSOConnection.objects.filter(
            tenant=self.tenant,
            status='active',
        ).first()
    
    def _apply_user_filter(self, queryset, filter_expr: str):
        """Apply SCIM filter to user queryset."""
        # Simple filter parsing - production should use a proper SCIM filter parser
        filter_expr = filter_expr.strip()
        
        if filter_expr.startswith('userName eq'):
            value = filter_expr.split('eq', 1)[1].strip().strip('"\'')
            queryset = queryset.filter(user__email__iexact=value)
        elif filter_expr.startswith('externalId eq'):
            value = filter_expr.split('eq', 1)[1].strip().strip('"\'')
            queryset = queryset.filter(idp_user_id=value)
        
        return queryset
    
    def _user_to_scim(self, user: User, link: SSOUserLink) -> Dict[str, Any]:
        """Convert a User to SCIM format."""
        profile = getattr(user, 'profile', None)
        
        return {
            'schemas': [self.USER_SCHEMA],
            'id': str(link.idp_user_id),
            'externalId': str(link.idp_user_id),
            'userName': user.email,
            'name': {
                'givenName': profile.first_name if profile else '',
                'familyName': profile.last_name if profile else '',
                'formatted': f"{profile.first_name} {profile.last_name}".strip() if profile else '',
            },
            'emails': [
                {
                    'value': user.email,
                    'primary': True,
                    'type': 'work',
                }
            ],
            'active': user.is_active,
            'meta': {
                'resourceType': 'User',
                'created': user.created.isoformat() if hasattr(user, 'created') else None,
                'lastModified': link.updated_at.isoformat() if link.updated_at else None,
            },
        }
    
    def _role_to_scim_group(self, role_data: Dict[str, str]) -> Dict[str, Any]:
        """Convert a role to SCIM Group format."""
        # Get members with this role
        memberships = TenantMembership.objects.filter(
            tenant=self.tenant,
            role=role_data['displayName'],
        ).select_related('user')
        
        members = []
        for m in memberships:
            if m.user:
                members.append({
                    'value': str(m.user.id),
                    'display': m.user.email,
                    'type': 'User',
                })
        
        return {
            'schemas': [self.GROUP_SCHEMA],
            'id': role_data['id'],
            'displayName': role_data['displayName'],
            'members': members,
            'meta': {
                'resourceType': 'Group',
            },
        }

