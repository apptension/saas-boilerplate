from apps.multitenancy.constants import TenantUserRole


def make_statement(action, effect, principal, condition=None):
    statement = {
        "action": action,
        "effect": effect,
        "principal": principal,
    }

    if condition:
        statement["condition"] = condition

    return statement


class CommonGroups:
    Admin = "admin"
    User = "user"


class Effect:
    Allow = "allow"
    Deny = "deny"


class Action:
    Any = "*"
    SafeMethods = "<safe_methods>"
    List = "list"
    Destroy = "destroy"
    Create = "create"
    Retrieve = "retrieve"
    Update = "update"

    @staticmethod
    def method(*names):
        return "|".join(names)


class Principal:
    Any = "*"
    Authenticated = "authenticated"
    Anonymous = "anonymous"

    @staticmethod
    def id(name):
        return f"id:{name}"

    @staticmethod
    def group(name):
        return f"group:{name}"


class TenantRoles:
    Owner = [TenantUserRole.OWNER]
    Admin = [TenantUserRole.OWNER, TenantUserRole.ADMIN]
    Member = [TenantUserRole.OWNER, TenantUserRole.ADMIN, TenantUserRole.MEMBER]
