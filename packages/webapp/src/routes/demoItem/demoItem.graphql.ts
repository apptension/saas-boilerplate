import { gql } from '../../shared/services/graphqlApi/__generated/gql';

export const demoItemQuery = gql(/* GraphQL */ `
  query demoItemQuery($id: String!) {
    demoItem(id: $id) {
      title
      description
      image {
        url
        title
        description
      }
    }
  }
`);
