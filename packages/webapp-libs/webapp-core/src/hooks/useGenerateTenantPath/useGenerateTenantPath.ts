import { useCurrentTenant } from '@sb/webapp-api-client/providers/currentTenant/currentTenant.hook';
import { useCallback } from 'react';
import { generatePath } from 'react-router-dom';

import { useGenerateLocalePath } from '../../hooks';
import { getTenantPath } from '../../utils/path';

/**
 * A hook that returns a function you can use to generate a path that includes proper tenant and locale code.
 * Underneath, it uses `useGenerateLocalePath` hook
 *
 * @example
 * ```tsx showLineNumbers
 * import { useGenerateTenantPath } from '@sb/webapp-core/hooks';
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
