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

      // Clear user tracking
      setUserId(null);

      // Reload common query to clear user data from cache
      // This will update isLoggedIn to false
      await reloadCommonQuery();

      // Navigate to login page
      navigate(generateLocalePath(RoutesConfig.login));
    })();
  }, [reloadCommonQuery, generateLocalePath, navigate]);

  return null;
};
