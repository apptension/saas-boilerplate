import pytest

from dao.db.session import db_session
from .. import models
from ..handlers import connect, message, disconnect

pytestmark = pytest.mark.usefixtures('db_session')


DOMAIN_NAME = "example.com"


def test_handler_connect(user_factory):
    user_factory(id=1)

    response = connect.handle(
        {
            "requestContext": {"eventType": "CONNECT", "connectionId": "conn-id"},
            "headers": {
                "Cookie": (
                    "token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoyNjI0NTI3Mzg"
                    "5LCJqdGkiOiJkNThkOTBmZGExN2Q0ZTBhOWMzMjNmNWIxZmQ0NzQzOSIsInVzZXJfaWQiOiJ6eGtYRzhaIn0._KiwJy4qO"
                    "kaXGPe5AsAylPZvh2smpV6d-EN_xsHpyTY"
                )
            },
        },
        {},
    )

    assert response == {
        "statusCode": 200,
        "body": "conn-id",
        "headers": {"Sec-WebSocket-Protocol": "graphql-transport-ws"},
    }
    with db_session() as session:
        assert session.query(models.WebSocketConnection).filter_by(user_id=1, connection_id="conn-id").count() == 1


def test_handler_connect_without_existing_user():
    response = connect.handle(
        {
            "requestContext": {"eventType": "CONNECT", "connectionId": "conn-id"},
            "headers": {
                "Cookie": (
                    "token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoyNjI0NTI3Mzg"
                    "5LCJqdGkiOiJkNThkOTBmZGExN2Q0ZTBhOWMzMjNmNWIxZmQ0NzQzOSIsInVzZXJfaWQiOiJ6eGtYRzhaIn0._KiwJy4qO"
                    "kaXGPe5AsAylPZvh2smpV6d-EN_xsHpyTY"
                )
            },
        },
        {},
    )

    assert response == {
        "statusCode": 400,
        "body": "User doesn't exist.",
        "headers": {"Sec-WebSocket-Protocol": "graphql-transport-ws"},
    }
    with db_session() as session:
        assert session.query(models.WebSocketConnection).filter_by(connection_id="conn-id").count() == 0


def test_handler_message_connection_init(mocker, user_factory):
    post_to_connection = mocker.patch("websockets.apigateway.post_to_connection")
    mocker.patch("uuid.uuid4", return_value="some-uuid")
    user_factory(id=1)

    message.handle(
        {
            "requestContext": {"eventType": "MESSAGE", "connectionId": "conn-id", "domainName": DOMAIN_NAME},
            "body": '{"type": "connection_init"}',
        },
        {},
    )

    post_to_connection.assert_called_once_with(
        DOMAIN_NAME,
        "conn-id",
        {"id": "some-uuid", "type": "connection_ack", "payload": {"con_id": "conn-id"}},
    )


def test_handler_message_subscribe(web_socket_connection_factory):
    web_socket_connection_factory(id=1, connection_id="conn-id")

    message.handle(
        {
            "requestContext": {"eventType": "MESSAGE", "connectionId": "conn-id", "domainName": DOMAIN_NAME},
            "body": (
                '{\"id\":\"1\",\"type\":\"subscribe\",\"payload\":{\"query\":\"subscription '
                'notificationsListSubscription {\\n  notificationCreated {\\n    id\\n  }\\n}\\n\",\"'
                'operationName\":\"notificationsListSubscription\",\"variables\":{}}}'
            ),
        },
        {},
    )

    with db_session() as session:
        assert session.query(models.GraphQLSubscription).filter_by(connection_id=1).count() == 1


def test_handler_message_stop(web_socket_connection_factory, graph_ql_subscription_factory):
    connection = web_socket_connection_factory(id=1, connection_id="conn-id")
    graph_ql_subscription_factory.create_batch(2, connection=connection, relay_id="1")

    message.handle(
        {
            "requestContext": {"eventType": "MESSAGE", "connectionId": "conn-id", "domainName": DOMAIN_NAME},
            "body": '{\"id\":\"1\",\"type\":\"stop\"}',
        },
        {},
    )

    with db_session() as session:
        assert session.query(models.GraphQLSubscription).filter_by(connection_id=1).count() == 0


def test_handler_disconnect(web_socket_connection_factory, graph_ql_subscription_factory):
    connection = web_socket_connection_factory(id=1, connection_id="conn-id")
    other_connection = web_socket_connection_factory(id=2, connection_id="other-conn-id")
    graph_ql_subscription_factory.create_batch(2, connection=connection)
    graph_ql_subscription_factory.create_batch(3, connection=other_connection)

    disconnect.handle(
        {
            "requestContext": {"eventType": "DISCONNECT", "connectionId": "conn-id"},
        },
        {},
    )

    with db_session() as session:
        assert session.query(models.WebSocketConnection).count() == 1
        assert session.query(models.WebSocketConnection).filter_by(connection_id="conn-id").count() == 0
        assert session.query(models.GraphQLSubscription).count() == 3
        assert session.query(models.GraphQLSubscription).filter_by(connection_id=1).count() == 0
