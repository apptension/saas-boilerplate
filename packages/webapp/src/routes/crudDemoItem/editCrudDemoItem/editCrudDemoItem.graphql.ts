import { gql } from '../../../shared/services/graphqlApi/__generated/gql';

export const CRUD_DEMO_ITEM_EDIT_QUERY = gql(/* GraphQL */ `
  query editCrudDemoItemQuery($id: ID!) {
    crudDemoItem(id: $id) {
      id
      name
    }
  }
`);

export const CRUD_DEMO_ITEM_EDIT_MUTATION = gql(/* GraphQL */ `
  mutation editCrudDemoItemContentMutation($input: UpdateCrudDemoItemMutationInput!) {
    updateCrudDemoItem(input: $input) {
      crudDemoItem {
        id
        name
      }
    }
  }
`);
