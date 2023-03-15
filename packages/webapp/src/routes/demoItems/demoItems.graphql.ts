import { gql } from '@sb/webapp-api-client/graphql';

export const demoItemListItemFragment = gql(/* GraphQL */ `
  fragment demoItemListItemFragment on DemoItem {
    title
    image {
      title
      url
    }
  }
`);

export const demoItemsAllQuery = gql(/* GraphQL */ `
  query demoItemsAllQuery {
    demoItemCollection {
      items {
        sys {
          id
        }
        ...demoItemListItemFragment
      }
    }
  }
`);
