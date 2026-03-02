import { useQuery } from '@apollo/client/react';
import { useMemo } from 'react';

import { useCurrentTenant } from '../../providers';
import { currentUserPermissionsQuery } from '../../routes/tenantSettings/tenantRoles/tenantRoles.graphql';

/**
 * Hook to check if the current user has specific permissions in the current tenant.
 *
 * @param permissions - Single permission code or array of permission codes to check
 * @param options - Optional configuration
 * @returns Object with permission check results
 *
 * @example
 * // Check single permission
 * const { hasPermission, loading } = usePermissionCheck('dashboard.projects.edit');
 *
 * // Check multiple permissions (user needs at least one)
 * const { hasAnyPermission } = usePermissionCheck(['dashboard.projects.edit', 'dashboard.projects.view']);
 *
 * // Check if user has all permissions
 * const { hasAllPermissions } = usePermissionCheck(['dashboard.view', 'dashboard.projects.edit']);
 */
export const usePermissionCheck = (
  permissions: string | string[] = [],
  options?: {
    skip?: boolean;
  }
) => {
  const { data: currentTenant } = useCurrentTenant();
  const tenantId = currentTenant?.id ?? '';
  const permissionsArray = useMemo(
    () => (Array.isArray(permissions) ? permissions : [permissions]),
    [permissions]
  );

  const { data, loading, error, refetch } = useQuery(currentUserPermissionsQuery, {
    variables: { tenantId },
    skip: !tenantId || options?.skip,
    fetchPolicy: 'cache-first',
  });

  const userPermissions = useMemo(() => {
    const perms = (data?.currentUserPermissions || []).filter((p): p is string => p != null);
    return new Set(perms);
  }, [data?.currentUserPermissions]);

  const results = useMemo(() => {
    // Check if user has a specific permission (supports wildcard matching)
    const checkPermission = (permCode: string): boolean => {
      if (userPermissions.has(permCode)) {
        return true;
      }

      // Check for wildcard permissions in user's permissions
      for (const userPerm of userPermissions) {
        if (userPerm.endsWith('.*')) {
          const prefix = userPerm.slice(0, -2);
          if (permCode.startsWith(prefix + '.')) {
            return true;
          }
        }
      }

      return false;
    };

    // Check results for each requested permission
    const permissionResults = permissionsArray.map((perm) => ({
      code: perm,
      allowed: checkPermission(perm),
    }));

    // Single permission check
    const hasPermission = permissionsArray.length === 1 ? checkPermission(permissionsArray[0]) : false;

    // Any permission check (OR logic)
    const hasAnyPermission = permissionResults.some((r) => r.allowed);

    // All permissions check (AND logic)
    const hasAllPermissions = permissionResults.every((r) => r.allowed);

    return {
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      permissionResults,
      userPermissions: Array.from(userPermissions),
    };
  }, [userPermissions, permissionsArray]);

  return {
    ...results,
    loading,
    error,
    refetch,
  };
};

/**
 * Type-safe permission codes for auto-completion.
 * These correspond to the permission codes defined in the backend.
 */
export type PermissionCode =
  // Organization
  | 'org.settings.view'
  | 'org.settings.edit'
  | 'org.delete'
  | 'org.roles.view'
  | 'org.roles.manage'
  // Members
  | 'members.view'
  | 'members.invite'
  | 'members.roles.edit'
  | 'members.remove'
  // Security
  | 'security.view'
  | 'security.sso.manage'
  | 'security.passkeys.manage'
  | 'security.logs.view'
  | 'security.logs.export'
  // Billing
  | 'billing.view'
  | 'billing.manage'
  // Features
  | 'features.ai.use'
  | 'features.documents.view'
  | 'features.documents.manage'
  | 'features.content.view'
  | 'features.crud.view'
  | 'features.crud.manage'
  // Dashboard (main app)
  | 'dashboard.view'
  // Management Dashboard
  | 'management.view'
  | 'management.analytics.view'
  | 'management.clients.view'
  | 'management.clients.edit'
  | 'management.projects.view'
  | 'management.projects.edit'
  | 'management.people.view'
  | 'management.people.edit'
  | 'management.people.rates.view'
  | 'management.people.rates.edit'
  | 'management.financial.view'
  | 'management.financial.edit'
  | 'management.timesheets.view'
  | 'management.timesheets.edit'
  | 'management.invoices.view'
  | 'management.invoices.edit'
  | 'management.invoices.request'
  | 'management.invoices.review'
  | 'management.pipeline.view'
  | 'management.pipeline.edit'
  | 'management.imports.view'
  | 'management.imports.execute'
  | 'management.settings.view'
  | 'management.settings.edit'
  | 'management.fxrates.view'
  | 'management.fxrates.edit'
  | 'management.roles.view'
  | 'management.roles.edit'
  // Backup
  | 'backup.view'
  | 'backup.manage'
  // Wildcards
  | 'org.*'
  | 'members.*'
  | 'security.*'
  | 'billing.*'
  | 'features.*'
  | 'dashboard.*'
  | 'management.*'
  | 'backup.*';
