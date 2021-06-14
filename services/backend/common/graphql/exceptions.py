import graphene
from graphene import ObjectType
from graphene_django.types import ErrorType
from graphene_django.utils import camelize


class RelayErrorMessageType(ObjectType):
    message = graphene.String(required=True)
    code = graphene.String(required=True)


def _get_full_details(detail):
    if isinstance(detail, list):
        return [_get_full_details(item) for item in detail]
    return {'message': detail, 'code': detail.code}


class RelayErrorType(ErrorType):
    field = graphene.String(required=True)
    messages = graphene.List(RelayErrorMessageType, required=True)

    @classmethod
    def from_errors(cls, errors):
        data = camelize(errors)
        error_details = [{'field': key, 'messages': _get_full_details(value)} for key, value in data.items()]
        return [cls(field=error_detail['field'], messages=error_detail['messages']) for error_detail in error_details]
