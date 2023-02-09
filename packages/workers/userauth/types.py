import datetime

from common.types import OrmBase


class UserProfile(OrmBase):
    first_name: str
    last_name: str


class UserType(OrmBase):
    profile: UserProfile
    email: str
    is_superuser: bool
    is_active: bool
    is_confirmed: bool
    created: datetime.datetime
