import factory

from .. import models


class UserFactory(factory.DjangoModelFactory):
    class Meta:
        model = models.User

    email = factory.Faker("email")
    is_superuser = False
    password = factory.PostGenerationMethodCall("set_password", "secret")


class UserProfileFactory(factory.DjangoModelFactory):
    class Meta:
        model = models.UserProfile

    user = factory.SubFactory(UserFactory)
    first_name = factory.Faker("name", locale="pl")
