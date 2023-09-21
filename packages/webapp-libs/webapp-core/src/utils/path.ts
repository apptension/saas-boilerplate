import { mapObjIndexed } from 'ramda';

export const getLocalePath = (p: string) => `/:lang/${p}`;

type ExtractKeysWithStringValue<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

type NestedPath<
  T,
  Keys extends keyof T = keyof T,
  KeysWithStringValues = ExtractKeysWithStringValue<T>,
> = T extends string
  ? string
  : {
      [P in Keys]: NestedPath<T[P]>;
    } & {
      index: string;
      getRelativeUrl: (route: KeysWithStringValues) => string;
    };

type NestedPathInput = {
  [key: string]: string | NestedPathInput;
} & {
  index?: string;
};

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
export const nestedPath = <T extends NestedPathInput>(root: string, nestedRoutes: T): NestedPath<T> => {
  const paths = mapObjIndexed((value, key) => {
    if (typeof value === 'undefined') {
      return null;
    }
    if (typeof value === 'string') {
      return `${root}/${value}`;
    }
    return nestedPath(root, value);
  }, nestedRoutes);

  return {
    index: `${root}/`,
    ...paths,
    getRelativeUrl: (key) => {
      if (nestedRoutes.index) {
        return nestedRoutes[key].toString().replace(new RegExp(`^${nestedRoutes.index}`), '');
      }
      return nestedRoutes[key];
    },
  } as NestedPath<T>;
};
