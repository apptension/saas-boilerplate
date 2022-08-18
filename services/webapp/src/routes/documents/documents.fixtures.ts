import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { connectionFromArray } from '../../shared/utils/testUtils';
import DocumentsListQuery from '../../__generated__/documentsListQuery.graphql';
import { DeepPartial } from '../../shared/utils/types';
import { DocumentDemoItemType } from '../../shared/services/graphqlApi/__generated/types';

export const generateRelayEnvironmentDocuments = (documents: DeepPartial<DocumentDemoItemType>[]) => {
  const env = createMockEnvironment();
  env.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      DocumentDemoItemConnection: () => connectionFromArray(documents),
    })
  );
  env.mock.queuePendingOperation(DocumentsListQuery, {});
  return env;
};
