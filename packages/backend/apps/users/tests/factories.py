from typing import Optional, List, TypedDict

import factory
import mimetypes
from django.contrib.auth import hashers
from django.contrib.auth.models import Group
from django.core.files.uploadedfile import SimpleUploadedFile, UploadedFile
from djstripe.models import Customer

from common.acl.helpers import CommonGroups
from apps.multitenancy.models import Tenant
from apps.multitenancy.tests.factories import TenantFactory


class GroupFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Group
        django_get_or_create = ('name',)

    name = factory.Sequence(lambda n: "Group #%s" % n)


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "users.User"

    email = factory.Faker("email")
    is_superuser = False
    profile = factory.RelatedFactory("apps.users.tests.factories.UserProfileFactory", factory_related_name="user")

    class Params:
        has_avatar = factory.Trait(
            profile__avatar=factory.SubFactory("apps.users.tests.factories.UserAvatarFactory"),
        )

    @classmethod
    def _create(cls, *args, **kwargs):
        plain_password = kwargs.pop('password', 'secret')
        password = hashers.make_password(plain_password)
        user = super()._create(*args, **kwargs, password=password)
        user._faker_password = plain_password
        return user

    @factory.post_generation
    def groups(self, create: bool, extracted: Optional[List[str]], **kwargs):
        if not create:
            return

        group_names = extracted or [CommonGroups.User]
        self.groups.add(*[Group.objects.get_or_create(name=group_name)[0] for group_name in group_names])

    @factory.post_generation
    def sign_up_tenant(self, create: bool, extracted: Optional[List[str]], **kwargs):
        if not create:
            return

        Tenant.objects.get_or_create_user_default_tenant(self)

    @factory.post_generation
    def admin(self, create, extracted, **kwargs):
        if extracted is None:
            return

        user_group, created = Group.objects.get_or_create(name=CommonGroups.Admin)
        self.groups.add(user_group)


class UserAvatarFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = "users.UserAvatar"

    original = factory.django.ImageField(filename="avatar.jpg")
    thumbnail = factory.django.ImageField(filename="thumbnails/avatar.jpg")


class UserProfileFactory(factory.django.DjangoModelFactory):
    """
    Note: do not add the UserAvatarFactory as SubFactory here. It is very slow and UserProfile is created for almost
    every test causing severe performance degradation
    """

    class Meta:
        model = "users.UserProfile"

    user = factory.SubFactory(UserFactory, profile=None)
    first_name = factory.Faker("first_name", locale="pl")
    last_name = factory.Faker("last_name", locale="pl")


class ImageFactoryParams(TypedDict):
    width: int
    height: int
    color: str  # default: 'blue'
    format: str  # default: 'JPEG'


def image_factory(name: str, params: Optional[ImageFactoryParams] = None) -> UploadedFile:
    image_field = factory.django.ImageField(filename=name)
    return SimpleUploadedFile(
        name=name,
        content=image_field._make_data(params or {}),
        content_type=mimetypes.guess_type(name)[0],
    )


class StripeCustomerFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Customer

    subscriber = factory.SubFactory(TenantFactory)
