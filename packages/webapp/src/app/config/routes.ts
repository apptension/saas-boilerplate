import { RoutesConfig as ContentfulRoutesConfig } from '@sb/webapp-contentful/config/routes';
import { RoutesConfig as CoreRoutesConfig } from '@sb/webapp-core/config/routes';
import { getLocalePath } from '@sb/webapp-core/utils/path';
import { RoutesConfig as CrudDemoRoutesConfig } from '@sb/webapp-crud-demo/config/routes';
import { RoutesConfig as FinancesRoutesConfig } from '@sb/webapp-finances/config/routes';
import { Path, path } from 'ramda';

export const LANG_PREFIX = `/:lang?/*`;

const routes = {
  ...CoreRoutesConfig,
  documents: 'documents',
  ...ContentfulRoutesConfig,
  ...CrudDemoRoutesConfig,
  ...FinancesRoutesConfig,
  //<-- INJECT ROUTE DEFINITION -->
};

export const RoutesConfig = {
  ...routes,
  getLocalePath: (routeKey: Path) => {
    const value = path<string>(routeKey, routes) || '';
    return getLocalePath(value);
  },
};

export const NO_NAVIGATION_ROUTES = [
  ['login'],
  ['logout'],
  ['signup'],
  ['validateOtp'],
  ['passwordReset', 'index'],
  ['passwordReset', 'confirm'],
  ['confirmEmail'],
].map(RoutesConfig.getLocalePath);
