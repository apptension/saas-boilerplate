import factory
from django.contrib.auth import hashers


class UserFactory(factory.DjangoModelFactory):
    class Meta:
        model = "users.User"

    email = factory.Faker("email")
    is_superuser = False

    @classmethod
    def _create(cls, *args, **kwargs):
        plain_password = kwargs.pop('password', 'secret')
        password = hashers.make_password(plain_password)
        user = super()._create(*args, **kwargs, password=password)
        setattr(user, '_faker_password', plain_password)
        return user


class UserProfileFactory(factory.DjangoModelFactory):
    class Meta:
        model = "users.UserProfile"

    user = factory.SubFactory(UserFactory)
    first_name = factory.Faker("first_name", locale="pl")
    last_name = factory.Faker("last_name", locale="pl")
