import { map } from 'ramda';

export const getLocalePath = (p: string) => `/:lang/${p}`;

export const nestedPath = <T extends string>(root: string, nestedRoutes: Record<T, string>) => {
  const absoluteNestedUrls = map<Record<T, string>, Record<T, string>>((value) => root + '/' + value, nestedRoutes);
  const paths = {
    index: `${root}/*`,
    ...absoluteNestedUrls
  };
  return {
    ...paths,
    getRelativeUrl: (route: T) => nestedRoutes[route],
    getLocalePath: (route: T) => getLocalePath(paths[route]),
  };
};
