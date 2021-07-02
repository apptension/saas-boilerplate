from django.db.models import FileField

import graphene
from graphene_django.converter import convert_django_field


class FieldType(graphene.ObjectType):
    url = graphene.String()
    name = graphene.String()

    def resolve_url(self, info):
        return self.url

    def resolve_name(self, info):
        return self.name.split("/")[-1]


@convert_django_field.register(FileField)
def convert_field_to_string(field, registry=None):
    return graphene.Field(FieldType)
