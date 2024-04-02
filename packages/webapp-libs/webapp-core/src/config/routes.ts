import { nestedPath } from '../utils';

export const RoutesConfig = {
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
  addTenant: 'add-tenant',
  tenantInvitation: 'tenant-invitation/:token',
};
