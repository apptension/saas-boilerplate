import { DocumentDemoItemType, DocumentsDeleteMutationMutation } from '@sb/webapp-api-client/graphql';
import {
  composeMockedListQueryResult,
  composeMockedQueryResult,
  createDeepFactory,
  makeId,
} from '@sb/webapp-api-client/tests/utils';
import { times } from 'ramda';

import { documentsListDeleteMutation, documentsListQuery } from '../../routes/documents/documents.graphql';

export const documentFactory = createDeepFactory<Partial<DocumentDemoItemType>>(() => ({
  id: makeId(32),
  createdAt: new Date().toISOString(),
  file: {
    name: `${makeId(32)}.png`,
    url: `http://localhost/image/${makeId(32)}.pdf`,
  },
}));

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
