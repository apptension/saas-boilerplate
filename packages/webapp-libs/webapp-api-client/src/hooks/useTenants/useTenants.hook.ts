import { useMemo } from 'react';

import { getFragmentData } from '../../graphql';
import { tenantListItemFragment, useCommonQuery } from '../../providers';

export const useTenants = () => {
  const { data } = useCommonQuery();
  return useMemo(() => {
    const tenantsRaw = data?.allTenants?.edges || [];
    return tenantsRaw.map((t) => getFragmentData(tenantListItemFragment, t?.node));
  }, [data]);
};
