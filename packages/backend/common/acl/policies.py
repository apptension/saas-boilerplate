from rest_access_policy import AccessPolicy

from .helpers import make_statement, Action, Effect, Principal, CommonGroups


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
