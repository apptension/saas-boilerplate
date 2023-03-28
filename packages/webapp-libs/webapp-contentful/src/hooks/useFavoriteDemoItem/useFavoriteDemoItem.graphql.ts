import { gql } from '@sb/webapp-api-client/graphql';

export const useFavoriteDemoItemListCreateMutation = gql(/* GraphQL */ `
  mutation useFavoriteDemoItemListCreateMutation($input: CreateFavoriteContentfulDemoItemMutationInput!) {
    createFavoriteContentfulDemoItem(input: $input) {
      contentfulDemoItemFavoriteEdge {
        node {
          id
          item {
            pk
          }
        }
      }
    }
  }
`);

export const useFavoriteDemoItemFragment = gql(/* GraphQL */ `
  fragment useFavoriteDemoItem_item on ContentfulDemoItemFavoriteType {
    id
    item {
      pk
    }
  }
`);

export const useFavoriteDemoItemListDeleteMutation = gql(/* GraphQL */ `
  mutation useFavoriteDemoItemListDeleteMutation($input: DeleteFavoriteContentfulDemoItemMutationInput!) {
    deleteFavoriteContentfulDemoItem(input: $input) {
      deletedIds
    }
  }
`);

export const useFavoriteDemoItemListQuery = gql(/* GraphQL */ `
  query useFavoriteDemoItemListQuery {
    allContentfulDemoItemFavorites(first: 100) {
      edges {
        node {
          id
          ...useFavoriteDemoItem_item
        }
      }
    }
  }
`);
