import { gql } from '@apollo/client';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { PaginationListTestQueryQuery, PaginationListTestQueryQueryVariables } from '@sb/webapp-api-client/graphql';

export const paginationListTestQuery: TypedDocumentNode<
  PaginationListTestQueryQuery,
  PaginationListTestQueryQueryVariables
> = gql(/* GraphQL */ `
  query paginationListTestQuery($first: Int, $after: String, $last: Int, $before: String) {
    allNotifications(first: $first, after: $after, last: $last, before: $before) {
      edges {
        node {
          id
        }
      }
      pageInfo {
        startCursor
        endCursor
        hasPreviousPage
        hasNextPage
      }
    }
  }
`);
