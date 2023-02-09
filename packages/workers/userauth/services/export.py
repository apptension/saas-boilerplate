import io
import json
from typing import Union

import boto3
import settings
from common.protocols import UserDataExportable
from demo.services.export import CrudDemoItemDataExport
from ..models import User
from ..types import UserType


class UserDataExport(UserDataExportable):
    export_key = "user"
    schema_class = UserType

    @classmethod
    def export(cls, user: User) -> Union[str, list[str]]:
        return cls.schema_class.from_orm(user).json()


def export_user_data(user: User) -> dict:
    data_exports: list[UserDataExportable] = [UserDataExport, CrudDemoItemDataExport]
    export_data = {}

    for user_data_export in data_exports:
        export_data[user_data_export.export_key] = user_data_export.export(user)

    return export_data


def upload_user_data_to_s3(user_data: dict, obj_key: str):
    s3 = boto3.client("s3", endpoint_url=settings.AWS_S3_ENDPOINT_URL)
    with io.BytesIO() as json_file:
        json_file.write(json.dumps(user_data).encode('utf-8'))
        json_file.seek(0)
        s3.upload_fileobj(json_file, settings.AWS_EXPORTS_STORAGE_BUCKET_NAME, obj_key)


def get_user_data_url(obj_key: str) -> str:
    s3 = boto3.client("s3", endpoint_url=settings.AWS_S3_ENDPOINT_URL)
    return s3.generate_presigned_url(
        'get_object',
        Params={'Bucket': settings.AWS_EXPORTS_STORAGE_BUCKET_NAME, 'Key': obj_key},
        ExpiresIn=settings.USER_DATA_EXPORT_EXPIRY_SECONDS,
    )


def get_user_data_object_key(user_id: str) -> str:
    return f"exports/{user_id}.json"
