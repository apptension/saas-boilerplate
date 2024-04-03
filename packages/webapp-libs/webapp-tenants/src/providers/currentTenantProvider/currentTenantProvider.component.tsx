import { TenantType } from '@sb/webapp-api-client/constants';
import { prop } from 'ramda';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useParams } from 'react-router-dom';

import { useTenants } from '../../hooks/useTenants/useTenants.hook';
import currentTenantContext from './currentTenantProvider.context';
import { setCurrentTenantStorageState, store } from './currentTenantProvider.storage';
import { CurrentTenantProviderProps } from './currentTenantProvider.types';

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
  const params = useParams<TenantPathParams>();
  let { tenantId } = params;

  const tenants = useTenants();
  const storedTenantId = useSyncExternalStore(store.subscribe, store.getSnapshot);

  if (
    !tenantId &&
    storedTenantId &&
    tenants
      .map(prop<string>('id'))
      .filter((id) => !!id)
      .includes(storedTenantId)
  ) {
    tenantId = storedTenantId;
  }

  let currentTenant = tenants.find((t) => t?.id === tenantId);
  if (!currentTenant) {
    // select first default
    currentTenant = tenants.find((t) => t?.type === TenantType.PERSONAL);

    if (!currentTenant && tenants.length > 0) {
      currentTenant = tenants[0];
    }
  }

  useEffect(() => {
    if (currentTenant) {
      setCurrentTenantStorageState(currentTenant.id);
    }
  }, [currentTenant?.id]);

  const value = useMemo(() => ({ data: currentTenant || null }), [currentTenant?.id, currentTenant?.membership?.role]);

  return <currentTenantContext.Provider value={value}>{children}</currentTenantContext.Provider>;
};
