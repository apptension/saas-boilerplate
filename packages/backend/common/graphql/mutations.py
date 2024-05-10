from collections import OrderedDict

import graphene
from django.shortcuts import get_object_or_404
from graphene import InputField, Field, relay, ClientIDMutation
from graphene.types.mutation import MutationOptions
from graphene.types.utils import yank_fields_from_attrs
from graphene_django.registry import Registry, get_global_registry
from graphene_django.rest_framework.mutation import SerializerMutationOptions, fields_for_serializer
from graphql_relay import from_global_id, offset_to_cursor
from rest_framework import serializers

from . import exceptions, constants
from .exceptions import GraphQlMutationError


class RelayModelSerializerMutationOptions(MutationOptions):
    """
    `RelayModelSerializerMutationOptions` is a class that defines options for `RelayModelSerializerMutation`.

    Inherits from: `MutationOptions`

    Properties:
    - `model_class`: The Django model class that the mutation operates on.
    - `serializer_class`: The serializer class that is used to serialize the input data.
    - `edge_class`: The edge class for the mutation.
    - `edge_field_name`: The name of the edge field for the mutation.
    - `return_field_name`: The name of the field that is returned in the mutation payload.
    """

    model_class = None
    serializer_class = None
    edge_class = None
    edge_field_name = None
    return_field_name = None


class RelayModelSerializerMutation(ClientIDMutation):
    """
    `RelayModelSerializerMutation` is a class that allows you to create GraphQL mutations for creating, updating, and
    deleting Django models using a serializer.
    """

    class Meta:
        abstract = True

    @classmethod
    def get_serializer_kwargs(cls, root, info, **input):
        """
        Return the keyword arguments that are passed to the serializer when an instance is created, updated, or deleted.

        :param root: root value passed to the mutation
        :param info: GraphQL ResolveInfo object passed to the mutation
        :param input: dictionary of input values passed to the mutation
        :raises: `NotImplementedError`: This method must be overridden in a subclass
        """
        raise NotImplementedError()

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        """
        Perform the mutation and return the payload.

        :param root: root value passed to the mutation
        :param info: GraphQL ResolveInfo object passed to the mutation
        :param input: dictionary of input values passed to the mutation
        :return: result of the mutation
        """
        kwargs = cls.get_serializer_kwargs(root, info, **input)
        serializer = cls._meta.serializer_class(**kwargs)

        if serializer.is_valid():
            return cls.perform_mutate(serializer, info)
        else:
            raise exceptions.GraphQlValidationError(serializer.errors)

    @classmethod
    def perform_mutate(cls, serializer, info):
        """
        Perform the mutation with the provided serializer and return the result.

        :param serializer: Django Rest Framework serializer to use for the mutation
        :param info: GraphQL ResolveInfo object passed to the mutation
        :return: result of the mutation
        """
        obj = serializer.save()

        kwargs = {cls._meta.return_field_name: obj}

        edge_field_name = cls._meta.edge_field_name
        edge_class = cls._meta.edge_class
        if edge_field_name and edge_class:
            kwargs[edge_field_name] = edge_class(cursor=offset_to_cursor(0), node=obj)

        return cls(**kwargs)


