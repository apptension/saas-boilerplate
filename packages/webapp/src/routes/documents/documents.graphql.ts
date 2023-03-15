import { gql } from '@sb/webapp-api-client/graphql';

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
          ...documentListItem
        }
      }
    }
  }
`);

export const documentsListCreateMutation = gql(/* GraphQL */ `
  mutation documentsListCreateMutation($input: CreateDocumentDemoItemMutationInput!) {
    createDocumentDemoItem(input: $input) {
      documentDemoItemEdge {
        node {
          id
          ...documentListItem
        }
      }
    }
  }
`);

export const documentsListDeleteMutation = gql(/* GraphQL */ `
  mutation documentsDeleteMutation($input: DeleteDocumentDemoItemMutationInput!) {
    deleteDocumentDemoItem(input: $input) {
      deletedIds
    }
  }
`);
