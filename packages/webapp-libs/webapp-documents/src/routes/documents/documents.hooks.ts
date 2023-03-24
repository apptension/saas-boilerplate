import { useMutation } from '@apollo/client';
import { trackEvent } from '@sb/webapp-core/services/analytics';

import {
  documentListItemFragment,
  documentsListCreateMutation,
  documentsListDeleteMutation,
} from './documents.graphql';

export const useHandleDrop = () => {
  const [commitMutation] = useMutation(documentsListCreateMutation, {
    update(cache, { data }) {
      cache.modify({
        fields: {
          allDocumentDemoItems(existingConnection = { edges: [] }) {
            const node = data?.createDocumentDemoItem?.documentDemoItemEdge?.node;
            if (!node) return existingConnection;

            const normalizedId = cache.identify(node);

            const isAlreadyInStore = existingConnection.edges.some(({ node }) => node.__ref === normalizedId);
            if (isAlreadyInStore) return existingConnection;

            const newFile = {
              node: cache.writeFragment({
                data: node,
                fragment: documentListItemFragment,
              }),
            };

            return { ...existingConnection, edges: [...existingConnection.edges, newFile] };
          },
        },
      });
    },
    onCompleted: (data) => {
      trackEvent('document', 'upload', data.createDocumentDemoItem?.documentDemoItemEdge?.node?.id);
    },
  });

  return async (files: File[]) => {
    for (const file of files) {
      await commitMutation({
        variables: {
          input: {
            file,
          },
        },
      });
    }
  };
};

export const useHandleDelete = () => {
  const [commitDeleteMutation] = useMutation(documentsListDeleteMutation, {
    update(cache, { data }) {
      const deletedId = data?.deleteDocumentDemoItem?.deletedIds?.[0];
      const normalizedId = cache.identify({ id: deletedId, __typename: 'DocumentDemoItemType' });
      cache.evict({ id: normalizedId });
    },
    onCompleted: (data) => {
      trackEvent('document', 'delete', data.deleteDocumentDemoItem?.deletedIds?.join(', '));
    },
  });

  return async (id: string) => {
    await commitDeleteMutation({
      variables: {
        input: {
          id,
        },
      },
    });
  };
};
