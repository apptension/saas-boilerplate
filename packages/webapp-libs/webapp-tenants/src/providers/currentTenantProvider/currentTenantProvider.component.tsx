import { getFragmentData } from '@sb/webapp-api-client';
import {
  commonQueryCurrentUserFragment,
  commonQueryMembershipFragment,
  useCommonQuery,
} from '@sb/webapp-api-client/providers';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useParams } from 'react-router-dom';

import { useTenants } from '../../hooks/useTenants/useTenants.hook';
import currentTenantContext from './currentTenantProvider.context';
import { setCurrentTenantStorageState, store } from './currentTenantProvider.storage';
import { CurrentTenantProviderProps } from './currentTenantProvider.types';
import { getCurrentTenant, parseStoredState } from './currentTenantProvider.utils';

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
export const CurrentTenantProvider = ({ children }: CurrentTenantProviderProps) => {
  const tenants = useTenants();
  const params = useParams<TenantPathParams>();
  const { data } = useCommonQuery();
  const storedState = useSyncExternalStore(store.subscribe, store.getSnapshot);

  const profile = getFragmentData(commonQueryCurrentUserFragment, data?.currentUser);
  const userId = profile?.id;

  const { parsedStoredState, storedTenantId } = parseStoredState(storedState, userId);

  const currentTenant = getCurrentTenant(params.tenantId, storedTenantId, tenants);
  const currentMembership = getFragmentData(commonQueryMembershipFragment, currentTenant?.membership);

  useEffect(() => {
    if (currentTenant && userId) {
      parsedStoredState[userId] = currentTenant.id;
      setCurrentTenantStorageState(parsedStoredState);
    }
  }, [currentTenant?.id, userId]);

  const value = useMemo(
    () => ({ data: currentTenant || null }),
    [currentTenant?.id, currentMembership?.role, currentTenant?.name]
  );

  return <currentTenantContext.Provider value={value}>{children}</currentTenantContext.Provider>;
};
