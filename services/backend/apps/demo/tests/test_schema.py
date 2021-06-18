import pytest
from graphql_relay import to_global_id, from_global_id

from apps.notifications.models import Notification
from .. import models, constants

pytestmark = pytest.mark.django_db


class Context:
    def __init__(self, user):
        self.user = user


class TestAllCrudDemoItemsQuery:
    def test_returns_all_items(self, graphene_client, crud_demo_item_factory):
        items = crud_demo_item_factory.create_batch(3)

        executed = graphene_client.execute(
            '''
            query  {
              allCrudDemoItems {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
            }
        '''
        )

        assert executed == {
            'data': {
                'allCrudDemoItems': {
                    'edges': [
                        {'node': {'id': to_global_id('CrudDemoItemType', str(item.id)), 'name': item.name}}
                        for item in items
                    ]
                }
            }
        }


class TestCrudDemoItemQuery:
    def test_return_none_if_item_does_not_exist(self, graphene_client):
        executed = graphene_client.execute(
            '''
            query($id: ID!)  {
              crudDemoItem(id: $id) {
                id
                name
              }
            }
        ''',
            variable_values={'id': to_global_id('CrudDemoItemType', 'invalid-id')},
        )

        assert executed['data'] == {'crudDemoItem': None}

    def test_return_item(self, graphene_client, crud_demo_item):
        item_global_id = to_global_id('CrudDemoItemType', str(crud_demo_item.id))
        executed = graphene_client.execute(
            '''
            query($id: ID!)  {
              crudDemoItem(id: $id) {
                id
                name
              }
            }
        ''',
            variable_values={'id': item_global_id},
        )

        assert executed == {
            'data': {
                'crudDemoItem': {
                    'id': item_global_id,
                    'name': crud_demo_item.name,
                }
            }
        }


class TestCreateCrudDemoItemMutation:
    CREATE_MUTATION = '''
        mutation($input: CreateCrudDemoItemMutationInput!)  {
          createCrudDemoItem(input: $input) {
            crudDemoItem {
              id
              name
            }
          }
        }
    '''

    def test_create_new_item(self, graphene_client_with_context):
        input = {'name': 'Item name'}
        executed = graphene_client_with_context().execute(
            self.CREATE_MUTATION,
            variable_values={'input': input},
        )

        assert executed['data']['createCrudDemoItem']
        assert executed['data']['createCrudDemoItem']['crudDemoItem']
        assert executed['data']['createCrudDemoItem']['crudDemoItem']['name'] == input['name']

        item_global_id = executed['data']['createCrudDemoItem']['crudDemoItem']['id']
        _, pk = from_global_id(item_global_id)
        item = models.CrudDemoItem.objects.get(pk=pk)

        assert item.name == input['name']

    def test_create_new_item_sends_notification(self, graphene_client_with_context, user_factory):
        user = user_factory()
        admin = user_factory(is_superuser=True)
        input = {'name': 'Item name'}
        executed = graphene_client_with_context(Context(user=user)).execute(
            self.CREATE_MUTATION,
            variable_values={'input': input},
        )

        item_global_id = executed['data']['createCrudDemoItem']['crudDemoItem']['id']
        _, pk = from_global_id(item_global_id)
        item = models.CrudDemoItem.objects.get(pk=pk)

        assert Notification.objects.count() == 1
        notification = Notification.objects.first()
        assert notification.type == constants.Notification.CRUD_ITEM_CREATED.value
        assert notification.user == admin
        assert notification.data == {"id": item_global_id, "name": item.name, "user": user.email}


class TestUpdateCrudDemoItemMutation:
    UPDATE_MUTATION = '''
        mutation($input: UpdateCrudDemoItemMutationInput!)  {
          updateCrudDemoItem(input: $input) {
            crudDemoItem {
              id
              name
            }
          }
        }
    '''

    def test_update_existing_item(self, graphene_client_with_context, crud_demo_item):
        input = {
            'name': 'New item name',
            'id': to_global_id('CrudDemoItemType', str(crud_demo_item.id)),
        }
        executed = graphene_client_with_context().execute(
            self.UPDATE_MUTATION,
            variable_values={'input': input},
        )

        crud_demo_item.refresh_from_db()

        assert executed['data']['updateCrudDemoItem']
        assert executed['data']['updateCrudDemoItem']['crudDemoItem']
        assert executed['data']['updateCrudDemoItem']['crudDemoItem']['name'] == input['name']
        assert crud_demo_item.name == input['name']

    def test_update_existing_item_sends_notification_to_admins_and_creator(
        self, graphene_client_with_context, crud_demo_item_factory, user_factory
    ):
        user = user_factory()
        other_user = user_factory()
        admins = user_factory.create_batch(2, is_superuser=True)
        crud_demo_item = crud_demo_item_factory(user=user)
        item_global_id = to_global_id('CrudDemoItemType', str(crud_demo_item.id))
        input = {
            'name': 'New item name',
            'id': item_global_id,
        }
        graphene_client_with_context(Context(user=other_user)).execute(
            self.UPDATE_MUTATION,
            variable_values={'input': input},
        )

        assert Notification.objects.filter(type=constants.Notification.CRUD_ITEM_UPDATED.value).count() == 3

        notification = Notification.objects.get(user=user)
        assert notification.data == {"id": item_global_id, "name": "New item name", "user": other_user.email}

        assert Notification.objects.filter(user=admins[0], type=constants.Notification.CRUD_ITEM_UPDATED.value).exists()
        assert Notification.objects.filter(user=admins[1], type=constants.Notification.CRUD_ITEM_UPDATED.value).exists()

    def test_update_existing_item_sends_notification_to_admins_skipping_creator_if_he_is_the_one_updating(
        self, graphene_client_with_context, crud_demo_item, user_factory
    ):
        user = user_factory()
        crud_demo_item.user = user
        crud_demo_item.save()
        admins = user_factory.create_batch(2, is_superuser=True)
        item_global_id = to_global_id('CrudDemoItemType', str(crud_demo_item.id))
        input = {
            'name': 'New item name',
            'id': item_global_id,
        }
        graphene_client_with_context(Context(user=user)).execute(
            self.UPDATE_MUTATION,
            variable_values={'input': input},
        )

        assert Notification.objects.count() == 2
        assert Notification.objects.filter(user=admins[0], type=constants.Notification.CRUD_ITEM_UPDATED.value).exists()
        assert Notification.objects.filter(user=admins[1], type=constants.Notification.CRUD_ITEM_UPDATED.value).exists()


class TestDeleteCrudDemoItemMutation:
    DELETE_MUTATION = '''
        mutation($input: DeleteCrudDemoItemMutationInput!) {
          deleteCrudDemoItem(input: $input) {
            deletedIds
          }
        }
    '''

    def test_update_existing_item(self, graphene_client, crud_demo_item):
        item_global_id = to_global_id('CrudDemoItemType', str(crud_demo_item.id))
        executed = graphene_client.execute(
            self.DELETE_MUTATION,
            variable_values={'input': {'id': item_global_id}},
        )

        assert executed == {'data': {'deleteCrudDemoItem': {'deletedIds': [item_global_id]}}}
        assert not models.CrudDemoItem.objects.filter(id=crud_demo_item.id).exists()
