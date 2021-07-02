import secrets
from django.conf import settings
from django.utils.deconstruct import deconstructible

from storages.backends.s3boto3 import S3Boto3Storage


@deconstructible
class UniqueFilePathGenerator:
    def __init__(self, path):
        self.path = path

    def __call__(self, _, filename, *args, **kwargs):
        return f"{self.path}/{secrets.token_hex(8)}/{filename}"


class S3Boto3StorageWithCDN(S3Boto3Storage):
    custom_domain = False

    def url(self, name, parameters=None, expire=None, http_method=None):
        url = super().url(name, parameters, expire, http_method)
        return url.replace(f"{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com", f"{settings.AWS_S3_CUSTOM_DOMAIN}")
