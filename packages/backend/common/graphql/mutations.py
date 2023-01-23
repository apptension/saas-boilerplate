from collections import OrderedDict

import graphene
from django.shortcuts import get_object_or_404
from graphene import InputField, Field, relay, ClientIDMutation
from graphene.types.mutation import MutationOptions
from graphene.types.utils import yank_fields_from_attrs
from graphene_django.registry import Registry, get_global_registry
from graphene_django.rest_framework.mutation import SerializerMutationOptions, fields_for_serializer
from graphql_relay import from_global_id
from graphql_relay.connection.arrayconnection import offset_to_cursor
from rest_framework import serializers
from . import exceptions


class RelayModelSerializerMutationOptions(MutationOptions):
    model_class = None
    serializer_class = None
    edge_class = None
    edge_field_name = None
    return_field_name = None


class RelayModelSerializerMutation(ClientIDMutation):
    class Meta:
        abstract = True

    @classmethod
    def get_serializer_kwargs(cls, root, info, **input):
        raise NotImplementedError()

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        kwargs = cls.get_serializer_kwargs(root, info, **input)
        serializer = cls._meta.serializer_class(**kwargs)

        if serializer.is_valid():
            return cls.perform_mutate(serializer, info)
        else:
            raise exceptions.GraphQlValidationError(serializer.errors)

    @classmethod
    def perform_mutate(cls, serializer, info):
        obj = serializer.save()

        kwargs = {cls._meta.return_field_name: obj}

        edge_field_name = cls._meta.edge_field_name
        edge_class = cls._meta.edge_class
        if edge_field_name and edge_class:
            kwargs[edge_field_name] = edge_class(cursor=offset_to_cursor(0), node=obj)

        return cls(**kwargs)


class CreateModelMutation(RelayModelSerializerMutation):
    class Meta:
        abstract = True

    @classmethod
    def __init_subclass_with_meta__(
        cls,
        serializer_class=None,
        only_fields=(),
        exclude_fields=(),
        convert_choices_to_enum=False,
        edge_class=None,
        edge_field_name=None,
        return_field_name=None,
        _meta=None,
        **options,
    ):

        if not serializer_class:
            raise Exception("serializer_class is required for the SerializerMutation")

        serializer = serializer_class()
        model_class = None
        serializer_meta = getattr(serializer_class, "Meta", None)
        if serializer_meta:
            model_class = getattr(serializer_meta, "model", None)

        if not model_class:
            raise Exception('model_class is required in serializer_class')

        model_name = model_class.__name__

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
        )

        registry = get_global_registry()
        model_type = registry.get_type_for_model(model_class)

        if not model_type:
            raise Exception("No type registered for model: {}".format(model_class.__name__))

        output_fields = OrderedDict()
        output_fields[return_field_name] = graphene.Field(model_type)

        if not _meta:
            _meta = RelayModelSerializerMutationOptions(cls)

        _meta.serializer_class = serializer_class
        _meta.model_class = model_class
        _meta.edge_class = edge_class
        _meta.edge_field_name = edge_field_name
        _meta.return_field_name = return_field_name
        _meta.fields = yank_fields_from_attrs(output_fields, _as=Field)
        if edge_field_name and edge_class:
            _meta.fields[edge_field_name] = graphene.Field(edge_class)

        input_fields = yank_fields_from_attrs(input_fields, _as=InputField)
        super(CreateModelMutation, cls).__init_subclass_with_meta__(_meta=_meta, input_fields=input_fields, **options)

    @classmethod
    def get_serializer_kwargs(cls, root, info, **input):
        return {
            "instance": None,
            "data": {
                **input,
                **(
                    {key: info.context.FILES.get(key) for key in info.context.FILES}
                    if hasattr(info.context, "FILES")
                    else {}
                ),
            },
            "context": {"request": info.context},
            "partial": False,
        }


