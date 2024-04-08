from config import settings
from hashid_field import rest as hidrest
from rest_framework import serializers
from django.utils.translation import gettext as _

from apps.content import models as content_models
from . import models


class CrudDemoItemSerializer(serializers.ModelSerializer):
    id = hidrest.HashidSerializerCharField(source_field="users.User.id", read_only=True)
    tenant_id = hidrest.HashidSerializerCharField()
    created_by = serializers.HiddenField(default=serializers.CurrentUserDefault())

    def update(self, instance, validated_data):
        instance.edited_by = self.context['request'].user
        return super().update(instance, validated_data)

    class Meta:
        model = models.CrudDemoItem
        fields = ('id', 'tenant_id', 'name', 'created_by')


class DocumentDemoItemSerializer(serializers.ModelSerializer):
    id = hidrest.HashidSerializerCharField(source_field="users.User.id", read_only=True)
    created_by = serializers.HiddenField(default=serializers.CurrentUserDefault())
    file = serializers.FileField(required=False)

    def validate(self, attrs):
        if not self.instance and attrs["created_by"].documents.count() >= settings.USER_DOCUMENTS_NUMBER_LIMIT:
            raise serializers.ValidationError(_('User has reached documents number limit.'))
        return attrs

    def validate_file(self, file):
        if file.size > settings.UPLOADED_DOCUMENT_SIZE_LIMIT:
            raise serializers.ValidationError(_('File is too large.'))
        return file

    class Meta:
        model = models.DocumentDemoItem
        fields = ('id', 'file', 'created_by')


class ContentfulDemoItemFavoriteSerializer(serializers.ModelSerializer):
    item = serializers.PrimaryKeyRelatedField(queryset=content_models.DemoItem.objects.all())
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = models.ContentfulDemoItemFavorite
        fields = ('item', 'user')
