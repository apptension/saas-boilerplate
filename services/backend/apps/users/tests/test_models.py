import pytest

from common.acl.helpers import CommonGroups
from .. import models

pytestmark = pytest.mark.django_db


class TestUser:
    def test_has_group_returns_false(self, user: models.User, group_factory):
        admin_group = group_factory(name=CommonGroups.Admin)

        user.groups.remove(admin_group)

        assert not user.has_group(CommonGroups.Admin)

    def test_has_group_returns_true(self, user: models.User, group_factory):
        admin_group = group_factory(name=CommonGroups.Admin)

        user.groups.add(admin_group)

        assert user.has_group(CommonGroups.Admin)
