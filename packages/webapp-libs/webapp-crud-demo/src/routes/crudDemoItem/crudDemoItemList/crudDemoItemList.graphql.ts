import { gql } from '@sb/webapp-api-client';

export const crudDemoItemListQuery = gql(/* GraphQL */ `
  query CrudDemoItemListQuery(
    $tenantId: ID!
    $search: String
    $first: Int
    $after: String
    $last: Int
    $before: String
  ) {
    allCrudDemoItems(tenantId: $tenantId, search: $search, first: $first, after: $after, last: $last, before: $before) {
      edges {
        node {
          id
          ...crudDemoItemListItem
        }
      }
      pageCursors {
        ...pageCursorsFragment
      }
    }
  }
`);

export const crudDemoItemListItemFragment = gql(/* GraphQL */ `
  fragment crudDemoItemListItem on CrudDemoItemType {
    id
    name
    createdBy {
      firstName
      lastName
    }
    tenant {
      name
    }
  }
`);
