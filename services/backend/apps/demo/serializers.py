from rest_framework import serializers
from hashid_field import rest

from . import models


class CrudDemoItemSerializer(serializers.ModelSerializer):
    id = rest.HashidSerializerCharField(source_field="users.User.id", read_only=True)

    class Meta:
        model = models.CrudDemoItem
        fields = ('id', 'name')
