import json
import pytest
from .. import handlers


@pytest.mark.usefixtures('db_session')
def test_hello_returns_users(user_factory):
    users = user_factory.create_batch(3)
    result = json.loads(handlers.hello({}, {}))

    assert len(users) == result['users']
