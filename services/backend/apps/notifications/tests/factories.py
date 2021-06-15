import factory

from .. import models


class NotificationFactory(factory.DjangoModelFactory):
    type = factory.Faker('pystr')

    class Meta:
        model = models.Notification
