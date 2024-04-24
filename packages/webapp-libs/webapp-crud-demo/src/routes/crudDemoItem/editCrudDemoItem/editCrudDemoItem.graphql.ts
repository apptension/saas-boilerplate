import { gql } from '@sb/webapp-api-client/graphql';

export const editCrudDemoItemQuery = gql(/* GraphQL */ `
  query editCrudDemoItemQuery($id: ID!, $tenantId: ID!) {
    crudDemoItem(id: $id, tenantId: $tenantId) {
      id
      name
    }
  }
`);

export const editCrudDemoItemMutation = gql(/* GraphQL */ `
  mutation editCrudDemoItemContentMutation($input: UpdateCrudDemoItemMutationInput!) {
    updateCrudDemoItem(input: $input) {
      crudDemoItem {
        id
        name
      }
    }
  }
`);
