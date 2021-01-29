from django.contrib.auth import hashers
import factory

DEFAULT_USER_PASSWORD = "secret"


class UserFactory(factory.DjangoModelFactory):
    class Meta:
        model = "users.User"

    email = factory.Faker("email")
    is_superuser = False

    @classmethod
    def _create(cls, *args, **kwargs):
        plain_password = kwargs.pop('password', DEFAULT_USER_PASSWORD)
        password = hashers.make_password(plain_password)
        user = super()._create(*args, **kwargs, password=password)
        setattr(user, '_faker_password', plain_password)
        return user


class UserProfileFactory(factory.DjangoModelFactory):
    class Meta:
        model = "users.UserProfile"

    user = factory.SubFactory(UserFactory)
    first_name = factory.Faker("name", locale="pl")
