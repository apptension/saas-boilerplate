import json

import pytest
from apps.notifications.models import Notification
from django.core.files.uploadedfile import SimpleUploadedFile
from graphene_file_upload.django.testing import file_graphql_query
from graphql_relay import to_global_id, from_global_id
from .. import models, constants
from apps.multitenancy.constants import TenantType, TenantUserRole

pytestmark = pytest.mark.django_db


class TestAllCrudDemoItemsQuery:
    def test_returns_all_items(
        self, graphene_client, crud_demo_item_factory, tenant_factory, tenant_membership_factory, user
    ):
        tenant = tenant_factory(name="Tenant 1", type=TenantType.ORGANIZATION)
        tenant_2 = tenant_factory(name="Tenant 2", type=TenantType.ORGANIZATION)
        tenant_membership_factory(tenant=tenant, user=user, role=TenantUserRole.OWNER)
        accessible_items = crud_demo_item_factory.create_batch(3, tenant=tenant)
        crud_demo_item_factory.create_batch(3, tenant=tenant_2)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.OWNER)
        graphene_client.force_authenticate(user)
        executed = graphene_client.query(
            """
            query($tenantId: ID!)  {
              allCrudDemoItems(tenantId: $tenantId) {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
            }
        """,
            variable_values={"tenantId": to_global_id("TenantType", tenant.id)},
        )

        assert executed == {
            "data": {
                "allCrudDemoItems": {
                    "edges": [
                        {
                            "node": {
                                "id": to_global_id("CrudDemoItemType", str(item.id)),
                                "name": item.name,
                            }
                        }
                        for item in accessible_items
                    ]
                }
            }
        }

    def test_returns_all_items_without_membership(self, graphene_client, crud_demo_item_factory, tenant_factory, user):
        tenant = tenant_factory(name="Tenant 1", type=TenantType.ORGANIZATION)
        tenant_2 = tenant_factory(name="Tenant 2", type=TenantType.ORGANIZATION)
        crud_demo_item_factory.create_batch(3, tenant=tenant)
        crud_demo_item_factory.create_batch(3, tenant=tenant_2)
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, None)
        executed = graphene_client.query(
            """
            query($tenantId: ID!)  {
              allCrudDemoItems(tenantId: $tenantId) {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
            }
        """,
            variable_values={"tenantId": to_global_id("TenantType", tenant.id)},
        )
        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"


