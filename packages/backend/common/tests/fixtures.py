import json

import pytest
from django.conf import settings


@pytest.fixture(autouse=True)
def task_apply(mocker):
    spy = mocker.patch("common.tasks.Task._apply")

    def assert_task_applied(
        source: str,
        detail_type: str,
        data: dict = None,
        event_bus=settings.WORKERS_EVENT_BUS_NAME,
    ):
        if data is None:
            data = {}

        data["type"] = detail_type

        for call_args in spy.call_args_list:
            entry_kwarg = call_args.kwargs["entry"]
            call_detail = json.loads(entry_kwarg["Detail"])

            match = (
                event_bus == entry_kwarg["EventBusName"]
                and source == entry_kwarg["Source"]
                and detail_type == entry_kwarg["DetailType"]
                and all(call_detail[key] == value for key, value in data.items())
            )
            if match:
                return

        raise AssertionError("Task apply not found")

    def assert_email_sent(email_class, to, data=None):
        if data is None:
            data = {}

        assert_task_applied(
            source="backend.email",
            detail_type=email_class.name,
            data={"type": email_class.name, "to": to, **data},
        )

    spy.assert_task_applied = assert_task_applied
    spy.assert_email_sent = assert_email_sent

    return spy
