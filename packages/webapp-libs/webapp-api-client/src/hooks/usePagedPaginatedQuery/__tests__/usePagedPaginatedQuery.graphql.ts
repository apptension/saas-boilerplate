import { gql } from '@apollo/client';
import { TypedDocumentNode } from '@graphql-typed-document-node/core';

import { PagedPaginationListTestQueryQuery, PagedPaginationListTestQueryQueryVariables } from '../../../graphql';

export const pagedPaginationListTestQuery: TypedDocumentNode<
  PagedPaginationListTestQueryQuery,
  PagedPaginationListTestQueryQueryVariables
> = gql(/* GraphQL */ `
  query pagedPaginationListTestQuery($first: Int, $after: String, $last: Int, $before: String) {
    allCrudDemoItems(first: $first, after: $after, last: $last, before: $before) {
      edges {
        node {
          id
        }
      }
      pageCursors {
        around {
          cursor
          isCurrent
          page
        }
        first {
          cursor
          isCurrent
          page
        }
        last {
          cursor
          isCurrent
          page
        }
        next {
          cursor
          isCurrent
          page
        }
        previous {
          cursor
          isCurrent
          page
        }
      }
    }
  }
`);
