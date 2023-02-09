import factory

from dao.db import session
from . import models


class CrudDemoItemFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = models.CrudDemoItem
        sqlalchemy_session = session.Session

    id = factory.Sequence(lambda i: i)
    created_by = factory.SubFactory("userauth.factories.UserFactory")
    name = factory.Faker("word")
