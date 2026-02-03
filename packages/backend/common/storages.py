import os
import secrets
from tempfile import SpooledTemporaryFile

from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.utils.deconstruct import deconstructible
from storages.backends.s3boto3 import S3Boto3Storage


@deconstructible
class UniqueFilePathGenerator:
    def __init__(self, path_prefix):
        self.path_prefix = path_prefix

    def __call__(self, _, filename, *args, **kwargs):
        return f"{self.path_prefix}/{secrets.token_hex(8)}/{filename}"


class CustomS3Boto3Storage(S3Boto3Storage):
    """AWS S3 storage backend (default behavior)"""

    # Overwritten to avoid "I/O operation on closed file" error when creating thumbnails
    # https://github.com/matthewwithanm/django-imagekit/issues/391#issuecomment-592877289
    def _save(self, name, content):
        content.seek(0, os.SEEK_SET)
        with SpooledTemporaryFile() as content_autoclose:
            content_autoclose.write(content.read())
            return super()._save(name, content_autoclose)


class PublicS3Boto3StorageWithCDN(CustomS3Boto3Storage):
    querystring_auth = False
    location = "public"


@deconstructible
class PublicCloudflareR2Storage(S3Boto3Storage):
    """
    Public Cloudflare R2 storage backend for user-facing assets like avatars.
    Uses querystring_auth=False for public URLs.
    Enforces SigV4 signature which is required by Cloudflare R2.
    """

    def __init__(self, **kwargs):
        kwargs.setdefault("endpoint_url", getattr(settings, "R2_ENDPOINT_URL", None))
        kwargs.setdefault("access_key", getattr(settings, "R2_ACCESS_KEY_ID", None))
        kwargs.setdefault("secret_key", getattr(settings, "R2_SECRET_ACCESS_KEY", None))
        kwargs.setdefault("bucket_name", getattr(settings, "R2_BUCKET_NAME", None))
        kwargs.setdefault("default_acl", None)
        kwargs.setdefault("querystring_auth", False)  # Public access
        kwargs.setdefault("location", "public")
        # R2 requires SigV4 - SigV2 is not supported
        kwargs.setdefault("signature_version", "s3v4")

        custom_domain = getattr(settings, "R2_CUSTOM_DOMAIN", None)
        if custom_domain:
            kwargs.setdefault("custom_domain", custom_domain)

        super().__init__(**kwargs)

    def _save(self, name, content):
        content.seek(0, os.SEEK_SET)
        with SpooledTemporaryFile() as content_autoclose:
            content_autoclose.write(content.read())
            return super()._save(name, content_autoclose)


@deconstructible
class CloudflareR2Storage(S3Boto3Storage):
    """
    Cloudflare R2 storage backend - S3-compatible object storage.
    Used for private files that require signed URLs.
    Enforces SigV4 signature which is required by Cloudflare R2.

    Configure with environment variables:
    - R2_ENDPOINT_URL: https://<account-id>.r2.cloudflarestorage.com
    - R2_ACCESS_KEY_ID: Your R2 access key
    - R2_SECRET_ACCESS_KEY: Your R2 secret key
    - R2_BUCKET_NAME: Your bucket name
    - R2_CUSTOM_DOMAIN: (optional) Custom domain for public access
    """

    def __init__(self, **kwargs):
        # R2 uses S3-compatible API but needs explicit endpoint
        kwargs.setdefault("endpoint_url", getattr(settings, "R2_ENDPOINT_URL", None))
        kwargs.setdefault("access_key", getattr(settings, "R2_ACCESS_KEY_ID", None))
        kwargs.setdefault("secret_key", getattr(settings, "R2_SECRET_ACCESS_KEY", None))
        kwargs.setdefault("bucket_name", getattr(settings, "R2_BUCKET_NAME", None))

        # R2 doesn't support some S3 features
        kwargs.setdefault("default_acl", None)
        kwargs.setdefault("querystring_auth", True)
        # R2 requires SigV4 - SigV2 is not supported
        kwargs.setdefault("signature_version", "s3v4")

        # Use custom domain if provided (for public bucket access)
        custom_domain = getattr(settings, "R2_CUSTOM_DOMAIN", None)
        if custom_domain:
            kwargs.setdefault("custom_domain", custom_domain)

        super().__init__(**kwargs)

    def _save(self, name, content):
        # Same fix as CustomS3Boto3Storage for thumbnail issues
        content.seek(0, os.SEEK_SET)
        with SpooledTemporaryFile() as content_autoclose:
            content_autoclose.write(content.read())
            return super()._save(name, content_autoclose)


