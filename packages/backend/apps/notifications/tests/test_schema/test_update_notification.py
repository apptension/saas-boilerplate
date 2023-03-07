import pytest
from django.utils import timezone
from graphql_relay import to_global_id

pytestmark = pytest.mark.django_db


class TestUpdateNotificationMutation:
    MUTATION = '''
        mutation updateNotification($input: UpdateNotificationMutationInput!){
          updateNotification(input: $input) {
            hasUnreadNotifications
            notification {
                id
                readAt
            }
          }
        }
    '''

    @pytest.mark.freeze_time('2021-05-09')
    def test_mark_read_notification(self, graphene_client, user, notification_factory):
        notification = notification_factory(read_at=None, user=user)
        input_data = {"id": to_global_id('NotificationType', str(notification.id)), "isRead": True}

        graphene_client.force_authenticate(user)
        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={'input': input_data},
        )

        notification.refresh_from_db()
        assert notification.read_at is not None
        assert executed == {
            "data": {
                "updateNotification": {
                    "hasUnreadNotifications": False,
                    "notification": {"id": input_data["id"], "readAt": "2021-05-09T00:00:00+00:00"},
                }
            }
        }

    @pytest.mark.freeze_time('2021-05-09')
    def test_mark_unread_notification(self, graphene_client, user, notification_factory):
        notification = notification_factory(read_at=timezone.now(), user=user)
        input_data = {"id": to_global_id('NotificationType', str(notification.id)), "isRead": False}

        graphene_client.force_authenticate(user)
        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={'input': input_data},
        )

        notification.refresh_from_db()
        assert notification.read_at is None
        assert executed == {
            "data": {
                "updateNotification": {
                    "hasUnreadNotifications": True,
                    "notification": {"id": input_data["id"], "readAt": None},
                },
            }
        }

    @pytest.mark.freeze_time('2021-05-09')
    def test_has_more_unread_notifications(self, graphene_client, user, notification_factory):
        notification_factory(read_at=None, user=user)
        notification = notification_factory(read_at=None, user=user)
        input_data = {"id": to_global_id('NotificationType', str(notification.id)), "isRead": True}

        graphene_client.force_authenticate(user)
        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={'input': input_data},
        )

        notification.refresh_from_db()
        assert notification.read_at is not None
        assert executed == {
            "data": {
                "updateNotification": {
                    "hasUnreadNotifications": True,
                    "notification": {"id": input_data["id"], "readAt": "2021-05-09T00:00:00+00:00"},
                },
            }
        }

    def test_mark_read_other_user_notification(self, graphene_client, user_factory, notification_factory):
        first_user = user_factory()
        second_user = user_factory()
        read_at = timezone.now()
        notification = notification_factory(read_at=read_at, user=first_user)
        input_data = {"id": to_global_id('NotificationType', str(notification.id)), "isRead": False}

        graphene_client.force_authenticate(second_user)
        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={'input': input_data},
        )

        notification.refresh_from_db()
        assert notification.read_at == read_at
        assert executed["errors"][0]["message"] == "No Notification matches the given query."

    def test_mark_read_by_unauthenticated_user(self, graphene_client, notification_factory):
        read_at = timezone.now()
        notification = notification_factory(read_at=read_at)
        input_data = {"id": to_global_id('NotificationType', str(notification.id)), "isRead": False}

        executed = graphene_client.mutate(
            self.MUTATION,
            variable_values={'input': input_data},
        )

        notification.refresh_from_db()
        assert notification.read_at == read_at
        assert executed["errors"][0]["message"] == "permission_denied"
