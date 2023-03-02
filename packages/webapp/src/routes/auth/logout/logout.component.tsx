import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { RoutesConfig } from '../../../app/config/routes';
import { useCommonQuery } from '../../../app/providers/commonQuery';
import { useGenerateLocalePath } from '../../../shared/hooks';
import { auth } from '../../../shared/services/api';
import { invalidateApolloStore } from '../../../shared/services/graphqlApi/apolloClient';

export const Logout = () => {
  const { reload: reloadCommonQuery } = useCommonQuery();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();

  useEffect(() => {
    (async () => {
      try {
        await auth.logout();
      } catch {}

      invalidateApolloStore();
      reloadCommonQuery();
      navigate(generateLocalePath(RoutesConfig.login));
    })();
  }, [reloadCommonQuery, generateLocalePath, navigate]);

  return null;
};
