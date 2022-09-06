import { useCallback } from 'react';
import { usePreloadedQuery, useFragment } from 'react-relay';
import { useCommonQuery } from '../../../app/providers/commonQuery';
import CommonQueryCurrentUserQuery from '../../../__generated__/commonQueryCurrentUserQuery.graphql';
import CurrentUserFragment, {
  commonQueryCurrentUserFragment$key,
} from '../../../__generated__/commonQueryCurrentUserFragment.graphql';
import { logout as logoutAction } from '../../../modules/auth/auth.actions';
import { useAsyncDispatch } from '../../utils/reduxSagaPromise';
import { CurrentUserType } from '../../services/graphqlApi/__generated/types';

export const useAuth = () => {
  const { currentUserQueryRef, reload } = useCommonQuery();

  const { currentUser } = usePreloadedQuery(CommonQueryCurrentUserQuery, currentUserQueryRef!);
  const profile = useFragment<commonQueryCurrentUserFragment$key>(CurrentUserFragment, currentUser);

  const isLoggedIn = !!profile;

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
    currentUser: profile as CurrentUserType | null,
    logout,
  };
};
