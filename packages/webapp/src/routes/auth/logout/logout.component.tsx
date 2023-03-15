import { invalidateApolloStore } from '@sb/webapp-api-client';
import { auth } from '@sb/webapp-api-client/api';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { RoutesConfig } from '../../../app/config/routes';
import { useCommonQuery } from '../../../app/providers/commonQuery';
import { useGenerateLocalePath } from '../../../shared/hooks';

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
