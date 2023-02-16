from common.protocols import UserDataExportable, UserFilesExportable
from userauth.models import User
from ..types import CrudDemoItemType


class CrudDemoItemDataExport(UserDataExportable):
    export_key = "crud_demo_items"
    schema_class = CrudDemoItemType

    @classmethod
    def export(cls, user: User) -> list[str]:
        return [cls.schema_class.from_orm(item).json() for item in user.cruddemoitem_set]


class DocumentDemoItemFileExport(UserFilesExportable):
    @classmethod
    def export(cls, user: User) -> list[str]:
        return [document.file for document in user.documents]
