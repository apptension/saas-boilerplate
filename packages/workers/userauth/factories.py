from datetime import datetime

import factory

from dao.db import session
from . import models


class UserFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = models.User
        sqlalchemy_session = session.Session

    id = factory.Sequence(lambda i: i)
    profile = factory.RelatedFactory("userauth.factories.UserProfileFactory", factory_related_name="user")
    password = factory.Faker('pystr')
    email = factory.Faker('email')
    created = factory.LazyFunction(datetime.now)
    is_superuser = factory.Faker('pybool')
    is_active = factory.Faker('pybool')
    is_confirmed = factory.Faker('pybool')


class UserProfileFactory(factory.alchemy.SQLAlchemyModelFactory):
    class Meta:
        model = models.UserProfile
        sqlalchemy_session = session.Session

    id = factory.Sequence(lambda i: i)
    user = factory.SubFactory("userauth.factories.UserFactory")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
