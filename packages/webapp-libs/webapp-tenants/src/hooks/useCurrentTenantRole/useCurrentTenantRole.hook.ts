import { useCurrentTenant } from '../../providers';

/**
 * Hook that retrieves the user's role of the current tenant.
 *
 * This hook uses the `useCurrentTenant` hook to get the current tenant's data, and then extracts the role from the
 * tenant's membership data.
 *
 * @returns {string | null} The role of the current tenant if available, or `null` otherwise.
 *
 */
export const useCurrentTenantRole = () => {
  const currentTenant = useCurrentTenant();
  const membership = currentTenant?.data?.membership;
  if (!membership?.invitationAccepted) return null;
  return membership?.role ?? null;
};
