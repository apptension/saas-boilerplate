import { DocumentsDeleteMutationMutation } from '@sb/webapp-api-client/graphql';
import { documentFactory } from '@sb/webapp-api-client/tests/factories';
import { composeMockedListQueryResult, composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { times } from 'ramda';

import { documentsListDeleteMutation, documentsListQuery } from '../../routes/documents/documents.graphql';

export const fillDocumentsListQuery = (data = times(() => documentFactory(), 3)) => {
  return composeMockedListQueryResult(documentsListQuery, 'allDocumentDemoItems', 'DocumentDemoItemType', { data });
};

export const fillDocumentDeleteQuery = (id: string, data: DocumentsDeleteMutationMutation) =>
  composeMockedQueryResult(documentsListDeleteMutation, {
    variables: {
      input: {
        id,
      },
    },
    data,
  });
