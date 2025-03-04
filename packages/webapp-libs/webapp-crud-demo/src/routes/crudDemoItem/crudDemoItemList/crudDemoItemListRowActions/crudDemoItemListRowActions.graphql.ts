import { gql } from '@sb/webapp-api-client/graphql';

export const crudDemoItemListRowActionsDeleteMutation = gql(/* GraphQL */ `
  mutation crudDemoItemListItemDeleteMutation($input: DeleteCrudDemoItemMutationInput!) {
    deleteCrudDemoItem(input: $input) {
      deletedIds
    }
  }
`);
