from typing import Protocol, Type, Union
from pydantic import BaseModel
from userauth.models import User


class UserDataExportable(Protocol):
    export_key: str
    schema_class: Type[BaseModel]

    @classmethod
    def export(cls, user: User) -> Union[str, list[str]]:
        ...


class UserFilesExportable(Protocol):
    @classmethod
    def export(cls, user: User) -> list[str]:
        ...
