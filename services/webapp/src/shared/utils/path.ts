import { map } from 'ramda';
import { appLocales } from '../../i18n';

export const path = (p: string) => `/:lang(${appLocales.join('|')})${p}`;

export const nestedPath = <T extends string>(root: string, nestedRoutes: Record<T, string>) => {
  const absoluteNestedUrls = map<Record<T, string>, Record<T, string>>((value) => path(root + value), nestedRoutes);
  return {
    index: path(root),
    ...absoluteNestedUrls,
    getRelativeUrl: (route: T) => nestedRoutes[route],
  };
};
