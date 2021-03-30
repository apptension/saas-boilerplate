import json

import pytest

from common.tasks import Task
from common.tests.matchers import FuzzyDict


@pytest.fixture
def task_apply(mocker):
    spy = mocker.spy(Task, '_apply')

    def assert_email_sent(email_class, to, data=None):
        if data is None:
            data = {}

        spy.assert_any_call(
            entry=FuzzyDict(
                DetailType=email_class.name, Detail=json.dumps({'type': email_class.name, 'to': to, **data})
            )
        )

    spy.assert_email_sent = assert_email_sent

    return spy
