import { useCallback } from 'react';
import { useFragment, usePreloadedQuery } from 'react-relay';
import { useCommonQuery } from '../../../app/providers/commonQuery';
import { logout as logoutAction } from '../../../modules/auth/auth.actions';
import { useAsyncDispatch } from '../../utils/reduxSagaPromise';
import { CurrentUserType } from '../../services/graphqlApi/__generated/types';
import commonQueryCurrentUserFragmentGraphql, {
  commonQueryCurrentUserFragment$key,
} from '../../../app/providers/commonQuery/__generated__/commonQueryCurrentUserFragment.graphql';
import commonQueryCurrentUserQueryGraphql from '../../../app/providers/commonQuery/__generated__/commonQueryCurrentUserQuery.graphql';

export const useAuth = () => {
  const { currentUserQueryRef, reload } = useCommonQuery();

  const { currentUser } = usePreloadedQuery(commonQueryCurrentUserQueryGraphql, currentUserQueryRef!);
  const profile = useFragment<commonQueryCurrentUserFragment$key>(commonQueryCurrentUserFragmentGraphql, currentUser);

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
