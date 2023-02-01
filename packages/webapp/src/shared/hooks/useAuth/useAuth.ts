import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { useCommonQuery } from '../../../app/providers/commonQuery';
import { CurrentUserType } from '../../services/graphqlApi';
import { useFragment } from '../../services/graphqlApi/__generated/gql';
import { RoutesConfig } from '../../../app/config/routes';
import { useGenerateLocalePath } from '../localePaths';
import { commonQueryCurrentUserFragment } from '../../../app/providers/commonQuery/commonQuery.graphql';

export const useAuth = () => {
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();
  const { data } = useCommonQuery();
  const profile = useFragment(commonQueryCurrentUserFragment, data?.currentUser);

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