@deconstructible
class BackblazeB2Storage(S3Boto3Storage):
    """
    Backblaze B2 storage backend - S3-compatible object storage.

    Configure with environment variables:
    - B2_ENDPOINT_URL: https://s3.<region>.backblazeb2.com
    - B2_ACCESS_KEY_ID: Your B2 application key ID
    - B2_SECRET_ACCESS_KEY: Your B2 application key
    - B2_BUCKET_NAME: Your bucket name
    """

    def __init__(self, **kwargs):
        kwargs.setdefault("endpoint_url", getattr(settings, "B2_ENDPOINT_URL", None))
        kwargs.setdefault("access_key", getattr(settings, "B2_ACCESS_KEY_ID", None))
        kwargs.setdefault("secret_key", getattr(settings, "B2_SECRET_ACCESS_KEY", None))
        kwargs.setdefault("bucket_name", getattr(settings, "B2_BUCKET_NAME", None))
        kwargs.setdefault("default_acl", None)

        super().__init__(**kwargs)

    def _save(self, name, content):
        content.seek(0, os.SEEK_SET)
        with SpooledTemporaryFile() as content_autoclose:
            content_autoclose.write(content.read())
            return super()._save(name, content_autoclose)


@deconstructible
class MinIOStorage(S3Boto3Storage):
    """
    MinIO storage backend - self-hosted S3-compatible object storage.

    Configure with environment variables:
    - MINIO_ENDPOINT_URL: http://minio:9000 (or your MinIO endpoint)
    - MINIO_ACCESS_KEY_ID: Your MinIO access key
    - MINIO_SECRET_ACCESS_KEY: Your MinIO secret key
    - MINIO_BUCKET_NAME: Your bucket name
    """

    def __init__(self, **kwargs):
        kwargs.setdefault("endpoint_url", getattr(settings, "MINIO_ENDPOINT_URL", None))
        kwargs.setdefault("access_key", getattr(settings, "MINIO_ACCESS_KEY_ID", None))
        kwargs.setdefault("secret_key", getattr(settings, "MINIO_SECRET_ACCESS_KEY", None))
        kwargs.setdefault("bucket_name", getattr(settings, "MINIO_BUCKET_NAME", None))
        kwargs.setdefault("default_acl", None)

        super().__init__(**kwargs)

    def _save(self, name, content):
        content.seek(0, os.SEEK_SET)
        with SpooledTemporaryFile() as content_autoclose:
            content_autoclose.write(content.read())
            return super()._save(name, content_autoclose)


@deconstructible
class LocalMediaStorage(FileSystemStorage):
    """
    Local filesystem storage for development and VPS deployments.

    Configure with environment variables:
    - MEDIA_ROOT: /path/to/media (default: BASE_DIR/media)
    - MEDIA_URL: /media/ (default)
    """

    def __init__(self, **kwargs):
        kwargs.setdefault("location", getattr(settings, "MEDIA_ROOT", None))
        kwargs.setdefault("base_url", getattr(settings, "MEDIA_URL", "/media/"))
        super().__init__(**kwargs)


@deconstructible
class PublicBackblazeB2Storage(S3Boto3Storage):
    """Public Backblaze B2 storage for user-facing assets."""

    def __init__(self, **kwargs):
        kwargs.setdefault("endpoint_url", getattr(settings, "B2_ENDPOINT_URL", None))
        kwargs.setdefault("access_key", getattr(settings, "B2_ACCESS_KEY_ID", None))
        kwargs.setdefault("secret_key", getattr(settings, "B2_SECRET_ACCESS_KEY", None))
        kwargs.setdefault("bucket_name", getattr(settings, "B2_BUCKET_NAME", None))
        kwargs.setdefault("default_acl", None)
        kwargs.setdefault("querystring_auth", False)
        kwargs.setdefault("location", "public")
        super().__init__(**kwargs)

    def _save(self, name, content):
        content.seek(0, os.SEEK_SET)
        with SpooledTemporaryFile() as content_autoclose:
            content_autoclose.write(content.read())
            return super()._save(name, content_autoclose)


@deconstructible
class PublicMinIOStorage(S3Boto3Storage):
    """Public MinIO storage for user-facing assets."""

    def __init__(self, **kwargs):
        kwargs.setdefault("endpoint_url", getattr(settings, "MINIO_ENDPOINT_URL", None))
        kwargs.setdefault("access_key", getattr(settings, "MINIO_ACCESS_KEY_ID", None))
        kwargs.setdefault("secret_key", getattr(settings, "MINIO_SECRET_ACCESS_KEY", None))
        kwargs.setdefault("bucket_name", getattr(settings, "MINIO_BUCKET_NAME", None))
        kwargs.setdefault("default_acl", None)
        kwargs.setdefault("querystring_auth", False)
        kwargs.setdefault("location", "public")
        super().__init__(**kwargs)

    def _save(self, name, content):
        content.seek(0, os.SEEK_SET)
        with SpooledTemporaryFile() as content_autoclose:
            content_autoclose.write(content.read())
            return super()._save(name, content_autoclose)


