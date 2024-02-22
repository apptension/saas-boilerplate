import factory

from .. import models
from .. import constants


class TenantFactory(factory.django.DjangoModelFactory):
    creator = factory.SubFactory("apps.users.tests.factories.UserFactory")
    type = factory.Iterator(constants.TenantType.values)
    name = factory.Faker('pystr')
    slug = factory.Faker('pystr')
    created_at = factory.Faker('date_time')
    updated_at = factory.Faker('date_time')

    class Meta:
        model = models.Tenant


class TenantMembershipFactory(factory.django.DjangoModelFactory):
    user = factory.SubFactory("apps.users.tests.factories.UserFactory")
    tenant = factory.SubFactory(TenantFactory)
    created_at = factory.Faker('date_time')
    updated_at = factory.Faker('date_time')

    class Meta:
        model = models.TenantMembership