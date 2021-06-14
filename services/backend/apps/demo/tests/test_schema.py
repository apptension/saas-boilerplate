import pytest
from graphql_relay import to_global_id, from_global_id
from .. import models

pytestmark = pytest.mark.django_db


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


class TestCrudDemoItemByIdQuery:
    def test_return_error_if_item_does_not_exist(self, graphene_client):
        executed = graphene_client.execute(
            '''
            query($id: String!)  {
              crudDemoItemById(id: $id) {
                id
                name
              }
            }
        ''',
            variables={'id': to_global_id('CrudDemoItemType', 'invalid-id')},
        )

        assert executed['data'] == {'crudDemoItemById': None}
        assert executed['errors'][0]['message'] == 'CrudDemoItem matching query does not exist.'

    def test_return_item(self, graphene_client, crud_demo_item):
        item_global_id = to_global_id('CrudDemoItemType', str(crud_demo_item.id))
        executed = graphene_client.execute(
            '''
            query($id: String!)  {
              crudDemoItemById(id: $id) {
                id
                name
              }
            }
        ''',
            variables={'id': item_global_id},
        )

        assert executed == {
            'data': {
                'crudDemoItemById': {
                    'id': item_global_id,
                    'name': crud_demo_item.name,
                }
            }
        }


class TestCreateOrUpdateCrudDemoItemMutation:
    def test_create_new_item(self, graphene_client):
        input = {'name': 'Item name'}
        executed = graphene_client.execute(
            '''
            mutation($input: CreateOrUpdateCrudDemoItemMutationInput!)  {
              createOrUpdateCrudDemoItem(input: $input) {
                crudDemoItem {
                  id
                  name
                }
              }
            }
        ''',
            variables={'input': input},
        )

        assert executed['data']['createOrUpdateCrudDemoItem']
        assert executed['data']['createOrUpdateCrudDemoItem']['crudDemoItem']
        assert executed['data']['createOrUpdateCrudDemoItem']['crudDemoItem']['name'] == input['name']

        item_global_id = executed['data']['createOrUpdateCrudDemoItem']['crudDemoItem']['id']
        _, pk = from_global_id(item_global_id)
        item = models.CrudDemoItem.objects.get(pk=pk)

        assert item.name == input['name']

    def test_update_existing_item(self, graphene_client, crud_demo_item):
        input = {
            'name': 'New item name',
            'id': to_global_id('CrudDemoItem', str(crud_demo_item.id)),
        }
        executed = graphene_client.execute(
            '''
            mutation($input: CreateOrUpdateCrudDemoItemMutationInput!)  {
              createOrUpdateCrudDemoItem(input: $input) {
                crudDemoItem {
                  id
                  name
                }
              }
            }
        ''',
            variables={'input': input},
        )

        crud_demo_item.refresh_from_db()

        assert executed['data']['createOrUpdateCrudDemoItem']
        assert executed['data']['createOrUpdateCrudDemoItem']['crudDemoItem']
        assert executed['data']['createOrUpdateCrudDemoItem']['crudDemoItem']['name'] == input['name']
        assert crud_demo_item.name == input['name']


class TestDeleteCrudDemoItemMutation:
    def test_update_existing_item(self, graphene_client, crud_demo_item):
        item_global_id = to_global_id('CrudDemoItem', str(crud_demo_item.id))
        executed = graphene_client.execute(
            '''
            mutation($input: DeleteCrudDemoItemMutationInput!) {
              deleteCrudDemoItem(input: $input) {
                deletedIds
              }
            }
        ''',
            variables={'input': {'id': item_global_id}},
        )

        assert executed == {'data': {'deleteCrudDemoItem': {'deletedIds': [item_global_id]}}}
        assert not models.CrudDemoItem.objects.filter(id=crud_demo_item.id).exists()
