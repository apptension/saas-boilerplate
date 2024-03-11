import { PropsWithChildren, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useCommonQuery } from '../../providers';
import currentTenantContext from './currentTenant.context';
import { tenantListItemFragment } from './currentTenant.graphql';
import { getFragmentData } from '@sb/webapp-api-client/graphql';

export type TenantPathParams = {
  tenantId: string;
};

/**
 *
 * @param children
 * @constructor
 *
 * @category Component
 */
export const CurrentTenant = ({ children }: PropsWithChildren) => {
  const params = useParams<TenantPathParams>();
  const { tenantId } = params;

  const { data: commonQueryData } = useCommonQuery();
  const tenantsRaw = commonQueryData?.allTenants?.edges || [];
  const tenants = tenantsRaw.map((t) => getFragmentData(tenantListItemFragment, t?.node));

  let currentTenant = tenants.find((t) => t?.id === tenantId);
  if (!currentTenant) {
    // select first default
    // todo: introduce default type as a const/enum
    currentTenant = tenants.find((t) => t?.type === 'default');

    if (!currentTenant && tenants.length > 0) {
      currentTenant = tenants[0];
    }
  }

  const value = useMemo(() => ({ data: currentTenant || null }), [currentTenant?.id, currentTenant?.membership?.role]);

  return <currentTenantContext.Provider value={value}>{children}</currentTenantContext.Provider>;
};
