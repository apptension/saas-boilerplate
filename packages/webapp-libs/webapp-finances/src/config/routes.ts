import { nestedPath } from '@sb/webapp-core/utils';

export const RoutesConfig = {
  currentSubscriptions: nestedPath('subscriptions/current-subscription', {
    edit: 'edit',
    cancel: 'cancel',
  }),
  paymentMethods: nestedPath('subscriptions/payment-methods', {
    edit: 'edit',
  }),
  transactionHistory: nestedPath('subscriptions/transaction-history', {
    paymentConfirm: 'payment-confirm',
    history: 'history',
  }),
};
