import { CurrentUserType } from '@sb/webapp-api-client/graphql';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';

import { commonQueryCurrentUserQuery } from '../../app/providers/commonQuery/commonQuery.graphql';

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
