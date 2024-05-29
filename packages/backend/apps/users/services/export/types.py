import datetime
from typing import TypedDict

from pydantic import validator, BaseModel


class OrmBase(BaseModel):
    id: int

    @validator("*", pre=True)
    def evaluate_lazy_columns(cls, v):
        if isinstance(v, Query):
            return v.all()
        return v

    class Config:
        orm_mode = True


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


class ExportedUserData(TypedDict):
    email: str
    export_url: str
