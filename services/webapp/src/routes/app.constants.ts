const mapRoutes = <T extends string>(object: Record<T, string>, fn: (value: string) => string): Record<T, string> =>
  Object.fromEntries(Object.entries<string>(object).map(([key, value]) => [key, fn(value)])) as Record<T, string>;

export const nestedRoute = <T extends string>(root: string, nestedRoutes: Record<T, string>) => {
  const absoluteNestedUrls = mapRoutes(nestedRoutes, (value) => root + value);
  return {
    index: root,
    ...absoluteNestedUrls,
    getRelativeUrl: (route: T) => nestedRoutes[route],
  };
};

export const ROUTES = {
  home: '/',
  login: '/auth/login',
  signup: '/auth/signup',
  notFound: '/404',
  profile: '/profile',
  admin: '/admin',
  privacyPolicy: '/privacy-policy',
  termsAndConditions: '/terms-and-conditions',
  confirmEmail: '/auth/confirm/:user?/:token?',
  demoItems: '/demo-items',
  demoItem: '/demo-items/:id',
  passwordReset: nestedRoute('/auth/reset-password', {
    confirm: '/confirm/:user?/:token?',
  }),
  crudDemoItem: nestedRoute('/crud-demo-item', {
    list: '/',
    details: '/:id',
    edit: '/edit/:id',
    add: '/add',
  }),
  //<-- INJECT ROUTE DEFINITION -->
};
