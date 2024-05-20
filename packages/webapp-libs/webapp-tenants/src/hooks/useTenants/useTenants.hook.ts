import { getFragmentData } from '@sb/webapp-api-client/graphql';
import { commonQueryTenantItemFragment, useCommonQuery } from '@sb/webapp-api-client/providers';
import { useMemo } from 'react';

/**
 * Hook that retrieves the current user's tenants.
 *
 * This hook uses the `useCommonQuery` hook to get the current user's data, and then extracts the tenants from it.
 *
 * @returns {Array} An array of the current user's tenants.
 */
export const useTenants = () => {
  const { data } = useCommonQuery();
  return useMemo(() => {
    const tenantsRaw = data?.currentUser?.tenants || [];
    return tenantsRaw.map((t) => getFragmentData(commonQueryTenantItemFragment, t));
  }, [data]);
};