# Storage backend registry
STORAGE_BACKENDS = {
    "s3": "common.storages.CustomS3Boto3Storage",
    "r2": "common.storages.CloudflareR2Storage",
    "b2": "common.storages.BackblazeB2Storage",
    "minio": "common.storages.MinIOStorage",
    "local": "common.storages.LocalMediaStorage",
}


def get_default_storage_backend():
    """
    Factory function to get storage backend class path based on STORAGE_BACKEND env var.

    Supported backends:
    - s3: AWS S3 (default)
    - r2: Cloudflare R2
    - b2: Backblaze B2
    - minio: Self-hosted MinIO
    - local: Local filesystem

    Usage in settings.py:
        STORAGES = {
            "default": {"BACKEND": get_default_storage_backend()},
            ...
        }
    """
    backend = os.environ.get("STORAGE_BACKEND", "s3")
    return STORAGE_BACKENDS.get(backend, STORAGE_BACKENDS["s3"])


# Public storage backend registry (for user-facing assets like avatars)
PUBLIC_STORAGE_BACKENDS = {
    "s3": PublicS3Boto3StorageWithCDN,
    "r2": PublicCloudflareR2Storage,
    "b2": PublicBackblazeB2Storage,
    "minio": PublicMinIOStorage,
    "local": LocalMediaStorage,
}


def get_public_storage():
    """
    Get the public storage backend instance based on STORAGE_BACKEND env var.

    Used for user-facing assets like avatars that need public URLs.

    Usage in models:
        avatar = models.ImageField(storage=get_public_storage, ...)

    Note: Pass the function itself (not called) to ImageField for lazy evaluation.
    """
    backend = os.environ.get("STORAGE_BACKEND", "s3")
    storage_class = PUBLIC_STORAGE_BACKENDS.get(backend, PUBLIC_STORAGE_BACKENDS["s3"])
    return storage_class()


def get_translations_storage():
    """
    Get the storage backend instance for translations.

    Uses the same backend as public storage but with 'translations' location prefix.
    This ensures translations are stored in the same bucket as other public assets.

    Supported backends (based on STORAGE_BACKEND env var):
    - s3: AWS S3
    - r2: Cloudflare R2
    - b2: Backblaze B2
    - minio: Self-hosted MinIO
    - local: Local filesystem

    Returns:
        Storage instance configured for translations
    """
    backend = os.environ.get("STORAGE_BACKEND", "s3")

    if backend == "local":
        return LocalMediaStorage(location=os.path.join(getattr(settings, "MEDIA_ROOT", ""), "translations"))

    # For cloud backends, use the public storage class with translations location
    storage_classes = {
        "s3": PublicS3Boto3StorageWithCDN,
        "r2": PublicCloudflareR2Storage,
        "b2": PublicBackblazeB2Storage,
        "minio": PublicMinIOStorage,
    }

    storage_class = storage_classes.get(backend, PublicS3Boto3StorageWithCDN)
    return storage_class(location="translations")


# Private storage backend registry (for files requiring signed URLs like exports)
PRIVATE_STORAGE_BACKENDS = {
    "s3": CustomS3Boto3Storage,
    "r2": CloudflareR2Storage,
    "b2": BackblazeB2Storage,
    "minio": MinIOStorage,
    "local": LocalMediaStorage,
}


def get_exports_storage():
    """
    Get the storage backend instance for private exports (action logs, reports, etc.).

    Uses signed URLs for secure downloads. For R2, this enforces SigV4.

    Supported backends (based on STORAGE_BACKEND env var):
    - s3: AWS S3
    - r2: Cloudflare R2 (uses SigV4)
    - b2: Backblaze B2
    - minio: Self-hosted MinIO
    - local: Local filesystem

    Returns:
        Storage instance configured for exports with 'exports' location prefix
    """
    backend = os.environ.get("STORAGE_BACKEND", "s3")

    if backend == "local":
        return LocalMediaStorage(location=os.path.join(getattr(settings, "MEDIA_ROOT", ""), "exports"))

    # For cloud backends, use the private storage class with exports location
    storage_class = PRIVATE_STORAGE_BACKENDS.get(backend, CustomS3Boto3Storage)
    return storage_class(location="exports")
