from storages.backends.s3boto3 import S3Boto3Storage


class MockS3Boto3Storage(S3Boto3Storage):
    """
    This is a mock storage, meant to be used in pytest environment only!
    Never use this in production environment as it doesn't actually save any files in S3.
    """

    def _save(self, name, content):
        return self._clean_name(name)
