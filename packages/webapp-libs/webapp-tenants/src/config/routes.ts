import { nestedPath } from '@sb/webapp-core/utils';

export const RoutesConfig = {
  home: '/',
  tenant: nestedPath('tenant', {
    settings: nestedPath('settings', {
      members: 'members',
      general: 'general',
      security: 'security',
      activityLogs: 'activity-logs',
      roles: 'roles',
    }),
    accessDenied: 'access-denied',
  }),
};