class TestCrudDemoItemQuery:
    CRUD_DEMO_ITEM_QUERY = """
        query($id: ID!, $tenantId: ID)  {
          crudDemoItem(id: $id, tenantId: $tenantId) {
            id
            name
          }
        }
    """

    def test_return_error_for_not_authorized_user(self, graphene_client, crud_demo_item, tenant):
        item_global_id = to_global_id("CrudDemoItemType", str(crud_demo_item.id))

        executed = graphene_client.query(
            self.CRUD_DEMO_ITEM_QUERY,
            variable_values={"id": item_global_id, "tenantId": to_global_id("TenantType", tenant.id)},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_return_none_if_item_does_not_exist(self, graphene_client, user, tenant):
        item_global_id = to_global_id("CrudDemoItemType", "invalid-id")

        graphene_client.force_authenticate(user)
        executed = graphene_client.query(
            self.CRUD_DEMO_ITEM_QUERY,
            variable_values={"id": item_global_id, "tenantId": to_global_id("TenantType", tenant.id)},
        )

        assert executed["data"] == {"crudDemoItem": None}

    def test_return_item(self, graphene_client, crud_demo_item_factory, user, tenant, tenant_membership_factory):
        crud_demo_item = crud_demo_item_factory(tenant=tenant)
        item_global_id = to_global_id("CrudDemoItemType", str(crud_demo_item.id))
        tenant_membership_factory(tenant=tenant, user=user, role=TenantUserRole.MEMBER)

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.MEMBER)
        executed = graphene_client.query(
            self.CRUD_DEMO_ITEM_QUERY,
            variable_values={"id": item_global_id, "tenantId": to_global_id("TenantType", tenant.id)},
        )

        assert executed == {
            "data": {
                "crudDemoItem": {
                    "id": item_global_id,
                    "name": crud_demo_item.name,
                }
            }
        }

    def test_return_404_for_non_existent_item(self, graphene_client, user, tenant, tenant_membership_factory):
        non_existent_item_id = to_global_id("CrudDemoItemType", "non-existent-id")
        tenant_membership_factory(tenant=tenant, user=user, role=TenantUserRole.MEMBER)

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.MEMBER)
        executed = graphene_client.query(
            self.CRUD_DEMO_ITEM_QUERY,
            variable_values={"id": non_existent_item_id, "tenantId": to_global_id("TenantType", tenant.id)},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "No CrudDemoItem matches the given query."

    def test_tenant_no_membership(self, graphene_client, crud_demo_item_factory, user, tenant):
        crud_demo_item = crud_demo_item_factory(tenant=tenant)
        item_global_id = to_global_id("CrudDemoItemType", str(crud_demo_item.id))

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, None)
        executed = graphene_client.query(
            self.CRUD_DEMO_ITEM_QUERY,
            variable_values={"id": item_global_id, "tenantId": to_global_id("TenantType", tenant.id)},
        )
        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_wrong_tenant_id(
        self, graphene_client, crud_demo_item_factory, user, tenant_factory, tenant_membership_factory
    ):
        tenant = tenant_factory()
        tenant_second = tenant_factory()
        crud_demo_item = crud_demo_item_factory(tenant=tenant_second)
        item_global_id = to_global_id("CrudDemoItemType", str(crud_demo_item.id))
        tenant_membership_factory(tenant=tenant, user=user, role=TenantUserRole.MEMBER)

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.MEMBER)
        executed = graphene_client.query(
            self.CRUD_DEMO_ITEM_QUERY,
            variable_values={"id": item_global_id, "tenantId": to_global_id("TenantType", tenant.id)},
        )
        assert executed["data"] == {"crudDemoItem": None}


class TestCreateCrudDemoItemMutation:
    CREATE_MUTATION = """
        mutation($input: CreateCrudDemoItemMutationInput!)  {
          createCrudDemoItem(input: $input) {
            crudDemoItem {
              id
              name
              tenant {
                id
              }
            }
          }
        }
    """

    NOTIFICATIONS_SUBSCRIPTION = """
        subscription notificationsListSubscription {
          notificationCreated {
            edges {
              node {
                id
              }
            }
          }
        }
    """

    def test_create_new_item(self, graphene_client, user, tenant, tenant_membership_factory):
        tenant_membership_factory(tenant=tenant, user=user, role=TenantUserRole.MEMBER)
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.MEMBER)
        executed = graphene_client.mutate(
            self.CREATE_MUTATION,
            variable_values={"input": {"name": "Item name", "tenantId": to_global_id("TenantType", tenant.id)}},
        )

        assert executed["data"]["createCrudDemoItem"]
        assert executed["data"]["createCrudDemoItem"]["crudDemoItem"]
        assert executed["data"]["createCrudDemoItem"]["crudDemoItem"]["name"] == "Item name"

        item_global_id = executed["data"]["createCrudDemoItem"]["crudDemoItem"]["id"]
        _, pk = from_global_id(item_global_id)
        item = models.CrudDemoItem.objects.get(pk=pk)

        assert item.name == "Item name"
        assert item.tenant == tenant

    def test_create_new_item_without_membership(self, graphene_client, user, tenant):
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, None)
        executed = graphene_client.mutate(
            self.CREATE_MUTATION,
            variable_values={"input": {"name": "Item name", "tenantId": to_global_id("TenantType", tenant.id)}},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_create_new_item_sends_notification(self, graphene_client, user_factory, tenant, tenant_membership_factory):
        owner = user_factory()
        tenant_membership_factory(tenant=tenant, user=owner, role=TenantUserRole.OWNER)

        user = user_factory(has_avatar=True)
        tenant_membership_factory(tenant=tenant, user=user, role=TenantUserRole.MEMBER)
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.MEMBER)
        executed = graphene_client.mutate(
            self.CREATE_MUTATION,
            variable_values={"input": {"name": "Item name", "tenantId": to_global_id("TenantType", tenant.id)}},
        )

        item_global_id = executed["data"]["createCrudDemoItem"]["crudDemoItem"]["id"]
        _, pk = from_global_id(item_global_id)
        item = models.CrudDemoItem.objects.get(pk=pk)

        assert Notification.objects.count() == 1
        notification = Notification.objects.first()
        assert notification.type == constants.Notification.CRUD_ITEM_CREATED.value
        assert notification.user == owner
        assert notification.data == {
            "id": item_global_id,
            "name": item.name,
        }
        assert notification.issuer == user


