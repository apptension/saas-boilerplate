import { gql } from '@sb/webapp-api-client/graphql';

export const crudDemoItemListItemDeleteMutation = gql(/* GraphQL */ `
  mutation crudDemoItemListItemDeleteMutation($input: DeleteCrudDemoItemMutationInput!) {
    deleteCrudDemoItem(input: $input) {
      deletedIds
    }
  }
`);

export const crudDemoItemListItemFragment = gql(/* GraphQL */ `
  fragment crudDemoItemListItem on CrudDemoItemType {
    id
    name
  }
`);