class CreateModelMutation(RelayModelSerializerMutation):
    """
    `CreateModelMutation` is a Relay mutation class that inherits from `RelayModelSerializerMutation`.
     It is used to create a new object of a specified model in the database.
    """

    class Meta:
        abstract = True

    @classmethod
    def __init_subclass_with_meta__(
        cls,
        serializer_class=None,
        only_fields=(),
        exclude=(),
        convert_choices_to_enum=False,
        edge_class=None,
        edge_field_name=None,
        return_field_name=None,
        _meta=None,
        **options,
    ):
        """
        Create a new subclass of a specified class with a specified metaclass. It is used in the `CreateModelMutation`
        class to define a new subclass of `RelayModelSerializerMutation` with additional meta information.

        :param serializer_class: specifies the serializer class to use for the mutation
        :param only_fields: tuple of fields to include in the mutation
        :param exclude: tuple of fields to exclude from the mutatio
        :param convert_choices_to_enum: boolean that specifies whether to convert serializer choices to an enum
        :param edge_class: edge class to use in the mutation
        :param edge_field_name: name of the edge field in the mutation
        :param return_field_name: name of the return field in the mutation
        :param _meta: metaclass to use for the mutation
        :param options: dictionary of additional options to use in the mutation
        :return: None
        """
        if not serializer_class:
            raise GraphQlMutationError(constants.SERIALIZER_CLASS_REQUIRED_ERROR)

        serializer = serializer_class()
        model_class = None
        serializer_meta = getattr(serializer_class, "Meta", None)
        if serializer_meta:
            model_class = getattr(serializer_meta, "model", None)

        if not model_class:
            raise GraphQlMutationError('model_class is required in serializer_class')

        model_name = model_class.__name__

        if not edge_field_name and edge_class:
            edge_field_name = model_name[:1].lower() + model_name[1:] + 'Edge'

        if not return_field_name:
            return_field_name = model_name[:1].lower() + model_name[1:]

        input_fields = fields_for_serializer(
            serializer,
            only_fields,
            exclude,
            is_input=True,
            convert_choices_to_enum=convert_choices_to_enum,
        )

        registry = get_global_registry()
        model_type = registry.get_type_for_model(model_class)

        if not model_type:
            raise GraphQlMutationError("No type registered for model: {}".format(model_class.__name__))

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
        """
        The `get_serializer_kwargs` class method is a utility method that is used to generate keyword arguments for a
        serializer instance. It is used in the `CreateModelMutation` class to generate keyword arguments for the
        serializer instance used in the mutation.

        :param root: root value passed to the mutation
        :param info: GraphQL ResolveInfo object passed to the mutation
        :param input: dictionary of input values passed to the mutation
        :return: dictionary of keyword arguments for the serializer instance
        """
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
    """
    `UpdateModelMutation` is a Relay mutation class that inherits from `RelayModelSerializerMutation`.
    It is used to update an object of a specified model in the database.
    """

    class Meta:
        abstract = True

    @classmethod
    def __init_subclass_with_meta__(
        cls,
        serializer_class=None,
        model_class=None,
        only_fields=(),
        exclude=(),
        convert_choices_to_enum=False,
        edge_class=None,
        edge_field_name=None,
        return_field_name=None,
        require_id_field=True,
        _meta=None,
        **options,
    ):
        """
        Create a new subclass of a specified class with a specified metaclass. It is used in the `UpdateModelMutation`
        class to define a new subclass of `RelayModelSerializerMutation` with additional meta information.

        :param serializer_class: specifies the serializer class to use for the mutation
        :param only_fields: tuple of fields to include in the mutation
        :param exclude: tuple of fields to exclude from the mutatio
        :param convert_choices_to_enum: boolean that specifies whether to convert serializer choices to an enum
        :param edge_class: edge class to use in the mutation
        :param edge_field_name: name of the edge field in the mutation
        :param return_field_name: name of the return field in the mutation
        :param _meta: metaclass to use for the mutation
        :param options: dictionary of additional options to use in the mutation
        :return: None
        """
        if not serializer_class:
            raise GraphQlMutationError(constants.SERIALIZER_CLASS_REQUIRED_ERROR)

        serializer = serializer_class()
        if model_class is None:
            serializer_meta = getattr(serializer_class, "Meta", None)
            if serializer_meta:
                model_class = getattr(serializer_meta, "model", None)

        if not model_class:
            raise GraphQlMutationError('model_class is required')

        model_name = model_class.__name__

        if not edge_field_name and edge_class:
            edge_field_name = model_name[:1].lower() + model_name[1:] + 'Edge'

        if not return_field_name:
            return_field_name = model_name[:1].lower() + model_name[1:]

        input_fields = fields_for_serializer(
            serializer,
            only_fields,
            exclude,
            is_input=True,
            convert_choices_to_enum=convert_choices_to_enum,
        )

        registry = get_global_registry()
        model_type = registry.get_type_for_model(model_class)

        if not model_type:
            raise GraphQlMutationError("No type registered for model: {}".format(model_class.__name__))

        available_fields = cls.get_available_fields(input_fields, only_fields, exclude)
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
        """
        The `get_serializer_kwargs` class method is a utility method that is used to generate keyword arguments for a
        serializer instance. It is used in the `UpdateModelMutation` class to generate keyword arguments for the
        serializer instance used in the mutation.

        :param root: root value passed to the mutation
        :param info: GraphQL ResolveInfo object passed to the mutation
        :param input: dictionary of input values passed to the mutation
        :return: dictionary of keyword arguments for the serializer instance
        """
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
        """
        The `get_object` class method is a utility method that is used to retrieve an object of a specified model by
        its ID. It is used in the `UpdateModelMutation` class to retrieve the object to be updated.

        :param model_class: model class to use to retrieve the object
        :param root: root value passed to the mutation
        :param info: GraphQL ResolveInfo object passed to the mutation
        :param input: dictionary of input values passed to the mutation
        :return: object of the specified model with the specified ID
        """
        _, pk = from_global_id(input['id'])
        return get_object_or_404(cls.get_queryset(model_class, root, info, **input), pk=pk)

    @classmethod
    def get_queryset(cls, model_class, root, info, **input):
        """
        Return a queryset of all objects of the given `model_class`.

        :param model_class: model class for which the queryset is to be returned
        :param root: root object of the mutation
        :param info: GraphQL ResolveInfo object passed to the mutation
        :param input: dictionary of input values passed to the mutation
        :return: queryset of all objects of the given `model_class`
        """
        return model_class.objects.all()

    @classmethod
    def get_available_fields(cls, input_fields: OrderedDict, only_fields: tuple, exclude: tuple) -> set:
        """
        Return a set of available fields for a GraphQL mutation

        :param input_fields: OrderedDict containing all the input fields for the GraphQL mutation
        :param only_fields: tuple of field names to include in the available fields set
        :param exclude: tuple of field names to exclude from the available fields set
        :return: set of available fields
        """
        available_fields = {'id'}.union(set(input_fields.keys()))
        if only_fields:
            available_fields = available_fields.intersection(only_fields)
        if exclude:
            available_fields = available_fields.difference(exclude)

        return available_fields


