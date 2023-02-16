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


class DocumentDemoItemFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = models.DocumentDemoItem
        sqlalchemy_session = session.Session

    id = factory.Sequence(lambda i: i)
    created_by = factory.SubFactory("userauth.factories.UserFactory")
    file = factory.Faker("file_path")
    created_at = factory.Faker("date_time")
