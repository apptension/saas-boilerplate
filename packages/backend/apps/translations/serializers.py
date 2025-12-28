"""
REST API serializers for translations.
"""

from rest_framework import serializers

from .models import Locale, TranslationKey, Translation, AITranslationJob


class LocaleSerializer(serializers.ModelSerializer):
    """Serializer for Locale model."""
    
    translation_progress = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Locale
        fields = [
            'id', 'code', 'name', 'native_name', 
            'is_default', 'is_active', 'rtl', 'translation_progress'
        ]


class TranslationKeySerializer(serializers.ModelSerializer):
    """Serializer for TranslationKey model."""
    
    class Meta:
        model = TranslationKey
        fields = ['id', 'key', 'default_message', 'description', 'is_deprecated']


class TranslationSerializer(serializers.ModelSerializer):
    """Serializer for Translation model."""
    
    key_id = serializers.CharField(source='key.key', read_only=True)
    locale_code = serializers.CharField(source='locale.code', read_only=True)
    
    class Meta:
        model = Translation
        fields = ['id', 'key_id', 'locale_code', 'value', 'status', 'updated_at']


class SyncTranslationsSerializer(serializers.Serializer):
    """Serializer for syncing translation keys."""
    
    translations = serializers.JSONField(
        help_text="Dictionary of translation keys from formatjs extract"
    )

    def validate_translations(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Expected a dictionary of translation keys")
        return value


class PublishTranslationsSerializer(serializers.Serializer):
    """Serializer for publishing translations."""
    
    locale_code = serializers.CharField(max_length=10)

    def validate_locale_code(self, value):
        try:
            Locale.objects.get(code=value, is_active=True)
        except Locale.DoesNotExist:
            raise serializers.ValidationError(f"Locale '{value}' not found or inactive")
        return value


class AITranslationJobSerializer(serializers.ModelSerializer):
    """Serializer for AI translation jobs."""
    
    source_locale_code = serializers.CharField(source='source_locale.code', read_only=True)
    target_locale_code = serializers.CharField(source='target_locale.code', read_only=True)
    source_locale_name = serializers.CharField(source='source_locale.name', read_only=True)
    target_locale_name = serializers.CharField(source='target_locale.name', read_only=True)
    created_by_email = serializers.CharField(source='created_by.email', read_only=True, default=None)
    progress_percent = serializers.IntegerField(read_only=True)
    successful_translations = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = AITranslationJob
        fields = [
            'id', 'status', 'source_locale', 'target_locale',
            'source_locale_code', 'target_locale_code',
            'source_locale_name', 'target_locale_name',
            'overwrite_existing', 'auto_publish', 'batch_size',
            'total_keys', 'processed_keys', 'failed_keys', 'skipped_keys',
            'successful_translations', 'progress_percent',
            'error_message', 'created_by_email',
            'created_at', 'started_at', 'completed_at',
        ]


class CreateAITranslationJobSerializer(serializers.Serializer):
    """Serializer for creating AI translation jobs."""
    
    source_locale_id = serializers.IntegerField()
    target_locale_id = serializers.IntegerField()
    overwrite_existing = serializers.BooleanField(required=False, default=False)
    auto_publish = serializers.BooleanField(required=False, default=False)
    batch_size = serializers.IntegerField(required=False, default=20, min_value=1, max_value=50)
    
    def validate_source_locale_id(self, value):
        try:
            Locale.objects.get(pk=value, is_active=True)
        except Locale.DoesNotExist:
            raise serializers.ValidationError("Source locale not found or inactive")
        return value
    
    def validate_target_locale_id(self, value):
        try:
            Locale.objects.get(pk=value, is_active=True)
        except Locale.DoesNotExist:
            raise serializers.ValidationError("Target locale not found or inactive")
        return value

