import { RoutesConfig as ContentfulRoutesConfig } from '@sb/webapp-contentful/config/routes';
import { RoutesConfig as CrudDemoRoutesConfig } from '@sb/webapp-crud-demo/config/routes';
import { getLocalePath, nestedPath } from '@sb/webapp-core/utils/path';
import { Path, path } from 'ramda';

export const LANG_PREFIX = `/:lang/*`;

const routes = {
  home: '',
  login: 'auth/login',
  logout: 'auth/logout',
  signup: 'auth/signup',
  validateOtp: 'auth/validate-otp',
  notFound: '404',
  profile: 'profile',
  admin: 'admin',
  confirmEmail: 'auth/confirm/:user/:token',
  passwordReset: nestedPath('auth/reset-password', {
    confirm: 'confirm/:user/:token',
  }),
  finances: nestedPath('finances', {
    paymentConfirm: 'payment-confirm',
    history: 'history',
  }),
  subscriptions: nestedPath('subscriptions', {
    changePlan: 'edit',
    paymentMethod: 'payment-method',
    cancel: 'cancel',
    list: '',
  }),
  documents: 'documents',
  ...ContentfulRoutesConfig,
  ...CrudDemoRoutesConfig,
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
