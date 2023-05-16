import { map } from 'ramda';

export const getLocalePath = (p: string) => `/:lang/${p}`;

/**
 * Helper function to define typed nested route config
 *
 * @param root
 * @param nestedRoutes
 *
 * @example
 * In route config
 *
 * ```ts showLineNumbers
 * import { nestedPath } from '@sb/webapp-core/utils';
 *
 * export const RoutesConfig = {
 *   example: nestedPath('example', {
 *     list: '',
 *     details: ':id',
 *     edit: ':id/edit',
 *     add: 'add',
 *   }),
 * };
 * ```
 *
 * @example
 * When defining a route component
 *
 * ```tsx
 * import { Route } from 'react-router-dom';
 *
 * <Route path={RoutesConfig.example.edit} element={<CrudDemoItemEdit />} />
 * ```
 *
 * @example
 * When creating a link
 *
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
 */
export const nestedPath = <T extends string>(root: string, nestedRoutes: Record<T, string>) => {
  const absoluteNestedUrls = map<Record<T, string>, Record<T, string>>((value) => root + '/' + value, nestedRoutes);
  const paths = {
    index: `${root}/*`,
    ...absoluteNestedUrls,
  };

  return {
    ...paths,
    getRelativeUrl: (route: T) => nestedRoutes[route],
    getLocalePath: (route: T) => getLocalePath(paths[route]),
  };
};
