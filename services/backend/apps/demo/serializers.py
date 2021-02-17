from rest_framework import serializers
from hashid_field import rest

from apps.content import models as content_models
from . import models


class CrudDemoItemSerializer(serializers.ModelSerializer):
    id = rest.HashidSerializerCharField(source_field="users.User.id", read_only=True)

    class Meta:
        model = models.CrudDemoItem
        fields = ('id', 'name')


class ContentfulDemoItemFavoriteSerializer(serializers.ModelSerializer):
    item = serializers.PrimaryKeyRelatedField(queryset=content_models.DemoItem.objects.all())
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = models.ContentfulDemoItemFavorite
        fields = ('item', 'user')
