import pytest
from graphql_relay import to_global_id

pytestmark = pytest.mark.django_db


QUERY_ALL_NOTIFICATIONS = '''
    query  {
      allNotifications {
        edges {
          node {
            id
            type
            data
          }
        }
      }
    }
'''


class TestAllNotificationsQuery:
    def test_returns_empty_list(self, graphene_client, user):
        graphene_client.force_authenticate(user)
        executed = graphene_client.query(QUERY_ALL_NOTIFICATIONS)

        assert executed == {'data': {'allNotifications': {'edges': []}}}

    def test_returns_all_notifications(self, graphene_client, user, notification_factory):
        notifications = notification_factory.create_batch(3, user=user)

        graphene_client.force_authenticate(user)
        executed = graphene_client.query(QUERY_ALL_NOTIFICATIONS)

        assert executed == {
            'data': {
                'allNotifications': {
                    'edges': [
                        {
                            'node': {
                                'id': to_global_id('NotificationType', str(notification.id)),
                                'type': notification.type,
                                'data': notification.data,
                            }
                        }
                        for notification in notifications
                    ]
                }
            }
        }

    def test_returns_only_notifications_that_belong_to_logged_in_user(
        self, graphene_client, user_factory, notification_factory
    ):
        user = user_factory()
        other_user = user_factory()
        notification = notification_factory(user=user)
        notification_factory(user=other_user)

        graphene_client.force_authenticate(user)
        executed = graphene_client.query(QUERY_ALL_NOTIFICATIONS)

        assert executed == {
            'data': {
                'allNotifications': {
                    'edges': [
                        {
                            'node': {
                                'id': to_global_id('NotificationType', str(notification.id)),
                                'type': notification.type,
                                'data': notification.data,
                            }
                        }
                    ]
                }
            }
        }
