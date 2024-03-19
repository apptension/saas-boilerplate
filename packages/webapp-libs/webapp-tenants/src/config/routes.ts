import { nestedPath } from '@sb/webapp-core/utils';

export const RoutesConfig = {
  tenant: nestedPath('tenant', {
    edit: 'edit',
  }),
};
