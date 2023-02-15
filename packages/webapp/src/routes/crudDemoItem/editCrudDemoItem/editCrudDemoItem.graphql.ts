import { gql } from '../../../shared/services/graphqlApi/__generated/gql';

export const editCrudDemoItemQuery = gql(/* GraphQL */ `
  query editCrudDemoItemQuery($id: ID!) {
    crudDemoItem(id: $id) {
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
