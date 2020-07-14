from datetime import datetime

import factory

from dao.db import session
from . import models


class UserFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = models.User
        sqlalchemy_session = session.Session

    id = factory.Sequence(lambda i: i)
    password = factory.Faker('pystr')
    email = factory.Faker('email')
    created = factory.LazyFunction(datetime.now)
