import { gql } from '../../shared/services/graphqlApi/__generated/gql';

export const documentListItemFragment = gql(/* GraphQL */ `
  fragment documentListItem on DocumentDemoItemType {
    id
    file {
      url
      name
    }
    createdAt
  }
`);

export const documentsListQuery = gql(/* GraphQL */ `
  query documentsListQuery {
    allDocumentDemoItems(first: 10) {
      edges {
        node {
          id
          createdAt
          ...documentListItem
        }
      }
    }
  }
`);