class TestUpdateCrudDemoItemMutation:
    UPDATE_MUTATION = """
        mutation($input: UpdateCrudDemoItemMutationInput!)  {
          updateCrudDemoItem(input: $input) {
            crudDemoItem {
              id
              name
              tenant {
                id
              }
            }
          }
        }
    """

    NOTIFICATIONS_SUBSCRIPTION = """
        subscription notificationsListSubscription {
          notificationCreated {
            edges {
              node {
                id
              }
            }
          }
        }
    """

    @pytest.fixture
    def input_data_factory(self):
        def _factory(crud_demo_item, name="New item name", tenant_id=None) -> dict:
            return {
                "id": to_global_id("CrudDemoItemType", str(crud_demo_item.id)),
                "name": name,
                "tenantId": tenant_id or to_global_id("TenantType", crud_demo_item.tenant_id),
            }

        return _factory

    def test_update_existing_item(
        self, graphene_client, crud_demo_item, user, tenant_membership_factory, tenant, input_data_factory
    ):
        input_data = input_data_factory(crud_demo_item)
        tenant_membership_factory(tenant=tenant, user=user, role=TenantUserRole.MEMBER)
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.MEMBER)
        executed = graphene_client.mutate(
            self.UPDATE_MUTATION,
            variable_values={"input": input_data},
        )

        crud_demo_item.refresh_from_db()

        assert executed["data"]["updateCrudDemoItem"]
        assert executed["data"]["updateCrudDemoItem"]["crudDemoItem"]
        assert executed["data"]["updateCrudDemoItem"]["crudDemoItem"]["name"] == input_data["name"]
        assert from_global_id(executed["data"]["updateCrudDemoItem"]["crudDemoItem"]["tenant"]["id"])[1] == tenant.id
        assert crud_demo_item.name == input_data["name"]

    def test_update_existing_item_without_membership(
        self, graphene_client, user, tenant, crud_demo_item, input_data_factory
    ):
        input_data = input_data_factory(crud_demo_item)
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, None)
        executed = graphene_client.mutate(
            self.UPDATE_MUTATION,
            variable_values={"input": input_data},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "permission_denied"

    def test_update_existing_item_sends_notification_to_admins_and_creator(
        self,
        graphene_client,
        crud_demo_item_factory,
        user_factory,
        input_data_factory,
        tenant_membership_factory,
        tenant,
    ):
        user = user_factory(has_avatar=True)
        other_user = user_factory(has_avatar=True)
        owners = user_factory.create_batch(2)
        for owner in owners:
            tenant_membership_factory(tenant=tenant, user=owner, role=TenantUserRole.OWNER)
        crud_demo_item = crud_demo_item_factory(created_by=user, tenant=tenant)
        item_global_id = to_global_id("CrudDemoItemType", str(crud_demo_item.id))
        input_data = input_data_factory(crud_demo_item)
        tenant_membership_factory(tenant=tenant, user=other_user, role=TenantUserRole.MEMBER)
        graphene_client.force_authenticate(other_user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.MEMBER)
        graphene_client.mutate(
            self.UPDATE_MUTATION,
            variable_values={"input": input_data},
        )

        assert Notification.objects.filter(type=constants.Notification.CRUD_ITEM_UPDATED.value).count() == 3

        notification = Notification.objects.get(user=user)
        assert notification.data == {
            "id": item_global_id,
            "name": "New item name",
        }
        assert notification.issuer == other_user

        assert Notification.objects.filter(user=owners[0], type=constants.Notification.CRUD_ITEM_UPDATED.value).exists()
        assert Notification.objects.filter(user=owners[1], type=constants.Notification.CRUD_ITEM_UPDATED.value).exists()

    def test_update_existing_item_sends_notification_to_admins_skipping_creator_if_he_is_the_one_updating(
        self,
        graphene_client,
        crud_demo_item_factory,
        user_factory,
        input_data_factory,
        tenant,
        tenant_membership_factory,
    ):
        user = user_factory()
        crud_demo_item = crud_demo_item_factory(created_by=user, tenant=tenant)
        owners = user_factory.create_batch(2)
        for owner in owners:
            tenant_membership_factory(tenant=tenant, user=owner, role=TenantUserRole.OWNER)
        input_data = input_data_factory(crud_demo_item)

        tenant_membership_factory(tenant=tenant, user=user, role=TenantUserRole.MEMBER)
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.MEMBER)
        graphene_client.mutate(
            self.UPDATE_MUTATION,
            variable_values={"input": input_data},
        )

        assert Notification.objects.count() == 2
        assert Notification.objects.filter(user=owners[0], type=constants.Notification.CRUD_ITEM_UPDATED.value).exists()
        assert Notification.objects.filter(user=owners[1], type=constants.Notification.CRUD_ITEM_UPDATED.value).exists()


