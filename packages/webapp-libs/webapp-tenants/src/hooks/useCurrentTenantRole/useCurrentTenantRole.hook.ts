import { useCurrentTenantMembership } from '../../hooks';

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
  const { currentMembership } = useCurrentTenantMembership();

  if (!currentMembership?.invitationAccepted) return null;
  return currentMembership?.role ?? null;
};
