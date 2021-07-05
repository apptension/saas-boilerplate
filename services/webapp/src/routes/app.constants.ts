import { nestedPath, path } from '../shared/utils/path';

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
  documents: path('/documents'),
  //<-- INJECT ROUTE DEFINITION -->
};

export const NO_NAVIGATION_ROUTES = [
  ROUTES.login,
  ROUTES.signup,
  ROUTES.passwordReset.index,
  ROUTES.passwordReset.confirm,
  ROUTES.confirmEmail,
];
