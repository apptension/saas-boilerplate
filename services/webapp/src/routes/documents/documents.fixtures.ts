import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { connectionFromArray } from '../../shared/utils/testUtils';
import DocumentsListQuery from '../../__generated__/documentsListQuery.graphql';
import { DeepPartial } from '../../shared/utils/types';
import { DocumentDemoItemType } from '../../shared/services/graphqlApi/__generated/types';
import { fillCommonQueryWithUser } from '../../shared/utils/commonQuery';

export const generateRelayEnvironmentDocuments = (documents: DeepPartial<DocumentDemoItemType>[]) => {
  const env = createMockEnvironment();
  fillCommonQueryWithUser(env);
  env.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      DocumentDemoItemConnection: () => connectionFromArray(documents),
    })
  );
  env.mock.queuePendingOperation(DocumentsListQuery, {});
  return env;
};