class TestDeleteCrudDemoItemMutation:
    DELETE_MUTATION = """
        mutation($input: DeleteCrudDemoItemMutationInput!) {
          deleteCrudDemoItem(input: $input) {
            deletedIds
          }
        }
    """

    def test_deleting_item(self, graphene_client, crud_demo_item, user, tenant_membership_factory):
        item_global_id = to_global_id("CrudDemoItemType", str(crud_demo_item.id))
        tenant = crud_demo_item.tenant

        tenant_membership_factory(tenant=tenant, user=user, role=TenantUserRole.MEMBER)
        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, TenantUserRole.MEMBER)

        executed = graphene_client.mutate(
            self.DELETE_MUTATION,
            variable_values={"input": {"id": item_global_id, "tenantId": to_global_id("TenantType", tenant.id)}},
        )

        assert executed == {"data": {"deleteCrudDemoItem": {"deletedIds": [item_global_id]}}}
        assert not models.CrudDemoItem.objects.filter(id=crud_demo_item.id).exists()

    def test_deleting_item_without_membership(self, graphene_client, crud_demo_item, user):
        item_global_id = to_global_id("CrudDemoItemType", str(crud_demo_item.id))
        tenant = crud_demo_item.tenant

        graphene_client.force_authenticate(user)
        graphene_client.set_tenant_dependent_context(tenant, None)

        executed = graphene_client.mutate(
            self.DELETE_MUTATION,
            variable_values={"input": {"id": item_global_id, "tenantId": to_global_id("TenantType", tenant.id)}},
        )

        assert len(executed["errors"]) == 1
        assert executed["errors"][0]["message"] == "permission_denied"
        assert executed["errors"][0]["path"] == ["deleteCrudDemoItem"]
        assert executed["data"] == {"deleteCrudDemoItem": None}
        assert models.CrudDemoItem.objects.filter(id=crud_demo_item.id).exists()

    def test_deleting_item_by_not_authorized_user(self, graphene_client, crud_demo_item):
        item_global_id = to_global_id("CrudDemoItemType", str(crud_demo_item.id))
        tenant = crud_demo_item.tenant

        executed = graphene_client.mutate(
            self.DELETE_MUTATION,
            variable_values={"input": {"id": item_global_id, "tenantId": to_global_id("TenantType", tenant.id)}},
        )

        assert len(executed["errors"]) == 1
        assert executed["errors"][0]["message"] == "permission_denied"
        assert executed["errors"][0]["path"] == ["deleteCrudDemoItem"]
        assert executed["data"] == {"deleteCrudDemoItem": None}
        assert models.CrudDemoItem.objects.filter(id=crud_demo_item.id).exists()


