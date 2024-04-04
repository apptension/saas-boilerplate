import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { getTenantPath } from '@sb/webapp-core/utils/path';
import { useCallback } from 'react';
import { generatePath } from 'react-router-dom';

import { useCurrentTenant } from '../../providers/currentTenantProvider/currentTenantProvider.hook';

/**
 * A hook that returns a function you can use to generate a path that includes proper tenant and locale code.
 * Underneath, it uses `useGenerateLocalePath` hook
 *
 * @example
 * ```tsx showLineNumbers
 * import { useGenerateTenantPath } from '@sb/webapp-tenants/hooks';
 * import { Link } from 'react-router-dom';
 *
 * const Example = () => {
 *     const generateTenantPath = useGenerateTenantPath();
 *
 *     return (
 *       <Link to={generateTenantPath(RoutesConfig.example.edit, { id: 'item-id' })}>
 *         Press me
 *       </Link>
 *     )
 * }
 * ```
 *
 */
export const useGenerateTenantPath = () => {
  const generateLocalePath = useGenerateLocalePath();
  const currentTenant = useCurrentTenant();

  const tenantId = currentTenant.data?.id ?? '';

  return useCallback(
    (path: string, params: Record<string, string | number> = {}) =>
      generatePath(generateLocalePath('') + getTenantPath(path), { tenantId, ...params }),
    [tenantId]
  );
};

export type GenerateTenantPath = ReturnType<typeof useGenerateTenantPath>;
