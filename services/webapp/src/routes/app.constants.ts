import { appLocales } from '../i18n';

const mapRoutes = <T extends string>(object: Record<T, string>, fn: (value: string) => string): Record<T, string> =>
  Object.fromEntries(Object.entries<string>(object).map(([key, value]) => [key, fn(value)])) as Record<T, string>;

export const path = (p: string): string => `/:lang(${appLocales.join('|')})${p}`;

export const nestedPath = <T extends string>(root: string, nestedRoutes: Record<T, string>) => {
  const absoluteNestedUrls = mapRoutes(nestedRoutes, (value) => path(root + value));
  return {
    index: path(root),
    ...absoluteNestedUrls,
    getRelativeUrl: (route: T) => nestedRoutes[route],
  };
};

export const ROUTES = {
  home: path('/'),
  login: path('/auth/login'),
  signup: path('/auth/signup'),
  notFound: path('/404'),
  profile: path('/profile'),
  admin: path('/admin'),
  privacyPolicy: path('/privacy-policy'),
  termsAndConditions: path('/terms-and-conditions'),
  confirmEmail: path('/auth/confirm/:user?/:token?'),
  demoItems: path('/demo-items'),
  demoItem: path('/demo-items/:id'),
  passwordReset: nestedPath('/auth/reset-password', {
    confirm: '/confirm/:user?/:token?',
  }),
  crudDemoItem: nestedPath('/crud-demo-item', {
    list: '/',
    details: '/:id',
    edit: '/:id/edit',
    add: '/add',
  }),
  finances: nestedPath('/finances', {
    paymentConfirm: '/payment-confirm',
    history: '/history',
  }),
  subscriptions: nestedPath('/subscriptions', {
    changePlan: '/edit',
    paymentMethod: '/payment-method',
    cancel: '/cancel',
  }),
  //<-- INJECT ROUTE DEFINITION -->
};

export const NO_NAVIGATION_ROUTES = [
  ROUTES.login,
  ROUTES.signup,
  ROUTES.passwordReset.index,
  ROUTES.passwordReset.confirm,
  ROUTES.confirmEmail,
];