class TestAllDocumentDemoItemsQuery:
    def test_returns_all_user_items(self, graphene_client, document_demo_item_factory, user):
        graphene_client.force_authenticate(user)
        items = document_demo_item_factory.create_batch(3, created_by=user)

        executed = graphene_client.query(
            """
            query  {
              allDocumentDemoItems {
                edges {
                  node {
                    id
                  }
                }
              }
            }
        """
        )

        returned_documents = executed["data"]["allDocumentDemoItems"]["edges"]
        for item in items:
            assert {"node": {"id": to_global_id("DocumentDemoItemType", str(item.id))}} in returned_documents


class TestCreateDocumentDemoItemMutation:
    CREATE_MUTATION = """
        mutation($input: CreateDocumentDemoItemMutationInput!)  {
          createDocumentDemoItem(input: $input) {
            documentDemoItem {
              id
              file {
                name
                url
              }
            }
          }
        }
    """

    TEST_FILENAME = "test.txt"

    def execute_create_document_mutation(self, api_client, test_file=None, input_data=None):
        if not test_file:
            test_file = SimpleUploadedFile(name=self.TEST_FILENAME, content="file content".encode("utf-8"))
        response = file_graphql_query(
            self.CREATE_MUTATION,
            client=api_client,
            variables={"input": input_data if input_data else {}},
            files={"file": test_file},
            graphql_url="/api/graphql/",
        )
        return json.loads(response.content)

    def test_create_new_item(self, mocker, user, api_client):
        mocker.patch("secrets.token_hex", return_value="a1b2")
        api_client.force_authenticate(user)

        executed = self.execute_create_document_mutation(api_client)

        assert executed["data"]["createDocumentDemoItem"]
        assert executed["data"]["createDocumentDemoItem"]["documentDemoItem"]
        assert executed["data"]["createDocumentDemoItem"]["documentDemoItem"]["file"]
        assert executed["data"]["createDocumentDemoItem"]["documentDemoItem"]["file"]["name"] == self.TEST_FILENAME
        assert executed["data"]["createDocumentDemoItem"]["documentDemoItem"]["file"]["url"].startswith(
            f"https://cdn.example.com/documents/a1b2/{self.TEST_FILENAME}"
        )

        item_global_id = executed["data"]["createDocumentDemoItem"]["documentDemoItem"]["id"]
        _, pk = from_global_id(item_global_id)
        item = models.DocumentDemoItem.objects.get(pk=pk)

        assert item.created_by == user
        assert item.file.name == f"documents/a1b2/{self.TEST_FILENAME}"
        assert item.file.url.startswith(f"https://cdn.example.com/documents/a1b2/{self.TEST_FILENAME}")

    def test_create_new_item_when_limit_already_reached(self, user, api_client, document_demo_item_factory):
        api_client.force_authenticate(user)
        document_demo_item_factory.create_batch(10, created_by=user)

        executed = self.execute_create_document_mutation(api_client)

        assert len(executed["errors"]) == 1
        error = executed["errors"][0]
        assert error["path"] == ["createDocumentDemoItem"]
        assert error["extensions"]["non_field_errors"] == [
            {"message": "User has reached documents number limit.", "code": "invalid"}
        ]
        assert models.DocumentDemoItem.objects.count() == 10

    def test_create_new_item_with_too_large_file(self, user, api_client):
        api_client.force_authenticate(user)
        large_file = SimpleUploadedFile(name=self.TEST_FILENAME, content=("a" * 1024 * 1024 * 11).encode("utf-8"))

        executed = self.execute_create_document_mutation(api_client, large_file)

        assert len(executed["errors"]) == 1
        error = executed["errors"][0]
        assert error["path"] == ["createDocumentDemoItem"]
        assert error["extensions"]["file"] == [{"message": "File is too large.", "code": "invalid"}]
        assert models.DocumentDemoItem.objects.count() == 0


