from graphene_django.views import GraphQLView
from rest_framework.decorators import authentication_classes, permission_classes, api_view
from rest_framework.settings import api_settings

from common.acl import policies


class DRFAuthenticatedGraphQLView(GraphQLView):
    def parse_body(self, request):
        return request.data

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
