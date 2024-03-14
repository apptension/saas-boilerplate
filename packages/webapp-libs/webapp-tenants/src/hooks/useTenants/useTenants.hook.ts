import { getFragmentData } from '@sb/webapp-api-client/graphql';
import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { useMemo } from 'react';

import { tenantListItemFragment } from '../../providers';

export const useTenants = () => {
  const { data } = useCommonQuery();
  return useMemo(() => {
    const tenantsRaw = data?.currentUser?.tenants || [];
    return tenantsRaw.map((t) => getFragmentData(tenantListItemFragment, t));
  }, [data]);
};
