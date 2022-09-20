import { useCallback } from 'react';
import { useFragment, usePreloadedQuery } from 'react-relay';
import { useNavigate } from 'react-router';

import { useCommonQuery } from '../../../app/providers/commonQuery';
import { CurrentUserType } from '../../services/graphqlApi/__generated/types';
import commonQueryCurrentUserFragmentGraphql, {
  commonQueryCurrentUserFragment$key,
} from '../../../app/providers/commonQuery/__generated__/commonQueryCurrentUserFragment.graphql';
import commonQueryCurrentUserQueryGraphql from '../../../app/providers/commonQuery/__generated__/commonQueryCurrentUserQuery.graphql';
import { RoutesConfig } from '../../../app/config/routes';
import { useGenerateLocalePath } from '../localePaths';

export const useAuth = () => {
  const { currentUserQueryRef } = useCommonQuery();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();

  const { currentUser } = usePreloadedQuery(commonQueryCurrentUserQueryGraphql, currentUserQueryRef!);
  const profile = useFragment<commonQueryCurrentUserFragment$key>(commonQueryCurrentUserFragmentGraphql, currentUser);
  const isLoggedIn = !!profile;

  const logout = useCallback(() => {
    navigate(generateLocalePath(RoutesConfig.logout));
  }, [navigate, generateLocalePath]);

  return {
    isLoggedIn,
    currentUser: profile as CurrentUserType | null,
    logout,
  };
};
