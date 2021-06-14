from collections import OrderedDict

import graphene
from django.shortcuts import get_object_or_404
from graphene import ClientIDMutation, InputField, Field
from graphene.types.mutation import MutationOptions
from graphene.types.utils import yank_fields_from_attrs
from graphene_django.registry import Registry, get_global_registry
from graphene_django.rest_framework.mutation import SerializerMutationOptions, fields_for_serializer
from graphql_relay import from_global_id
from graphql_relay.connection.arrayconnection import offset_to_cursor
from rest_framework import serializers

from . import exceptions


class RelaySerializerMutationOptions(SerializerMutationOptions):
    edge_class = None
    edge_field_name = None
    return_field_name = None


class RelaySerializerMutation(ClientIDMutation):
    class Meta:
        abstract = True

    errors = graphene.List(exceptions.RelayErrorType, description="May contain more than one error for same field.")

    @classmethod
    def __init_subclass_with_meta__(
        cls,
        lookup_field=None,
        serializer_class=None,
        model_class=None,
        model_operations=("create", "update"),
        only_fields=(),
        exclude_fields=(),
        convert_choices_to_enum=True,
        edge_class=None,
        edge_field_name=None,
        return_field_name=None,
        _meta=None,
        **options
    ):

        if not serializer_class:
            raise Exception("serializer_class is required for the SerializerMutation")

        if "update" not in model_operations and "create" not in model_operations:
            raise Exception('model_operations must contain "create" and/or "update"')

        serializer = serializer_class()
        if model_class is None:
            serializer_meta = getattr(serializer_class, "Meta", None)
            if serializer_meta:
                model_class = getattr(serializer_meta, "model", None)

        if (edge_class or edge_field_name) and not model_class:
            raise Exception('model_class is required for edge_class and edge_field_name')

        if model_class:
            model_name = model_class.__name__

            if lookup_field is None:
                lookup_field = model_class._meta.pk.name

            if not edge_field_name and edge_class:
                edge_field_name = model_name[:1].lower() + model_name[1:] + 'Edge'

            if not return_field_name:
                return_field_name = model_name[:1].lower() + model_name[1:]

        input_fields = fields_for_serializer(
            serializer,
            only_fields,
            exclude_fields,
            is_input=True,
            convert_choices_to_enum=convert_choices_to_enum,
            lookup_field=lookup_field,
        )

        if return_field_name:
            registry = get_global_registry()
            model_type = registry.get_type_for_model(model_class)

            if not model_type:
                raise Exception("No type registered for model: {}".format(model_class.__name__))

            output_fields = OrderedDict()
            output_fields[return_field_name] = graphene.Field(model_type)
        else:
            output_fields = fields_for_serializer(
                serializer,
                only_fields,
                exclude_fields,
                is_input=False,
                convert_choices_to_enum=convert_choices_to_enum,
                lookup_field=lookup_field,
            )

        if not _meta:
            _meta = RelaySerializerMutationOptions(cls)

        _meta.lookup_field = lookup_field
        _meta.model_operations = model_operations
        _meta.serializer_class = serializer_class
        _meta.model_class = model_class
        _meta.edge_class = edge_class
        _meta.edge_field_name = edge_field_name
        _meta.return_field_name = return_field_name
        _meta.fields = yank_fields_from_attrs(output_fields, _as=Field)
        if edge_field_name and edge_class:
            _meta.fields[edge_field_name] = graphene.Field(edge_class)

        input_fields = yank_fields_from_attrs(input_fields, _as=InputField)
        super(RelaySerializerMutation, cls).__init_subclass_with_meta__(
            _meta=_meta, input_fields=input_fields, **options
        )

    @classmethod
    def get_serializer_kwargs(cls, root, info, **input):
        lookup_field = cls._meta.lookup_field
        model_class = cls._meta.model_class

        if model_class:
            if "update" in cls._meta.model_operations and lookup_field in input:
                if lookup_field == model_class._meta.pk.name:
                    _, pk = from_global_id(input[lookup_field])
                    input[lookup_field] = pk

                instance = get_object_or_404(model_class, **{lookup_field: input[lookup_field]})
                partial = True
            elif "create" in cls._meta.model_operations:
                instance = None
                partial = False
            else:
                raise Exception('Invalid update operation. Input parameter "{}" required.'.format(lookup_field))

            return {
                "instance": instance,
                "data": input,
                "context": {"request": info.context},
                "partial": partial,
            }

        return {"data": input, "context": {"request": info.context}}

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        kwargs = cls.get_serializer_kwargs(root, info, **input)
        serializer = cls._meta.serializer_class(**kwargs)

        if serializer.is_valid():
            return cls.perform_mutate(serializer, info)
        else:
            errors = exceptions.RelayErrorType.from_errors(serializer.errors)

            return cls(errors=errors)

    @classmethod
    def perform_mutate(cls, serializer, info):
        obj = serializer.save()

        kwargs = {}
        return_field_name = cls._meta.return_field_name
        if return_field_name:
            kwargs[return_field_name] = obj
        else:
            for f, field in serializer.fields.items():
                if not field.write_only:
                    if isinstance(field, serializers.SerializerMethodField):
                        kwargs[f] = field.to_representation(obj)
                    else:
                        kwargs[f] = field.get_attribute(obj)

        edge_field_name = cls._meta.edge_field_name
        edge_class = cls._meta.edge_class
        if edge_field_name and edge_class:
            kwargs[edge_field_name] = edge_class(cursor=offset_to_cursor(0), node=obj)

        return cls(errors=None, **kwargs)


class DjangoModelDeleteMutationOptions(MutationOptions):
    model = None


class DjangoModelDeleteMutation(ClientIDMutation):
    class Meta:
        abstract = True

    class Input:
        id = graphene.String()

    errors = graphene.List(exceptions.RelayErrorType, description="May contain more than one error for same field.")
    deleted_ids = graphene.List(graphene.ID)

    @classmethod
    def __init_subclass_with_meta__(cls, registry=None, model=None, _meta=None, **options):
        if not registry:
            registry = get_global_registry()

        assert isinstance(registry, Registry), (
            "The attribute registry in {} needs to be an instance of " 'Registry, received "{}".'
        ).format(cls.__name__, registry)

        if not model:
            raise Exception("model is required for the DeleteMutation")

        if not _meta:
            _meta = DjangoModelDeleteMutationOptions(cls)

        _meta.model = model

        super(DjangoModelDeleteMutation, cls).__init_subclass_with_meta__(_meta=_meta, **options)

    @classmethod
    def mutate_and_get_payload(cls, root, info, id):
        model = cls._meta.model
        _, pk = from_global_id(id)
        obj = get_object_or_404(model, pk=pk)
        obj.delete()
        return cls(deleted_ids=[id])
