import { gql } from '../../../../shared/services/graphqlApi/__generated/gql';

export const CRUD_DEMO_ITEM_LIST_DELETE_MUTATION = gql(/* GraphQL */ `
  mutation crudDemoItemListItemDeleteMutation($input: DeleteCrudDemoItemMutationInput!) {
    deleteCrudDemoItem(input: $input) {
      deletedIds
    }
  }
`);

export const CRUD_DEMO_ITEM_LIST_ITEM_FRAGMENT = gql(/* GraphQL */ `
  fragment crudDemoItemListItem on CrudDemoItemType {
    id
    name
  }
`);
