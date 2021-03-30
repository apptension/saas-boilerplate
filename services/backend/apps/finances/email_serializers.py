from rest_framework import serializers


class TrialExpiresSoonEmailSerializer(serializers.Serializer):
    expiry_date = serializers.DateTimeField()
