import { useCallback } from 'react';
import { usePreloadedQuery } from 'react-relay';

import { useCommonQuery } from '../../../app/providers/commonQuery';
import CommonQueryCurrentUserQuery from '../../../__generated__/commonQueryCurrentUserQuery.graphql';
import { logout as logoutAction } from '../../../modules/auth/auth.actions';
import { useAsyncDispatch } from '../../utils/reduxSagaPromise';
import { CurrentUserType } from '../../services/graphqlApi/__generated/types';

export const useAuth = () => {
  const { currentUserQueryRef, reload } = useCommonQuery();

  const { currentUser } = usePreloadedQuery(CommonQueryCurrentUserQuery, currentUserQueryRef!);
  const isLoggedIn = !!currentUser;

  const dispatch = useAsyncDispatch();

  const logout = useCallback(async () => {
    if (!isLoggedIn) {
      return;
    }
    await dispatch(logoutAction());
    reload();
  }, [isLoggedIn, dispatch, reload]);

  return {
    isLoggedIn,
    currentUser: currentUser as CurrentUserType | null,
    logout,
  };
};
