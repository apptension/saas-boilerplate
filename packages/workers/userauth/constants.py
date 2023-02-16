from enum import Enum


class UserEmails(str, Enum):
    USER_EXPORT = "USER_EXPORT"
    USER_EXPORT_ADMIN = "USER_EXPORT_ADMIN"
