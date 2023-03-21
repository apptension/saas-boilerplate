import { CurrentUserType } from '../../graphql';
import { commonQueryCurrentUserQuery } from '../../providers/commonQuery';
import { composeMockedQueryResult } from '../../tests/utils';

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
