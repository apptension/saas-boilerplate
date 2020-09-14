import factory


class UserFactory(factory.DjangoModelFactory):
    class Meta:
        model = "users.User"

    email = factory.Faker("email")
    is_superuser = False
    password = factory.PostGenerationMethodCall("set_password", "secret")


class UserProfileFactory(factory.DjangoModelFactory):
    class Meta:
        model = "users.UserProfile"

    user = factory.SubFactory(UserFactory)
    first_name = factory.Faker("name", locale="pl")
