import { getFragmentData } from '@sb/webapp-api-client/graphql';
import { commonQueryTenantItemFragment, useCommonQuery } from '@sb/webapp-api-client/providers';
import { useMemo } from 'react';

export const useTenants = () => {
  const { data } = useCommonQuery();
  return useMemo(() => {
    const tenantsRaw = data?.currentUser?.tenants || [];
    return tenantsRaw.map((t) => getFragmentData(commonQueryTenantItemFragment, t));
  }, [data]);
};