class UpdateModelMutation(RelayModelSerializerMutation):
    class Meta:
        abstract = True

    @classmethod
    def __init_subclass_with_meta__(
        cls,
        serializer_class=None,
        model_class=None,
        only_fields=(),
        exclude_fields=(),
        convert_choices_to_enum=False,
        edge_class=None,
        edge_field_name=None,
        return_field_name=None,
        require_id_field=True,
        _meta=None,
        **options,
    ):
        if not serializer_class:
            raise Exception("serializer_class is required for the SerializerMutation")

        serializer = serializer_class()
        if model_class is None:
            serializer_meta = getattr(serializer_class, "Meta", None)
            if serializer_meta:
                model_class = getattr(serializer_meta, "model", None)

        if not model_class:
            raise Exception('model_class is required')

        model_name = model_class.__name__

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
        )

        registry = get_global_registry()
        model_type = registry.get_type_for_model(model_class)

        if not model_type:
            raise Exception("No type registered for model: {}".format(model_class.__name__))

        available_fields = cls.get_available_fields(input_fields, only_fields, exclude_fields)
        if require_id_field and 'id' in available_fields:
            input_fields['id'] = relay.GlobalID(model_type)

        output_fields = OrderedDict({return_field_name: graphene.Field(model_type)})

        if not _meta:
            _meta = RelayModelSerializerMutationOptions(cls)

        _meta.serializer_class = serializer_class
        _meta.model_class = model_class
        _meta.edge_class = edge_class
        _meta.edge_field_name = edge_field_name
        _meta.return_field_name = return_field_name
        _meta.fields = yank_fields_from_attrs(output_fields, _as=Field)
        if edge_field_name and edge_class:
            _meta.fields[edge_field_name] = graphene.Field(edge_class)

        input_fields = yank_fields_from_attrs(input_fields, _as=InputField)
        super(UpdateModelMutation, cls).__init_subclass_with_meta__(_meta=_meta, input_fields=input_fields, **options)

    @classmethod
    def get_serializer_kwargs(cls, root, info, **input):
        model_class = cls._meta.model_class

        if model_class:
            instance = cls.get_object(model_class, root, info, **input)
            return {
                "instance": instance,
                "data": {
                    **input,
                    **(
                        {key: info.context.FILES.get(key) for key in info.context.FILES}
                        if hasattr(info.context, "FILES")
                        else {}
                    ),
                },
                "context": {"request": info.context},
                "partial": True,
            }

        return {"data": input, "context": {"request": info.context}}

    @classmethod
    def get_object(cls, model_class, root, info, **input):
        _, pk = from_global_id(input['id'])
        return get_object_or_404(cls.get_queryset(model_class, root, info, **input), pk=pk)

    @classmethod
    def get_queryset(cls, model_class, root, info, **input):
        return model_class.objects.all()

    @classmethod
    def get_available_fields(cls, input_fields: OrderedDict, only_fields: tuple, exclude_fields: tuple) -> set:
        available_fields = {'id'}.union(set(input_fields.keys()))
        if only_fields:
            available_fields = available_fields.intersection(only_fields)
        if exclude_fields:
            available_fields = available_fields.difference(exclude_fields)
        return available_fields


class SerializerMutation(ClientIDMutation):
    class Meta:
        abstract = True

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
        _meta=None,
        **options,
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

        if lookup_field is None and model_class:
            lookup_field = model_class._meta.pk.name

        input_fields = fields_for_serializer(
            serializer,
            only_fields,
            exclude_fields,
            is_input=True,
            convert_choices_to_enum=convert_choices_to_enum,
            lookup_field=lookup_field,
        )
        output_fields = fields_for_serializer(
            serializer,
            only_fields,
            exclude_fields,
            is_input=False,
            convert_choices_to_enum=convert_choices_to_enum,
            lookup_field=lookup_field,
        )

        if not _meta:
            _meta = SerializerMutationOptions(cls)
        _meta.lookup_field = lookup_field
        _meta.model_operations = model_operations
        _meta.serializer_class = serializer_class
        _meta.model_class = model_class
        _meta.fields = yank_fields_from_attrs(output_fields, _as=Field)

        input_fields = yank_fields_from_attrs(input_fields, _as=InputField)
        super(SerializerMutation, cls).__init_subclass_with_meta__(_meta=_meta, input_fields=input_fields, **options)

    @classmethod
    def get_object(cls, model_class, info, *args, **kwargs):
        return get_object_or_404(model_class, *args, **kwargs)

    @classmethod
    def get_serializer_kwargs(cls, root, info, **input):
        lookup_field = cls._meta.lookup_field
        model_class = cls._meta.model_class
        if model_class:
            if "update" in cls._meta.model_operations and lookup_field in input:
                instance = cls.get_object(model_class, info, **{lookup_field: input[lookup_field]})
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
            raise exceptions.GraphQlValidationError(serializer.errors)

    @classmethod
    def perform_mutate(cls, serializer, info):
        obj = serializer.save()

        kwargs = {}
        for f, field in serializer.fields.items():
            if not field.write_only:
                if isinstance(field, serializers.SerializerMethodField):
                    kwargs[f] = field.to_representation(obj)
                else:
                    kwargs[f] = field.get_attribute(obj)

        return cls(**kwargs)


class DeleteModelMutationOptions(MutationOptions):
    model = None


class DeleteModelMutation(ClientIDMutation):
    class Meta:
        abstract = True

    class Input:
        id = graphene.String()

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
            _meta = DeleteModelMutationOptions(cls)

        _meta.model = model

        super().__init_subclass_with_meta__(_meta=_meta, **options)

    @classmethod
    def get_object(cls, id, **kwargs):
        model = cls._meta.model
        _, pk = from_global_id(id)
        return get_object_or_404(model, pk=pk, **kwargs)

    @classmethod
    def mutate_and_get_payload(cls, root, info, id):
        obj = cls.get_object(id)
        obj.delete()
        return cls(deleted_ids=[id])
