import { times } from 'ramda';
import { MockPayloadGenerator, RelayMockEnvironment } from 'relay-test-utils';

import DocumentsListQuery from '../../routes/documents/__generated__/documentsListQuery.graphql';
import { documentsListDeleteMutation, documentsListQuery } from '../../routes/documents/documents.graphql';
import { DocumentDemoItemType } from '../../shared/services/graphqlApi';
import { DocumentsDeleteMutationMutation } from '../../shared/services/graphqlApi/__generated/gql/graphql';
import {
  composeMockedListQueryResult,
  composeMockedQueryResult,
  connectionFromArray,
  makeId,
} from '../../tests/utils/fixtures';
import { createDeepFactory } from './factoryCreators';

export const documentFactory = createDeepFactory<Partial<DocumentDemoItemType>>(() => ({
  id: makeId(32),
  createdAt: new Date().toISOString(),
  file: {
    name: `${makeId(32)}.png`,
    url: `http://localhost/image/${makeId(32)}.pdf`,
  },
}));

export const fillDocumentsListQuery = (env?: RelayMockEnvironment, data = times(() => documentFactory(), 3)) => {
  if (env) {
    env.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        DocumentDemoItemConnection: () => connectionFromArray(data),
      })
    );
    env.mock.queuePendingOperation(DocumentsListQuery, {});
  }

  return composeMockedListQueryResult(documentsListQuery, 'allDocumentDemoItems', 'DocumentDemoItemType', { data });
};

export const fillDocumentDeleteQuery = (id: string, data: DocumentsDeleteMutationMutation) => {
  const deleteMutationMock = composeMockedQueryResult(documentsListDeleteMutation, {
    variables: {
      input: {
        id,
      },
    },
    data,
  });

  return deleteMutationMock;
};
