import { CurrentUserType, useFragment } from '@sb/webapp-api-client/graphql';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { RoutesConfig } from '../../../app/config/routes';
import { useCommonQuery } from '../../../app/providers/commonQuery';
import { commonQueryCurrentUserFragment } from '../../../app/providers/commonQuery/commonQuery.graphql';
import { useGenerateLocalePath } from '../localePaths';

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
