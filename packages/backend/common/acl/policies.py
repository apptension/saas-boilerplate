from rest_access_policy import AccessPolicy

from .helpers import make_statement, Action, Effect, Principal, CommonGroups, TenantRoles


class AdminFullAccess(AccessPolicy):
    statements = [make_statement(principal=Principal.group(CommonGroups.Admin), action=Action.Any, effect=Effect.Allow)]


class UserFullAccess(AccessPolicy):
    statements = [make_statement(principal=Principal.group(CommonGroups.User), action=Action.Any, effect=Effect.Allow)]


class IsAnonymousFullAccess(AccessPolicy):
    statements = [make_statement(principal=Principal.Anonymous, action=Action.Any, effect=Effect.Allow)]


class IsAuthenticatedFullAccess(AccessPolicy):
    statements = [make_statement(principal=Principal.Authenticated, action=Action.Any, effect=Effect.Allow)]


class AnyoneFullAccess(AccessPolicy):
    statements = [make_statement(principal=Principal.Any, action=Action.Any, effect=Effect.Allow)]


class TenantDependentAccess(AccessPolicy):
    def is_request_from_tenant_owner(self, request, view, action) -> bool:
        return request.user_role in TenantRoles.Owner

    def is_request_from_tenant_admin(self, request, view, action) -> bool:
        return request.user_role in TenantRoles.Admin

    def is_request_from_tenant_member(self, request, view, action) -> bool:
        return request.user_role in TenantRoles.Member


class IsTenantOwnerAccess(TenantDependentAccess):
    statements = [
        make_statement(
            principal=Principal.Authenticated,
            action=Action.Any,
            effect=Effect.Allow,
            condition=["is_request_from_tenant_owner"],
        )
    ]


class IsTenantAdminAccess(TenantDependentAccess):
    statements = [
        make_statement(
            principal=Principal.Authenticated,
            action=Action.Any,
            effect=Effect.Allow,
            condition=["is_request_from_tenant_admin"],
        )
    ]


class IsTenantMemberAccess(TenantDependentAccess):
    statements = [
        make_statement(
            principal=Principal.Authenticated,
            action=Action.Any,
            effect=Effect.Allow,
            condition=["is_request_from_tenant_member"],
        )
    ]
