import { gql } from '@sb/webapp-api-client/graphql';

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
