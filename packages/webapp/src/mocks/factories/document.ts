import { times } from 'ramda';

import { documentsListDeleteMutation, documentsListQuery } from '../../routes/documents/documents.graphql';
import { DocumentDemoItemType } from '../../shared/services/graphqlApi';
import { DocumentsDeleteMutationMutation } from '../../shared/services/graphqlApi/__generated/gql/graphql';
import { composeMockedListQueryResult, composeMockedQueryResult, makeId } from '../../tests/utils/fixtures';
import { createDeepFactory } from './factoryCreators';

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
