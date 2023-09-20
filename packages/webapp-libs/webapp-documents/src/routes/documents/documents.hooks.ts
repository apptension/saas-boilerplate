import { useMutation } from '@apollo/client';
import { trackEvent } from '@sb/webapp-core/services/analytics';

import {
  documentListItemFragment,
  documentsListCreateMutation,
  documentsListDeleteMutation,
  documentsListQuery,
} from './documents.graphql';

export const useHandleDrop = () => {
  const [commitMutation] = useMutation(documentsListCreateMutation, {
    update(cache, { data }) {
      const node = data?.createDocumentDemoItem?.documentDemoItemEdge?.node;
      if (!node) {
        return;
      }

      const { allDocumentDemoItems } = cache.readQuery({ query: documentsListQuery }) ?? {};
      const isAlreadyInConnection = allDocumentDemoItems?.edges?.some((edge) => edge?.node?.id === node?.id);
      if (isAlreadyInConnection) {
        return;
      }

      const newEdge = {
        node: cache.writeFragment({
          data: {
            createdAt: null,
            ...node,
          },
          fragment: documentListItemFragment,
        }),
      };

      cache.modify({
        fields: {
          allDocumentDemoItems(existingConnection) {
            return { ...existingConnection, edges: [...(existingConnection?.edges ?? []), newEdge] };
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