class TestDeleteDocumentDemoItemMutation:
    DELETE_MUTATION = """
        mutation($input: DeleteDocumentDemoItemMutationInput!) {
          deleteDocumentDemoItem(input: $input) {
            deletedIds
          }
        }
    """

    def test_deleting_item(self, graphene_client, document_demo_item_factory, user):
        document_demo_item = document_demo_item_factory(created_by=user)
        item_global_id = to_global_id("DocumentDemoItemType", str(document_demo_item.id))
        graphene_client.force_authenticate(user)

        executed = graphene_client.mutate(
            self.DELETE_MUTATION,
            variable_values={"input": {"id": item_global_id}},
        )

        assert executed == {"data": {"deleteDocumentDemoItem": {"deletedIds": [item_global_id]}}}
        assert not models.DocumentDemoItem.objects.filter(id=document_demo_item.id).exists()

    def test_deleting_other_users_item(self, graphene_client, document_demo_item_factory, user_factory):
        user = user_factory()
        other_user = user_factory()
        document_demo_item = document_demo_item_factory(created_by=other_user)
        item_global_id = to_global_id("DocumentDemoItemType", str(document_demo_item.id))
        graphene_client.force_authenticate(user)

        executed = graphene_client.mutate(
            self.DELETE_MUTATION,
            variable_values={"input": {"id": item_global_id}},
        )
        assert len(executed["errors"]) == 1
        error = executed["errors"][0]
        assert error["message"] == "No DocumentDemoItem matches the given query."

        assert models.DocumentDemoItem.objects.filter(id=document_demo_item.id).exists()

    def test_deleting_item_by_not_authorized_user(self, graphene_client, document_demo_item):
        item_global_id = to_global_id("DocumentDemoItemType", str(document_demo_item.id))

        executed = graphene_client.mutate(
            self.DELETE_MUTATION,
            variable_values={"input": {"id": item_global_id}},
        )

        assert len(executed["errors"]) == 1
        assert executed["errors"][0]["message"] == "permission_denied"
        assert executed["errors"][0]["path"] == ["deleteDocumentDemoItem"]
        assert executed["data"] == {"deleteDocumentDemoItem": None}
        assert models.DocumentDemoItem.objects.filter(id=document_demo_item.id).exists()


class TestAllContentfulDemoItemFavoritesQuery:
    FAVORITES_LIST_QUERY = """
        query  {
          allContentfulDemoItemFavorites {
            edges {
              node {
                item {
                  pk
                }
              }
            }
          }
        }
    """

    def test_returns_all_items(self, graphene_client, contentful_demo_item_favorite_factory, user):
        favorites = contentful_demo_item_favorite_factory.create_batch(3, user=user)

        graphene_client.force_authenticate(user)
        executed = graphene_client.query(self.FAVORITES_LIST_QUERY)

        assert executed == {
            "data": {
                "allContentfulDemoItemFavorites": {
                    "edges": [{"node": {"item": {"pk": favorite.item_id}}} for favorite in favorites]
                }
            }
        }

    def test_returns_logged_in_user_items(self, graphene_client, contentful_demo_item_favorite_factory, user_factory):
        user = user_factory()
        other_user = user_factory()
        favorites = contentful_demo_item_favorite_factory.create_batch(3, user=user)
        contentful_demo_item_favorite_factory.create_batch(2, user=other_user)

        graphene_client.force_authenticate(user)
        executed = graphene_client.query(self.FAVORITES_LIST_QUERY)

        assert executed == {
            "data": {
                "allContentfulDemoItemFavorites": {
                    "edges": [{"node": {"item": {"pk": favorite.item_id}}} for favorite in favorites]
                }
            }
        }


