from unittest import mock

from .. import utils
import pytest

pytestmark = pytest.mark.django_db


class TestSendSubscriptionsMessages:
    def test_with_no_subscriptions(self, mocker, user):
        post_to_connection = mocker.patch("apps.websockets.apigateway.post_to_connection")

        utils.send_subscriptions_messages(user, "someOperation")

        post_to_connection.assert_not_called()

    def test_with_existing_subscriptions_and_multiple_users(self, mocker, user_factory, graph_ql_subscription_factory):
        user = user_factory()
        graph_ql_subscription_factory(
            connection__connection_id="conn-id", connection__user=user, operation_name="someOperation"
        )
        graph_ql_subscription_factory(
            connection__connection_id="other-conn-id", connection__user=user_factory(), operation_name="someOperation"
        )
        post_to_connection = mocker.patch("apps.websockets.apigateway.post_to_connection")

        utils.send_subscriptions_messages(user, "someOperation")

        post_to_connection.assert_called_once_with(
            {"id": "", "type": "next", "payload": {"data": None, "errors": mock.ANY}}, "conn-id"
        )

    def test_with_existing_subscriptions_and_multiple_subscriptions(self, mocker, user, graph_ql_subscription_factory):
        graph_ql_subscription_factory(
            connection__connection_id="conn-id", connection__user=user, operation_name="someOperation"
        )
        graph_ql_subscription_factory(
            connection__connection_id="conn-id", connection__user=user, operation_name="otherOperation"
        )
        post_to_connection = mocker.patch("apps.websockets.apigateway.post_to_connection")

        utils.send_subscriptions_messages(user, "someOperation")

        post_to_connection.assert_called_once_with(
            {"id": "", "type": "next", "payload": {"data": None, "errors": mock.ANY}}, "conn-id"
        )
