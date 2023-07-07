import { nestedPath } from '@sb/webapp-core/utils';

export const RoutesConfig = {
  subscriptions: nestedPath('subscriptions', {
    currentSubscription: nestedPath('current-subscription', {
      edit: 'edit',
      cancel: 'cancel',
    }),
    paymentMethods: nestedPath('payment-methods', {
      edit: 'edit',
    }),
    transactionHistory: nestedPath('transaction-history', {
      paymentConfirm: 'payment-confirm',
      history: 'history',
    }),
  }),
};
