import { ReactNode } from 'react';

import { usePermissionCheck } from '../../hooks/usePermissionCheck';

export type PermissionGateProps = {
  /**
   * Single permission code or array of permission codes to check
   */
  permissions: string | string[];
  /**
   * How to combine multiple permissions:
   * - 'any' (default): User needs at least one of the permissions
   * - 'all': User needs all of the permissions
   */
  mode?: 'any' | 'all';
  /**
   * Content to render when the user has permission
   */
  children: ReactNode;
  /**
   * Optional content to render when the user doesn't have permission
   * If not provided, nothing is rendered when permission is denied
   */
  fallback?: ReactNode;
  /**
   * If true, renders children while loading (optimistic)
   * If false (default), renders nothing while loading
   */
  optimistic?: boolean;
};

/**
 * Component that conditionally renders content based on user permissions.
 *
 * @example
 * // Single permission check
 * <PermissionGate permissions="org.settings.edit">
 *   <Button>Edit Settings</Button>
 * </PermissionGate>
 *
 * @example
 * // Multiple permissions with fallback
 * <PermissionGate
 *   permissions={['dashboard.projects.edit', 'dashboard.projects.view']}
 *   mode="any"
 *   fallback={<p>You don't have access to this feature</p>}
 * >
 *   <ProjectEditor />
 * </PermissionGate>
 *
 * @example
 * // Require all permissions
 * <PermissionGate permissions={['billing.view', 'billing.manage']} mode="all">
 *   <BillingManager />
 * </PermissionGate>
 */
export const PermissionGate = ({
  permissions,
  mode = 'any',
  children,
  fallback = null,
  optimistic = false,
}: PermissionGateProps) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissionCheck(permissions);

  if (loading) {
    return optimistic ? <>{children}</> : null;
  }

  const permissionsArray = Array.isArray(permissions) ? permissions : [permissions];
  const hasAccess =
    permissionsArray.length === 1 ? hasPermission : mode === 'all' ? hasAllPermissions : hasAnyPermission;

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

/**
 * Hook wrapper that returns permission state for more complex use cases
 */
export { usePermissionCheck } from '../../hooks/usePermissionCheck';
