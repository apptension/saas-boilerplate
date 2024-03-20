import { nestedPath } from '@sb/webapp-core/utils';

export const RoutesConfig = {
  tenant: nestedPath('tenant', {
    settings: nestedPath('settings', {
      members: 'members',
      general: 'general',
    }),
  }),
};
