from rest_framework import serializers
from hashid_field import rest as hidrest

from apps.content import models as content_models
from . import models


class CrudDemoItemSerializer(serializers.ModelSerializer):
    id = hidrest.HashidSerializerCharField(source_field="users.User.id", read_only=True)
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    def update(self, instance, validated_data):
        instance.edited_by = self.context['request'].user
        return super().update(instance, validated_data)

    class Meta:
        model = models.CrudDemoItem
        fields = ('id', 'name', 'user')


class ContentfulDemoItemFavoriteSerializer(serializers.ModelSerializer):
    item = serializers.PrimaryKeyRelatedField(queryset=content_models.DemoItem.objects.all())
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = models.ContentfulDemoItemFavorite
        fields = ('item', 'user')
