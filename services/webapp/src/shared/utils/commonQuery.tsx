import { RelayMockEnvironment } from 'relay-test-utils';
import { CurrentUserType } from '../services/graphqlApi/__generated/types';
import commonQueryCurrentUserQueryGraphql from '../../app/providers/commonQuery/__generated__/commonQueryCurrentUserQuery.graphql';

export const fillCommonQueryWithUser = (env: RelayMockEnvironment, currentUser: CurrentUserType | null = null) => {
  env.mock.queueOperationResolver((operation) => {
    return {
      data: {
        currentUser,
      },
    };
  });
  env.mock.queuePendingOperation(commonQueryCurrentUserQueryGraphql, {});
};
