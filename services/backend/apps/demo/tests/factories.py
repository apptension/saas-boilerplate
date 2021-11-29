import factory

from .. import models

from apps.users.tests import factories as user_factories
from apps.content.tests import factories as content_factories


class CrudDemoItemFactory(factory.DjangoModelFactory):
    name = factory.Faker('pystr')

    class Meta:
        model = models.CrudDemoItem


class DocumentDemoItemFactory(factory.DjangoModelFactory):
    created_by = factory.SubFactory(user_factories.UserFactory)

    class Meta:
        model = models.DocumentDemoItem


class ContentfulDemoItemFavoriteFactory(factory.DjangoModelFactory):
    item = factory.SubFactory(content_factories.ContentfulDemoItemFactory)
    user = factory.SubFactory(user_factories.UserFactory)

    class Meta:
        model = models.ContentfulDemoItemFavorite