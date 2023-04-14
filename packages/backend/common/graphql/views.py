import json

import six
from graphene_file_upload.django import FileUploadGraphQLView
from graphene_file_upload.utils import place_files_in_operations
from graphql import get_operation_ast, parse
from graphql.error import GraphQLError
from graphql.execution import ExecutionResult
from rest_framework.decorators import authentication_classes, permission_classes, api_view
from rest_framework.exceptions import APIException
from rest_framework.settings import api_settings
from sentry_sdk import start_transaction, capture_exception

from common.acl import policies


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
        if hasattr(error, 'original_error'):
            if isinstance(error.original_error, APIException):
                error.extensions = error.original_error.get_full_details()
            else:
                capture_exception(error.original_error)

        if isinstance(error, GraphQLError):
            return error.formatted

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

    def execute_graphql_request(self, request, data, query, variables, operation_name, show_graphiql=False):
        try:
            document = parse(query)
        except Exception as e:
            return ExecutionResult(errors=[e])

        operation_type = get_operation_ast(document, operation_name).operation.value if query else None

        with start_transaction(op=operation_type, name=operation_name or data.get("id")):
            return super().execute_graphql_request(request, data, query, variables, operation_name, show_graphiql)
