import pytest
from django.utils import timezone

from apps.notifications import models as notification_models

pytestmark = pytest.mark.django_db


class TestUpdateNotificationMutation:
    MUTATION = '''
        mutation markReadAllNotifications($input: MarkReadAllNotificationsMutationInput!) {
          markReadAllNotifications(input: $input) {
            ok
          }
        }
    '''

    def test_mark_read_all_user_notifications(self, graphene_client, user, notification_factory):
        notification_factory.create_batch(2, read_at=None, user=user)

        graphene_client.force_authenticate(user)
        executed = self.mutate(graphene_client)

        assert self.is_ok_response(executed), executed
        assert not notification_models.Notification.objects.filter_by_user(user).filter_unread().exists()

    def test_dont_overwrite_read_at_time(self, graphene_client, user, notification_factory):
        now = timezone.now()
        notifications = notification_factory.create_batch(2, read_at=now, user=user)

        graphene_client.force_authenticate(user)
        executed = self.mutate(graphene_client)

        assert self.is_ok_response(executed), executed
        assert notification_models.Notification.objects.filter_by_user(user).filter(read_at=now).count() == len(
            notifications
        )

    def test_dont_mark_read_other_user_notifications(self, graphene_client, user_factory, notification_factory):
        user_notifications = user_factory()
        notifications = notification_factory.create_batch(2, read_at=None, user=user_notifications)

        graphene_client.force_authenticate(user_factory())
        executed = self.mutate(graphene_client)

        assert self.is_ok_response(executed), executed
        assert notification_models.Notification.objects.filter_by_user(
            user_notifications
        ).filter_unread().count() == len(notifications)

    def test_unauthenticated_user(self, graphene_client, notification_factory):
        notification = notification_factory(read_at=None)

        executed = self.mutate(graphene_client)

        notification.refresh_from_db()
        assert notification.read_at is None
        assert executed["errors"][0]["message"] == "permission_denied"

    @staticmethod
    def is_ok_response(response_data: dict) -> bool:
        return response_data == {"data": {"markReadAllNotifications": {"ok": True}}}

    @classmethod
    def mutate(cls, graphene_client):
        return graphene_client.mutate(cls.MUTATION, variable_values={'input': {}})
