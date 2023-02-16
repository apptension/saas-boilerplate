import { gql } from '../../shared/services/graphqlApi/__generated/gql';

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
