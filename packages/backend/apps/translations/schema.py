"""
GraphQL schema for translations.

Provides queries for:
- Available locales
- Translation status and progress

Provides mutations for (admin only):
- Publishing translations
- Syncing translation keys
"""

import graphene
from graphene import relay
from graphene_django import DjangoObjectType
from graphql import GraphQLError

from common.acl import policies
from common.graphql.acl import permission_classes
from .models import Locale, TranslationKey, Translation, TranslationVersion
from .services import TranslationPublisher, TranslationSyncer


class LocaleType(DjangoObjectType):
    """GraphQL type for Locale model."""
    
    translation_progress = graphene.Float()
    
    class Meta:
        model = Locale
        fields = ['id', 'code', 'name', 'native_name', 'is_default', 'is_active', 'rtl']
        interfaces = (relay.Node,)

    def resolve_translation_progress(self, info):
        return self.translation_progress


class TranslationKeyType(DjangoObjectType):
    """GraphQL type for TranslationKey model."""
    
    class Meta:
        model = TranslationKey
        fields = ['id', 'key', 'default_message', 'description', 'is_deprecated']
        interfaces = (relay.Node,)


class TranslationType(DjangoObjectType):
    """GraphQL type for Translation model."""
    
    class Meta:
        model = Translation
        fields = ['id', 'key', 'locale', 'value', 'status', 'updated_at']
        interfaces = (relay.Node,)


class TranslationVersionType(DjangoObjectType):
    """GraphQL type for TranslationVersion model."""
    
    class Meta:
        model = TranslationVersion
        fields = ['id', 'locale', 'version', 'is_active', 'published_at', 'translation_count']
        interfaces = (relay.Node,)


class TranslationSyncStatusType(graphene.ObjectType):
    """Type for translation sync status."""
    
    total_keys = graphene.Int()
    active_keys = graphene.Int()
    deprecated_keys = graphene.Int()


class LocaleProgressType(graphene.ObjectType):
    """Type for locale translation progress."""
    
    code = graphene.String()
    name = graphene.String()
    published_translations = graphene.Int()
    progress = graphene.Float()


# Queries

class TranslationsQuery(graphene.ObjectType):
    """Public query for fetching locale information."""
    
    available_locales = graphene.List(
        LocaleType,
        description="Get all active locales"
    )
    default_locale = graphene.Field(
        LocaleType,
        description="Get the default locale"
    )
    translation_sync_status = graphene.Field(
        TranslationSyncStatusType,
        description="Get translation sync status (admin only)"
    )
    locale_progress = graphene.List(
        LocaleProgressType,
        description="Get translation progress for all locales"
    )

    @permission_classes(policies.AnyoneFullAccess)
    def resolve_available_locales(self, info):
        return Locale.objects.filter(is_active=True)

    @permission_classes(policies.AnyoneFullAccess)
    def resolve_default_locale(self, info):
        return Locale.objects.filter(is_default=True).first()

    @permission_classes(policies.AnyoneFullAccess)
    def resolve_locale_progress(self, info):
        syncer = TranslationSyncer()
        status = syncer.get_sync_status()
        return [
            LocaleProgressType(**locale_data) 
            for locale_data in status['locales']
        ]

    def resolve_translation_sync_status(self, info):
        # Admin only
        user = info.context.user
        if not user.is_authenticated or not user.is_superuser:
            raise GraphQLError("Permission denied")
        
        syncer = TranslationSyncer()
        status = syncer.get_sync_status()
        return TranslationSyncStatusType(
            total_keys=status['total_keys'],
            active_keys=status['active_keys'],
            deprecated_keys=status['deprecated_keys']
        )


# Mutations

class PublishTranslationsMutation(relay.ClientIDMutation):
    """Publish translations for a locale to S3/CDN."""
    
    class Input:
        locale_code = graphene.String(required=True)

    success = graphene.Boolean()
    version = graphene.String()
    message = graphene.String()

    @classmethod
    def mutate_and_get_payload(cls, root, info, locale_code):
        user = info.context.user
        
        # Admin only
        if not user.is_authenticated or not user.is_superuser:
            raise GraphQLError("Permission denied. Admin access required.")
        
        try:
            locale = Locale.objects.get(code=locale_code, is_active=True)
        except Locale.DoesNotExist:
            raise GraphQLError(f"Locale '{locale_code}' not found or inactive")
        
        publisher = TranslationPublisher()
        version = publisher.publish(locale, user)
        
        return PublishTranslationsMutation(
            success=True,
            version=version.version,
            message=f"Published {version.translation_count} translations for {locale.name}"
        )


class SyncTranslationKeysMutation(relay.ClientIDMutation):
    """Sync translation keys from master JSON."""
    
    class Input:
        translations = graphene.JSONString(required=True)

    success = graphene.Boolean()
    created = graphene.Int()
    updated = graphene.Int()
    deprecated = graphene.Int()
    message = graphene.String()

    @classmethod
    def mutate_and_get_payload(cls, root, info, translations):
        user = info.context.user
        
        # Admin only or system token
        if not user.is_authenticated or not user.is_superuser:
            raise GraphQLError("Permission denied. Admin access required.")
        
        if not isinstance(translations, dict):
            raise GraphQLError("Invalid translations format. Expected JSON object.")
        
        syncer = TranslationSyncer()
        stats = syncer.sync_from_json(translations)
        
        return SyncTranslationKeysMutation(
            success=True,
            created=stats['created'],
            updated=stats['updated'],
            deprecated=stats['deprecated'],
            message=f"Sync complete: {stats['created']} created, {stats['updated']} updated, {stats['deprecated']} deprecated"
        )


class RollbackTranslationsMutation(relay.ClientIDMutation):
    """Rollback to a previous translation version."""
    
    class Input:
        version_id = graphene.ID(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    @classmethod
    def mutate_and_get_payload(cls, root, info, version_id):
        user = info.context.user
        
        if not user.is_authenticated or not user.is_superuser:
            raise GraphQLError("Permission denied. Admin access required.")
        
        try:
            # Decode relay ID if needed
            try:
                from graphql_relay import from_global_id
                _, pk = from_global_id(version_id)
            except Exception:
                pk = version_id
            
            version = TranslationVersion.objects.get(pk=pk)
        except TranslationVersion.DoesNotExist:
            raise GraphQLError("Version not found")
        
        publisher = TranslationPublisher()
        publisher.rollback_to(version)
        
        return RollbackTranslationsMutation(
            success=True,
            message=f"Rolled back {version.locale.name} to version {version.version}"
        )


class TranslationsMutation(graphene.ObjectType):
    """Mutations for translation management."""
    
    publish_translations = PublishTranslationsMutation.Field()
    sync_translation_keys = SyncTranslationKeysMutation.Field()
    rollback_translations = RollbackTranslationsMutation.Field()

