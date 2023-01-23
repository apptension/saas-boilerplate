import factory

from .. import models


class NotificationFactory(factory.django.DjangoModelFactory):
    user = factory.SubFactory("apps.users.tests.factories.UserFactory")
    type = factory.Faker('pystr')

    class Meta:
        model = models.Notification
