import { TenantType } from '@sb/webapp-api-client/constants';
import { reportError } from '@sb/webapp-core/utils/reportError';
import { prop } from 'ramda';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useTenants } from '../../hooks/useTenants/useTenants.hook';
import currentTenantContext from './currentTenant.context';
import { CURRENT_TENANT_STORAGE_KEY, CurrentTenantProviderProps } from './currentTenant.types';

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
export const CurrentTenant = ({ children, storageKey = CURRENT_TENANT_STORAGE_KEY }: CurrentTenantProviderProps) => {
  const params = useParams<TenantPathParams>();
  let { tenantId } = params;

  const tenants = useTenants();

  if (!tenantId) {
    const localId = localStorage.getItem(storageKey);
    if (
      localId &&
      tenants
        .map(prop<string>('id'))
        .filter((id) => !!id)
        .includes(localId)
    ) {
      tenantId = localId;
    }
  }

  let currentTenant = tenants.find((t) => t?.id === tenantId);
  if (!currentTenant) {
    // select first default
    currentTenant = tenants.find((t) => t?.type === TenantType.PERSONAL);

    if (!currentTenant && tenants.length > 0) {
      currentTenant = tenants[0];
    }
  }

  if (currentTenant) {
    try {
      localStorage.setItem(storageKey, currentTenant.id);
    } catch (e) {
      reportError(e);
    }
  }

  const value = useMemo(() => ({ data: currentTenant || null }), [currentTenant?.id, currentTenant?.membership?.role]);

  return <currentTenantContext.Provider value={value}>{children}</currentTenantContext.Provider>;
};
