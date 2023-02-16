import json
import os.path

import pytest
import settings
from moto import mock_events
from utils import hashid
from ..constants import UserEmails
from ..handlers import user_data_export
from ..services.export import ExportUserArchive

pytestmark = pytest.mark.usefixtures('db_session')


class TestUserDataExport:
    @pytest.fixture
    def user_export_email_data_factory(self):
        def _factory(user):
            return {"email": user.email, "export_url": ExportUserArchive(user).run()}

        return _factory

    @mock_events
    @pytest.mark.usefixtures("s3_exports_bucket")
    @pytest.mark.freeze_time
    def test_user_data_export_sends_emails_with_exported_data(
        self, user_factory, mocker, user_export_email_data_factory, uuid_mock
    ):
        users = user_factory.create_batch(2)
        admin_email = "admin@example.com"
        event_detail = {"user_ids": [hashid.encode(user.id) for user in users], "admin_email": admin_email}
        expected_users_emails_events = [
            {
                'Source': 'backend.email',
                'DetailType': UserEmails.USER_EXPORT.value,
                'Detail': json.dumps(
                    {
                        "id": str(uuid_mock.hex),
                        "type": UserEmails.USER_EXPORT.value,
                        "to": user.email,
                        "data": user_export_email_data_factory(user),
                    }
                ),
                'EventBusName': settings.WORKERS_EVENT_BUS_NAME,
            }
            for user in users
        ]
        expected_admin_email_event = {
            'Source': 'backend.email',
            'DetailType': UserEmails.USER_EXPORT_ADMIN.value,
            'Detail': json.dumps(
                {
                    "id": str(uuid_mock.hex),
                    "type": UserEmails.USER_EXPORT_ADMIN.value,
                    "to": admin_email,
                    "data": [user_export_email_data_factory(user) for user in users],
                }
            ),
            'EventBusName': settings.WORKERS_EVENT_BUS_NAME,
        }
        hashed_user_ids = [hashid.encode(user.id) for user in users]
        send_export_emails_mock = mocker.patch("userauth.services.user.process_user_data_export._send_export_emails")

        user_data_export(event={"detail": event_detail}, context={})

        send_export_emails_mock.assert_called_once_with([*expected_users_emails_events, expected_admin_email_event])
        assert os.path.exists(f"/tmp/{hashed_user_ids[0]}.zip")
        assert os.path.exists(f"/tmp/{hashed_user_ids[1]}.zip")
