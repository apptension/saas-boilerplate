from unittest import mock

from .. import utils
import pytest

pytestmark = pytest.mark.django_db


class TestSendSubscriptionsMessages:
    def test_with_no_subscriptions(self, post_to_connection, user):
        utils.send_subscriptions_messages(user, "someOperation")
        post_to_connection.assert_not_called()

    def test_with_existing_subscriptions_and_multiple_users(
        self, post_to_connection, user_factory, graph_ql_subscription_factory
    ):
        user = user_factory()
        graph_ql_subscription_factory(
            connection__connection_id="conn-id", connection__user=user, operation_name="someOperation"
        )
        graph_ql_subscription_factory(
            connection__connection_id="other-conn-id", connection__user=user_factory(), operation_name="someOperation"
        )

        utils.send_subscriptions_messages(user, "someOperation")

        post_to_connection.assert_called_once_with(
            {"id": "", "type": "next", "payload": {"data": None, "errors": mock.ANY}}, "conn-id"
        )

    def test_with_existing_subscriptions_and_multiple_subscriptions(
        self, post_to_connection, user, graph_ql_subscription_factory
    ):
        graph_ql_subscription_factory(
            connection__connection_id="conn-id", connection__user=user, operation_name="someOperation"
        )
        graph_ql_subscription_factory(
            connection__connection_id="conn-id", connection__user=user, operation_name="otherOperation"
        )

        utils.send_subscriptions_messages(user, "someOperation")

        post_to_connection.assert_called_once_with(
            {"id": "", "type": "next", "payload": {"data": None, "errors": mock.ANY}}, "conn-id"
        )
