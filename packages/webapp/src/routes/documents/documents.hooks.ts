import graphql from 'babel-plugin-relay/macro';
import { ConnectionHandler } from 'relay-runtime';
import { usePromiseMutation } from '../../shared/services/graphqlApi/usePromiseMutation';
import { documentsListCreateMutation } from './__generated__/documentsListCreateMutation.graphql';

export const useHandleDrop = () => {
  const [commitDropMutation] = usePromiseMutation<documentsListCreateMutation>(
    graphql`
      mutation documentsListCreateMutation($input: CreateDocumentDemoItemMutationInput!, $connections: [ID!]!) {
        createDocumentDemoItem(input: $input) {
          documentDemoItemEdge @appendEdge(connections: $connections) {
            node {
              createdAt
              file {
                name
                url
              }
            }
          }
        }
      }
    `
  );

  return async (files: File[]) => {
    for (const file of files) {
      await commitDropMutation({
        variables: {
          input: {},
          connections: [ConnectionHandler.getConnectionID('root', 'documentsList_allDocumentDemoItems')],
        },
        uploadables: {
          file,
        },
      });
    }
  };
};

export const useHandleDelete = () => {
  const [commitDeleteMutation] = usePromiseMutation(graphql`
    mutation documentsDeleteMutation($input: DeleteDocumentDemoItemMutationInput!, $connections: [ID!]!) {
      deleteDocumentDemoItem(input: $input) {
        deletedIds @deleteEdge(connections: $connections)
      }
    }
  `);

  return async (id: string) => {
    await commitDeleteMutation({
      variables: {
        input: {
          id,
        },
        connections: [ConnectionHandler.getConnectionID('root', 'documentsList_allDocumentDemoItems')],
      },
    });
  };
};
