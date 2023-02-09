import io
import json

import boto3
import settings
from moto import mock_s3

import pytest
from userauth.services.export import export_user_data, upload_user_data_to_s3, get_user_data_url

pytestmark = pytest.mark.usefixtures('db_session')


class TestExportUserData:
    def test_user_data_is_exported(self, user_factory):
        user = user_factory.create()
        data = export_user_data(user)
        assert data.get("user") == json.dumps(
            {
                "id": user.id,
                "profile": {
                    "id": user.profile.id,
                    "first_name": user.profile.first_name,
                    "last_name": user.profile.last_name,
                },
                "email": user.email,
                "is_superuser": user.is_superuser,
                "is_active": user.is_active,
                "is_confirmed": user.is_confirmed,
                "created": user.created.isoformat(),
            }
        )

    def test_crud_demo_items_data_is_exported(self, user_factory, crud_demo_item_factory):
        user = user_factory.create()
        item = crud_demo_item_factory.create(created_by=user)

        data = export_user_data(user)

        assert data.get("crud_demo_items") == [json.dumps({"id": item.id, "name": item.name})]


class TestUploadUserDataToS3:
    @mock_s3
    def test_success(self):
        s3 = boto3.resource("s3", region_name='us-east-1')
        bucket = s3.Bucket(settings.AWS_EXPORTS_STORAGE_BUCKET_NAME)
        bucket.create()
        user_data = {"some": "data"}
        obj_key = "export.json"
        expected_obj = io.BytesIO(json.dumps(user_data).encode('utf-8')).getvalue()

        upload_user_data_to_s3(user_data, obj_key)
        result = s3.Object(settings.AWS_EXPORTS_STORAGE_BUCKET_NAME, obj_key)

        assert result.get()['Body'].read() == expected_obj


class TestGetUserDataUrl:
    @mock_s3
    def test_success(self, tmpdir):
        s3 = boto3.resource("s3", region_name='us-east-1')
        bucket = s3.Bucket(settings.AWS_EXPORTS_STORAGE_BUCKET_NAME)
        bucket.create()
        obj_key = "export.json"
        file = tmpdir.join(obj_key)
        file.write(io.BytesIO(b'some content').getvalue())
        bucket.upload_file(str(file), obj_key)

        result = get_user_data_url(obj_key)

        assert (
            f"https://{settings.AWS_EXPORTS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{obj_key}?AWSAccessKeyId=" in result
        )
