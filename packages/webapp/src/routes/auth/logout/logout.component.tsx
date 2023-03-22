import { invalidateApolloStore } from '@sb/webapp-api-client';
import { auth } from '@sb/webapp-api-client/api';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { setUserId } from '@sb/webapp-core/services/analytics';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { RoutesConfig } from '../../../app/config/routes';

export const Logout = () => {
  const { reload: reloadCommonQuery } = useCommonQuery();
  const navigate = useNavigate();
  const generateLocalePath = useGenerateLocalePath();

  useEffect(() => {
    (async () => {
      try {
        await auth.logout();
      } catch {}

      reloadCommonQuery();
      setUserId(null);
      invalidateApolloStore();
      navigate(generateLocalePath(RoutesConfig.login));
    })();
  }, [reloadCommonQuery, generateLocalePath, navigate]);

  return null;
};
