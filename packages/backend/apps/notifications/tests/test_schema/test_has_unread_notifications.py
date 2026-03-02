import pytest
from django.utils import timezone

pytestmark = pytest.mark.django_db


class TestHasUnreadNotificationsQuery:
    QUERY = '''
        query  {
          hasUnreadNotifications
        }
    '''

    def test_returns_has_unread_notifications(self, graphene_client, user, notification_factory):
        graphene_client.force_authenticate(user)
        notification_factory(user=user, read_at=None)
        executed = graphene_client.query(self.QUERY)

        assert executed == {
            'data': {
                'hasUnreadNotifications': True,
            }
        }

    def test_returns_has_no_unread_notifications(self, graphene_client, user, notification_factory):
        graphene_client.force_authenticate(user)
        notification_factory(user=user, read_at=timezone.now())
        executed = graphene_client.query(self.QUERY)

        assert executed == {
            'data': {
                'hasUnreadNotifications': False,
            }
        }


class TestUnreadNotificationsCountQuery:
    QUERY = '''
        query  {
          unreadNotificationsCount
        }
    '''

    def test_returns_unread_notifications_count(self, graphene_client, user, notification_factory):
        graphene_client.force_authenticate(user)
        notification_factory(user=user, read_at=None)
        notification_factory(user=user, read_at=None)
        notification_factory(user=user, read_at=None)
        executed = graphene_client.query(self.QUERY)

        assert executed == {
            'data': {
                'unreadNotificationsCount': 3,
            }
        }

    def test_returns_zero_when_all_read(self, graphene_client, user, notification_factory):
        graphene_client.force_authenticate(user)
        notification_factory(user=user, read_at=timezone.now())
        notification_factory(user=user, read_at=timezone.now())
        executed = graphene_client.query(self.QUERY)

        assert executed == {
            'data': {
                'unreadNotificationsCount': 0,
            }
        }

    def test_returns_only_unread_count(self, graphene_client, user, notification_factory):
        graphene_client.force_authenticate(user)
        notification_factory(user=user, read_at=None)
        notification_factory(user=user, read_at=None)
        notification_factory(user=user, read_at=timezone.now())  # This one is read
        executed = graphene_client.query(self.QUERY)

        assert executed == {
            'data': {
                'unreadNotificationsCount': 2,
            }
        }
