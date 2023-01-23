import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { useGenerateLocalePath } from '../../../shared/hooks/localePaths';
import { invalidateRelayStore } from '../../../shared/services/graphqlApi/relayEnvironment';
import { auth } from '../../../shared/services/api';
import { useCommonQuery } from '../../../app/providers/commonQuery';
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

      invalidateRelayStore();
      reloadCommonQuery();
      navigate(generateLocalePath(RoutesConfig.login));
    })();
  }, [reloadCommonQuery, generateLocalePath, navigate]);

  return null;
};
