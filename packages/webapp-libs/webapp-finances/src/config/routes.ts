import { nestedPath } from '@sb/webapp-core/utils';

export const RoutesConfig = {
  finances: nestedPath('finances', {
    paymentConfirm: 'payment-confirm',
  }),
  subscriptions: nestedPath('subscriptions', {
    currentSubscription: nestedPath('current-subscription', {
      edit: 'edit',
      cancel: 'cancel',
    }),
    paymentMethods: nestedPath('payment-methods', {
      edit: 'edit',
    }),
    transactionHistory: nestedPath('transaction-history', {
      history: 'history',
    }),
  }),
};
