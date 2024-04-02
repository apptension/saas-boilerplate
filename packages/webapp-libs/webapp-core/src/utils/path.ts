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
    getRelativeUrl: (route: keyof T) => nestedRoutes[route],
    getLocalePath: assignLocalePathFn<T>(getLocalePath, paths),
    getTenantPath: assignLocalePathFn<T>(getTenantPathHelper, paths),
  };
};

const mapRoot = <N>(root: string, obj: N): N => {
  const override: Partial<N> = {};
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      override[key] = (root + '/' + obj[key]) as N[Extract<keyof N, string>];
    }
  }
  return {
    ...obj,
    ...override,
    getLocalePath: assignLocalePathFn<N>(getLocalePath, override),
    getTenantPath: assignLocalePathFn<N>(getTenantPathHelper, override),
  };
};
