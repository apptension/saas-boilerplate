import json

import six
from common.acl import policies
from graphene_file_upload.django import FileUploadGraphQLView
from graphene_file_upload.utils import place_files_in_operations
from graphql import GraphQLError
from graphql.error import format_error as format_graphql_error
from rest_framework.decorators import authentication_classes, permission_classes, api_view
from rest_framework.exceptions import APIException
from rest_framework.settings import api_settings


class DRFAuthenticatedGraphQLView(FileUploadGraphQLView):
    def parse_body(self, request):
        content_type = self.get_content_type(request)
        if content_type == 'multipart/form-data' and 'operations' in request.POST:
            operations = json.loads(request.POST.get('operations', '{}'))
            files_map = json.loads(request.POST.get('map', '{}'))
            return place_files_in_operations(operations, files_map, request.FILES)
        return request.data

    @staticmethod
    def format_error(error):
        if hasattr(error, 'original_error') and isinstance(error.original_error, APIException):
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
