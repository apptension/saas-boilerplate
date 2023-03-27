import { asyncComponent } from '@sb/webapp-core/utils/asyncComponent';

export const PaymentConfirm = asyncComponent(() => import('./paymentConfirm'));
export const Subscriptions = asyncComponent(() => import('./subscriptions'));
export const EditSubscription = asyncComponent(() => import('./editSubscription'));
export const EditPaymentMethod = asyncComponent(() => import('./editPaymentMethod'));
export const CancelSubscription = asyncComponent(() => import('./cancelSubscription'));
export const TransactionHistory = asyncComponent(() => import('./transactionHistory'));
