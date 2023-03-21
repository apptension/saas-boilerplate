import { nestedPath } from '@sb/webapp-core/utils';

export const RoutesConfig = {
  crudDemoItem: nestedPath('crud-demo-item', {
    list: '',
    details: ':id',
    edit: ':id/edit',
    add: 'add',
  }),
};
