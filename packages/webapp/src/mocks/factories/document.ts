import { times } from 'ramda';
import { MockPayloadGenerator, RelayMockEnvironment } from 'relay-test-utils';

import { DocumentDemoItemType } from '../../shared/services/graphqlApi';
import { connectionFromArray, makeId } from '../../tests/utils/fixtures';
import DocumentsListQuery from '../../routes/documents/__generated__/documentsListQuery.graphql';
import { createDeepFactory } from './factoryCreators';

export const documentFactory = createDeepFactory<Partial<DocumentDemoItemType>>(() => ({
  id: makeId(32),
  createdAt: new Date().toISOString(),
  file: {
    name: `${makeId(32)}.png`,
    url: `http://localhost/image/${makeId(32)}.pdf`,
  },
}));

export const fillDocumentsListQuery = (env: RelayMockEnvironment, data = times(() => documentFactory(), 3)) => {
  env.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      DocumentDemoItemConnection: () => connectionFromArray(data),
    })
  );
  env.mock.queuePendingOperation(DocumentsListQuery, {});
};
