import os
import secrets
from tempfile import SpooledTemporaryFile

from django.utils.deconstruct import deconstructible
from storages.backends.s3boto3 import S3Boto3Storage


@deconstructible
class UniqueFilePathGenerator:
    def __init__(self, path_prefix):
        self.path_prefix = path_prefix

    def __call__(self, _, filename, *args, **kwargs):
        return f"{self.path_prefix}/{secrets.token_hex(8)}/{filename}"


class CustomS3Boto3Storage(S3Boto3Storage):
    # Overwritten to avoid "I/O operation on closed file" error when creating thumbnails
    # https://github.com/matthewwithanm/django-imagekit/issues/391#issuecomment-592877289
    def _save(self, name, content):
        content.seek(0, os.SEEK_SET)
        with SpooledTemporaryFile() as content_autoclose:
            content_autoclose.write(content.read())
            return super()._save(name, content_autoclose)


class PublicS3Boto3StorageWithCDN(CustomS3Boto3Storage):
    querystring_auth = False
    location = 'public'
