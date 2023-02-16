import { commonQueryCurrentUserQuery } from '../../app/providers/commonQuery/commonQuery.graphql';
import { composeMockedQueryResult } from '../../tests/utils/fixtures';
import { CurrentUserType } from '../services/graphqlApi';

export const fillCommonQueryWithUser = (currentUser: CurrentUserType | null = null) => {
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
