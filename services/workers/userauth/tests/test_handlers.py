import pytest
from .. import handlers


@pytest.mark.usefixtures('db_session')
def test_hello_returns_users(user_factory):
    users = user_factory.create_batch(3)
    result = handlers.hello({}, {})

    assert users == result['users']
