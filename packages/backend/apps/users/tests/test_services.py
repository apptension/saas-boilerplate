import pytest
import datetime
import io
import os
import json
import zipfile
import boto3
from moto import mock_s3
from unittest.mock import call

from django.conf import settings
from apps.users.exceptions import OTPVerificationFailure
from apps.users.models import User
from utils import hashid
from ..services.otp import validate_otp
from ..services.export.services.export import ExportUserArchive

pytestmark = pytest.mark.django_db


class TestValidateOtp:
    def test_otp_is_not_verified_raises_exception(self, user: User):
        with pytest.raises(OTPVerificationFailure) as error:
            validate_otp(user, "token")

        assert str(error.value) == "OTP must be verified first"

    def test_invalid_token_raises_exception(self, user_factory, totp_mock):
        user = user_factory.create(otp_verified=True)
        totp_mock(verify=False)

        with pytest.raises(OTPVerificationFailure) as error:
            validate_otp(user, "token")

        assert str(error.value) == "Verification token is invalid"


class TestExportUserArchive:
    @pytest.fixture
    def user(self, user_factory):
        return user_factory.create()

    @pytest.fixture
    def export_user_archive(self, user) -> ExportUserArchive:
        return ExportUserArchive(user=user)

    @pytest.fixture
    def mocked_zip_file(self, mocker):
        zip_file_mock = mocker.MagicMock(spec=zipfile.ZipFile)
        mocker.patch("zipfile.ZipFile", return_value=zip_file_mock)
        mocked_zip_file = zip_file_mock.__enter__.return_value = mocker.Mock()

        return mocked_zip_file

    @pytest.fixture
    def file_cleanup(self, user):
        hashed_user_id = hashid.encode(user.id)
        yield
        os.remove(f"/tmp/{hashed_user_id}.zip")

    def test_user_data_is_exported(self, user, export_user_archive):
        data = export_user_archive._export_user_data()
        assert data.get("user") == json.dumps(
            {
                "id": hashid.encode(user.id),
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

    @pytest.mark.usefixtures('file_cleanup', 's3_exports_bucket')
    @pytest.mark.freeze_time
    def test_user_archive_export_url_is_generated(self, user, export_user_archive):
        timestamp = datetime.datetime.now().strftime("%d-%m-%y_%H-%M-%S")
        expected_obj_key = f"exports/{hashid.encode(user.id)}_{timestamp}.zip"

        export_url = export_user_archive.run()

        assert settings.AWS_EXPORTS_STORAGE_BUCKET_NAME in export_url
        assert expected_obj_key in export_url
