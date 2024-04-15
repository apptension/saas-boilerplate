import { useCurrentTenant } from '../../providers';

export const useCurrentTenantRole = () => {
  const currentTenant = useCurrentTenant();
  const membership = currentTenant?.data?.membership;
  if (!membership?.invitationAccepted) return null;
  return membership?.role ?? null;
};
