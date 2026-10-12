import { is, map } from 'ramda';

export const getLocalePath = (p: string) => `/:lang/${p}`;
export const getTenantPath = (p: string) => `/:tenantId/${p}`;

const removeInitialSlash = (str: string): string => (str.startsWith('/') ? str.slice(1) : str);

const assignLocalePathFn =
  <T>(fn: (p: string) => string, paths: Partial<T>) =>
  (route: keyof T) => {
    if (typeof paths[route] !== 'string') {
      throw Error('Invalid route');
    }
    return fn(paths[route] as string);
  };

export const getTenantPathHelper = (p: string) => getLocalePath(removeInitialSlash(getTenantPath(p)));

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
 *
 * @example
 * When mounting a nested route group as a parent route
 *
 * Use `getMountPath()` to get the segment with a wildcard suffix (e.g. `'example/*'`),
 * suitable for use as the `path` prop on a parent `<Route>` whose element renders
 * its own nested `<Routes>` tree. Use `getRelativeUrl(key)` for leaf routes that
 * map directly to a component without further child routes.
 *
 * ```tsx showLineNumbers
 * import { Route, Routes } from 'react-router-dom';
 *
 * <Routes>
 *   <Route path={RoutesConfig.example.getMountPath()} element={<Example />} />
 *   <Route path={RoutesConfig.crudDemoItem.getRelativeUrl('details')} element={<Details />} />
 * </Routes>
 * ```
 */
export const nestedPath = <T extends object>(root: string, nestedRoutes: T) => {
  const absoluteUrlsMapper = (value: any) => {
    if (is(Object, value)) {
      return mapRoot(root, value);
    } else {
      return root + '/' + value;
    }
  };

  const absoluteNestedUrls = map<T, T>(absoluteUrlsMapper, nestedRoutes);
  const paths = {
    index: `${root}/*`,
    ...absoluteNestedUrls,
  };

  return {
    ...paths,
    getRelativeUrl: <K extends keyof T>(route: K): T[K] => nestedRoutes[route],
    getLocalePath: assignLocalePathFn<T>(getLocalePath, paths),
    getTenantPath: assignLocalePathFn<T>(getTenantPathHelper, paths),
    getMountPath: () => `${root}/*`,
  };
};

const mapRoot = <N>(root: string, obj: N): N => {
  const override: Partial<N> = {};
  for (const key in obj) {
    const value = obj[key];
    if (typeof value === 'string') {
      override[key] = (root + '/' + value) as N[Extract<keyof N, string>];
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      override[key] = mapRoot(root, value) as N[Extract<keyof N, string>];
    }
  }
  return {
    ...obj,
    ...override,
    getLocalePath: assignLocalePathFn<N>(getLocalePath, override),
    getTenantPath: assignLocalePathFn<N>(getTenantPathHelper, override),
  };
};
