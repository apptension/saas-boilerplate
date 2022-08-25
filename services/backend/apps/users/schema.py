import graphene

from common.acl import policies
from common.graphql import mutations
from common.graphql.acl.decorators import permission_classes
from . import serializers


class ObtainTokenMutation(mutations.SerializerMutation):
    class Meta:
        serializer_class = serializers.CookieTokenObtainPairSerializer

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        mutation = super().mutate_and_get_payload(root, info, **input)
        info.context._request.set_auth_cookie = {
            "access": mutation.access,
            "refresh": mutation.refresh,
        }

        return mutation


class SingUpMutation(mutations.SerializerMutation):
    class Meta:
        serializer_class = serializers.UserSignupSerializer

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        mutation = super().mutate_and_get_payload(root, info, **input)
        info.context._request.set_auth_cookie = {
            "access": mutation.access,
            "refresh": mutation.refresh,
        }

        return mutation


@permission_classes(policies.AnyoneFullAccess)
class AnyoneMutation(graphene.ObjectType):
    token_auth = ObtainTokenMutation.Field()
    sign_up = SingUpMutation.Field()


@permission_classes(policies.AnyoneFullAccess)
class AuthenticatedMutation(graphene.ObjectType):
    pass