class SerializerMutation(ClientIDMutation):
    """
    `SerializerMutation` is a class that allows you to create GraphQL mutations that serialize and deserialize data
    using Django Rest Framework serializers.
    """

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
        exclude=(),
        convert_choices_to_enum=True,
        _meta=None,
        **options,
    ):
        """
        Create a new subclass of a specified class with a specified metaclass.

        :param lookup_field: field used to retrieve an existing model instance
        :param serializer_class: specifies the serializer class to use for the mutation
        :param model_class: Django model class to use
        :param model_operations: model operations to support, defaults to `('create', 'update')`.
        :param only_fields: fields to include in the mutation, if not provided, all fields will be included.
        :param exclude: the fields to exclude from the mutation, if not provided, no fields will be excluded.
        :param convert_choices_to_enum: boolean that specifies whether to convert serializer choices to an enum
        :param _meta: metaclass to use for the mutation
        :param options: dictionary of additional options to use in the mutation
        :return: None
        """

        if not serializer_class:
            raise GraphQlMutationError(constants.SERIALIZER_CLASS_REQUIRED_ERROR)

        if "update" not in model_operations and "create" not in model_operations:
            raise GraphQlMutationError('model_operations must contain "create" and/or "update"')

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
            exclude,
            is_input=True,
            convert_choices_to_enum=convert_choices_to_enum,
            lookup_field=lookup_field,
        )
        output_fields = fields_for_serializer(
            serializer,
            only_fields,
            exclude,
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
        """
        Retrieve a single object of the given `model_class` using the provided `*args` and `**kwargs`.

        :param model_class: model class for which to retrieve an object
        :param info: GraphQL ResolveInfo object passed to the mutation
        :param args: positional arguments to pass to the `get_object_or_404` function
        :param kwargs: keyword arguments to pass to the `get_object_or_404` function
        :return: object of the given `model_class`
        """
        return get_object_or_404(model_class, *args, **kwargs)

    @classmethod
    def get_serializer_kwargs(cls, root, info, **input):
        """
        The `get_serializer_kwargs` class method is a utility method that is used to generate keyword arguments for a
        serializer instance.

        :param root: root value passed to the mutation
        :param info: GraphQL ResolveInfo object passed to the mutation
        :param input: dictionary of input values passed to the mutation
        :return: dictionary of keyword arguments for the serializer instance
        """
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
                raise GraphQlMutationError(
                    'Invalid update operation. Input parameter "{}" required.'.format(lookup_field)
                )

            return {
                "instance": instance,
                "data": input,
                "context": {"request": info.context},
                "partial": partial,
            }

        return {"data": input, "context": {"request": info.context}}

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        """
        Perform the mutation and returns its result as a payload.

        :param root: root value passed to the mutation
        :param info: GraphQL ResolveInfo object passed to the mutation
        :param input: dictionary of input values passed to the mutation
        :return: result of the mutation
        """
        kwargs = cls.get_serializer_kwargs(root, info, **input)
        serializer = cls._meta.serializer_class(**kwargs)

        if serializer.is_valid():
            return cls.perform_mutate(serializer, info)
        else:
            raise exceptions.GraphQlValidationError(serializer.errors)

    @classmethod
    def perform_mutate(cls, serializer, info):
        """
        Perform the mutation with the provided serializer and return the result.

        :param serializer: Django Rest Framework serializer to use for the mutation
        :param info: GraphQL ResolveInfo object passed to the mutation
        :return: result of the mutation
        """
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
    """
    `DeleteModelMutationOptions` is a subclass of `MutationOptions` that provides additional options for a GraphQL
    mutation that deletes a Django model instance.
    """

    model = None


class DeleteModelMutation(ClientIDMutation):
    """
    `DeleteModelMutation` is a class that allows you to create GraphQL mutations that delete a Django model instance.
    """

    class Meta:
        abstract = True

    class Input:
        id = graphene.String()

    deleted_ids = graphene.List(graphene.ID)

    @classmethod
    def __init_subclass_with_meta__(cls, registry=None, model=None, _meta=None, **options):
        """
        Create a new subclass of a specified class with a specified metaclass.

        :param registry: registry of the subclass
        :param model: model for which to retrieve an object
        :param _meta: metaclass to use for the mutation
        :param options: dictionary of additional options to use in the mutation
        :return: None
        """
        if not registry:
            registry = get_global_registry()

        assert isinstance(registry, Registry), (
            "The attribute registry in {} needs to be an instance of " 'Registry, received "{}".'
        ).format(cls.__name__, registry)

        if not model:
            raise GraphQlMutationError("model is required for the DeleteMutation")

        if not _meta:
            _meta = DeleteModelMutationOptions(cls)

        _meta.model = model

        super().__init_subclass_with_meta__(_meta=_meta, **options)

    @classmethod
    def get_object(cls, id, **kwargs):
        """
        Retrieve a single instance of a model based on id

        :param id: id of the model instance to retrieve
        :param kwargs: additional keyword arguments
        :return: instance of the model with the specified id
        """
        model = cls._meta.model
        _, pk = from_global_id(id)
        return get_object_or_404(model, pk=pk, **kwargs)

    @classmethod
    def mutate_and_get_payload(cls, root, info, id, **kwargs):
        """
        Perform a mutation to delete a model instance

        :param root: root value passed to the mutation
        :param info: GraphQL ResolveInfo object passed to the mutation
        :param id: id of the model instance to delete
        :return: instance of the DeleteModelMutation class that contains a list of deleted IDs
        """
        obj = cls.get_object(id)
        obj.delete()
        return cls(deleted_ids=[id])


class DeleteTenantDependentModelMutation(DeleteModelMutation):
    """
    `DeleteTenantDependentModelMutation` is a mutation class that inherits from
    [`DeleteModelMutation`](#deletemodelmutation).
    It is used to delete an object of a specified model from the database which is dependent on tenant.
    It implements `tenant_id` field in input.
    """

    class Meta:
        abstract = True

    class Input:
        id = graphene.String()
        tenant_id = graphene.String(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        if "tenant_id" in input:
            _, input["tenant_id"] = from_global_id(input["tenant_id"])
        return super().mutate_and_get_payload(root, info, **input)


class UpdateTenantDependentModelMutation(UpdateModelMutation):
    """
    `UpdateTenantDependentModelMutation` is a mutation class that inherits from
    [`UpdateModelMutation`](#updatemodelmutation).
    It is used to update an object of a specified model in the database which is dependent on tenant.
    It implements `tenant_id` field in input.
    """

    class Meta:
        abstract = True

    class Input:
        id = graphene.String()
        tenant_id = graphene.String(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        if "tenant_id" in input:
            _, input["tenant_id"] = from_global_id(input["tenant_id"])
        return super().mutate_and_get_payload(root, info, **input)


class CreateTenantDependentModelMutation(CreateModelMutation):
    """
    `CreateTenantDependentModelMutation` is a Relay mutation class that inherits from
    [`CreateModelMutation`](#createmodelmutation).
     It is used to create a new object of a specified model in the database which is dependent on tenant.
     It implements `tenant_id` field in input.
    """

    class Meta:
        abstract = True

    class Input:
        tenant_id = graphene.String(required=True)

    @classmethod
    def mutate_and_get_payload(cls, root, info, **input):
        if "tenant_id" in input:
            _, input["tenant_id"] = from_global_id(input["tenant_id"])
        return super().mutate_and_get_payload(root, info, **input)
