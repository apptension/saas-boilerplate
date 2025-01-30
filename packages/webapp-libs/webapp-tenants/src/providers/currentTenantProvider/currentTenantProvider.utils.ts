import { CommonQueryTenantItemFragmentFragment, getFragmentData } from '@sb/webapp-api-client';
import { TenantType } from '@sb/webapp-api-client/constants';
import { commonQueryMembershipFragment } from '@sb/webapp-api-client/providers';
import { prop } from 'ramda';

export const parseStoredState = (storedState: string, userId = '') => {
  try {
    const parsedStoredState = JSON.parse(storedState);

    return {
      parsedStoredState,
      storedTenantId: parsedStoredState?.[userId] ?? null,
    };
  } catch {
    return {
      parsedStoredState: {},
      storedTenantId: null,
    };
  }
};

const getTenantId = (
  tenantId = '',
  storedTenantId: string | null,
  tenants: (CommonQueryTenantItemFragmentFragment | null | undefined)[]
) => {
  if (tenantId) return tenantId;

  if (storedTenantId && tenants.map(prop<string>('id')).includes(storedTenantId)) {
    return storedTenantId;
  }

  return '';
};

export const getCurrentTenant = (
  paramsTenantId = '',
  storedTenantId: string | null,
  tenants: (CommonQueryTenantItemFragmentFragment | null | undefined)[]
) => {
  const tenantId = getTenantId(paramsTenantId, storedTenantId, tenants);

  const currentTenant = tenants.find(
    (t) => t?.id === tenantId && getFragmentData(commonQueryMembershipFragment, t.membership)?.invitationAccepted
  );
  if (currentTenant) return currentTenant;

  const firstDefaultTenant = tenants.find((t) => t?.type === TenantType.PERSONAL);
  if (firstDefaultTenant) return firstDefaultTenant;

  return tenants[0];
};
