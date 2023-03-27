import { nestedPath } from '@sb/webapp-core/utils';

export const RoutesConfig = {
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
};
