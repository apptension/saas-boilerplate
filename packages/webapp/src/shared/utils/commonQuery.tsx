import { createMockEnvironment, RelayMockEnvironment } from 'relay-test-utils';
import { CurrentUserType } from '../services/graphqlApi';
import commonQueryCurrentUserQueryGraphql from '../../app/providers/commonQuery/__generated__/commonQueryCurrentUserQuery.graphql';
import { composeMockedQueryResult } from '../../tests/utils/fixtures';
import { commonQueryCurrentUserQuery } from '../../app/providers/commonQuery/commonQuery.graphql';

export const fillCommonQueryWithUser = (env?: RelayMockEnvironment, currentUser: CurrentUserType | null = null) => {
  if (!env) {
    env = createMockEnvironment();
  }
  env.mock.queueOperationResolver((operation) => {
    return {
      data: {
        currentUser,
      },
    };
  });
  env.mock.queuePendingOperation(commonQueryCurrentUserQueryGraphql, {});

  return composeMockedQueryResult(commonQueryCurrentUserQuery, {
    data: {
      currentUser: currentUser
        ? {
            __typename: 'CurrentUserType',
            ...currentUser,
          }
        : null,
    },
  });
};
