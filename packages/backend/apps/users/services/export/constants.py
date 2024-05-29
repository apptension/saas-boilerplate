from enum import Enum


class ExportUserArchiveRootPaths(str, Enum):
    LOCAL_ROOT = "tmp"
    S3_ROOT = "exports"


class UserEmails(str, Enum):
    USER_EXPORT = "USER_EXPORT"
    USER_EXPORT_ADMIN = "USER_EXPORT_ADMIN"