class TestCreateFavoriteContentfulDemoItemMutation:
    CREATE_FAVORITE_MUTATION = """
        mutation($input: CreateFavoriteContentfulDemoItemMutationInput!)  {
          createFavoriteContentfulDemoItem(input: $input) {
            contentfulDemoItemFavorite {
              item {
                pk
              }
            }
          }
        }
    """

    def test_create_new_favorite_item(self, graphene_client, user, contentful_demo_item_factory):
        item = contentful_demo_item_factory()
        input_data = {"item": item.id}

        graphene_client.force_authenticate(user)
        executed = graphene_client.mutate(
            self.CREATE_FAVORITE_MUTATION,
            variable_values={"input": input_data},
        )

        assert executed["data"]["createFavoriteContentfulDemoItem"]
        assert executed["data"]["createFavoriteContentfulDemoItem"]["contentfulDemoItemFavorite"]
        assert executed["data"]["createFavoriteContentfulDemoItem"]["contentfulDemoItemFavorite"]["item"]
        assert (
            executed["data"]["createFavoriteContentfulDemoItem"]["contentfulDemoItemFavorite"]["item"]["pk"] == item.id
        )

        assert models.ContentfulDemoItemFavorite.objects.count() == 1
        assert models.ContentfulDemoItemFavorite.objects.filter(item=item, user=user).exists()

    def test_create_favorite_item_when_it_already_exists(
        self, graphene_client, user, contentful_demo_item_favorite_factory
    ):
        favorite_item = contentful_demo_item_favorite_factory(user=user)
        input_data = {"item": favorite_item.item.id}

        graphene_client.force_authenticate(user)
        executed = graphene_client.mutate(
            self.CREATE_FAVORITE_MUTATION,
            variable_values={"input": input_data},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "GraphQlValidationError"

        assert models.ContentfulDemoItemFavorite.objects.count() == 1
        assert models.ContentfulDemoItemFavorite.objects.filter(item=favorite_item.item, user=user).exists()


class TestDeleteFavoriteContentfulDemoItemMutation:
    DELETE_FAVORITE_MUTATION = """
        mutation($input: DeleteFavoriteContentfulDemoItemMutationInput!)  {
          deleteFavoriteContentfulDemoItem(input: $input) {
            deletedIds
          }
        }
    """

    def test_delete_favorite_item(
        self,
        graphene_client,
        user,
        contentful_demo_item_factory,
        contentful_demo_item_favorite_factory,
    ):
        item = contentful_demo_item_factory()
        fav_item = contentful_demo_item_favorite_factory(item=item, user=user)
        input_data = {"item": item.id}

        graphene_client.force_authenticate(user)
        executed = graphene_client.mutate(
            self.DELETE_FAVORITE_MUTATION,
            variable_values={"input": input_data},
        )

        assert executed["data"]["deleteFavoriteContentfulDemoItem"]
        assert executed["data"]["deleteFavoriteContentfulDemoItem"]["deletedIds"] == [
            to_global_id("ContentfulDemoItemFavoriteType", fav_item.id)
        ]

        assert models.ContentfulDemoItemFavorite.objects.count() == 0

    def test_delete_favorite_item_wrong_id(self, graphene_client, user):
        input_data = {"item": "unexisting"}

        graphene_client.force_authenticate(user)
        executed = graphene_client.mutate(
            self.DELETE_FAVORITE_MUTATION,
            variable_values={"input": input_data},
        )

        assert executed["errors"]
        assert executed["errors"][0]["message"] == "No ContentfulDemoItemFavorite matches the given query."
