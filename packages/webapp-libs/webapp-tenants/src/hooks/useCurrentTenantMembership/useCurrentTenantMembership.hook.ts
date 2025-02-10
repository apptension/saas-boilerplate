import { getFragmentData } from '@sb/webapp-api-client';
import { commonQueryMembershipFragment } from '@sb/webapp-api-client/providers';

import { useCurrentTenant } from '../../providers';

/**
 * Hook that retrieves the user's membership of the current tenant.
 *
 * This hook uses the `useCurrentTenant` hook to get the current tenant's data, and then extracts the membership data
 * using the `getFragmentData` function with the `commonQueryMembershipFragment`.
 *
 * @returns {object | null} The membership of the current tenant if available, or `null` otherwise.
 */
export const useCurrentTenantMembership = () => {
  const currentTenant = useCurrentTenant();

  const currentMembership = getFragmentData(commonQueryMembershipFragment, currentTenant?.data?.membership);
  return { currentMembership };
};
