import six
from graphene_django.views import GraphQLView
from graphql import GraphQLError
from rest_framework.decorators import authentication_classes, permission_classes, api_view
from rest_framework.settings import api_settings
from graphql.error import format_error as format_graphql_error
from rest_framework.exceptions import APIException
from common.acl import policies


class DRFAuthenticatedGraphQLView(GraphQLView):
    def parse_body(self, request):
        return request.data

    @staticmethod
    def format_error(error):
        if isinstance(error.original_error, APIException):
            error.extensions = error.original_error.get_full_details()

        if isinstance(error, GraphQLError):
            return format_graphql_error(error)

        return {"message": six.text_type(error)}

    @classmethod
    def as_view(cls, *args, **kwargs):
        graphene_view = super(DRFAuthenticatedGraphQLView, cls).as_view(*args, **kwargs)

        # @csrf_exempt
        @api_view(['GET', 'POST'])
        @authentication_classes(api_settings.DEFAULT_AUTHENTICATION_CLASSES)
        @permission_classes((policies.AnyoneFullAccess,))
        def view(request, *args, **kwargs):
            return graphene_view(request, *args, **kwargs)

        return view
