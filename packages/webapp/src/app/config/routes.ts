import { path, Path } from 'ramda';
import { getLocalePath, nestedPath } from '../../shared/utils/path';

export const LANG_PREFIX = `/:lang/*`;

const routes = {
  home: '',
  login: 'auth/login',
  logout: 'auth/logout',
  signup: 'auth/signup',
  notFound: '404',
  profile: 'profile',
  admin: 'admin',
  privacyPolicy: 'privacy-policy',
  termsAndConditions: 'terms-and-conditions',
  confirmEmail: 'auth/confirm/:user/:token',
  demoItems: 'demo-items',
  demoItem: 'demo-items/:id',
  passwordReset: nestedPath('auth/reset-password', {
    confirm: 'confirm/:user/:token',
  }),
  crudDemoItem: nestedPath('crud-demo-item', {
    list: '',
    details: ':id',
    edit: ':id/edit',
    add: 'add',
  }),
  finances: nestedPath('finances', {
    paymentConfirm: 'payment-confirm',
    history: 'history',
  }),
  subscriptions: nestedPath('subscriptions', {
    changePlan: 'edit',
    paymentMethod: 'payment-method',
    cancel: 'cancel',
  }),
  documents: 'documents',
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
  ['passwordReset', 'index'],
  ['passwordReset', 'confirm'],
  ['confirmEmail'],
].map(RoutesConfig.getLocalePath);
