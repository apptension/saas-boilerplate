import graphene
from django.db import models
from graphene_django.converter import convert_django_field
from graphene_django.rest_framework.serializer_converter import get_graphene_type_from_serializer_field
from graphene_file_upload.scalars import Upload
from rest_framework import serializers


class FileFieldType(graphene.ObjectType):
    url = graphene.String()
    name = graphene.String()

    def resolve_url(self, info):
        return self.url

    def resolve_name(self, info):
        return self.name.split("/")[-1]


@convert_django_field.register(models.FileField)
def convert_models_file_field_to_file_field_type(field, registry=None):
    return graphene.Field(FileFieldType)


@get_graphene_type_from_serializer_field.register(serializers.FileField)
def convert_serializers_file_field_to_upload(field):
    return Upload


class TextChoicesFieldType(serializers.ChoiceField):
    def __init__(self, choices, choices_class, **kwargs):
        self.choices_class = choices_class
        super().__init__(choices, **kwargs)


@get_graphene_type_from_serializer_field.register(TextChoicesFieldType)
def convert_serializer_field_to_enum(field):
    return graphene.Enum.from_enum(field.choices_class)
