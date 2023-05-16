import { useCallback } from 'react';
import { generatePath } from 'react-router-dom';

import { getLocalePath } from '../../utils/path';
import { useLocale } from '../useLocale';


/**
 * A hook that returns a function you can use to generate a path that includes proper locale code. Underneath, it uses
 * [`generatePath`](https://reactrouter.com/en/main/utils/generate-path#generatepath) function exported by
 * `react-router-dom`.
 *
 * @example
 * ```tsx showLineNumbers
 * import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
 * import { Link } from 'react-router-dom';
 *
 * const Example = () => {
 *     const generateLocalePath = useGenerateLocalePath();
 *
 *     return (
 *       <Link to={generateLocalePath(RoutesConfig.example.edit, { id: 'item-id' })}>
 *         Press me
 *       </Link>
 *     )
 * }
 * ```
 *
 */
export const useGenerateLocalePath = () => {
  const lang = useLocale();

  return useCallback(
    (path: string, params: Record<string, string | number> = {}) =>
      generatePath(getLocalePath(path), { ...params, lang }),
    [lang]
  );
};

export type GenerateLocalePath = ReturnType<typeof useGenerateLocalePath>;
