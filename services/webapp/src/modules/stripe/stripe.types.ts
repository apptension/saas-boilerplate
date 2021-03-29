import { StripePaymentMethod } from '../../shared/services/api/stripe/paymentMethod';
import { TransactionHistoryEntry } from '../../shared/services/api/stripe/history/types';

export interface StripeState {
  paymentMethods: StripePaymentMethod[];
  transactionHistory: TransactionHistoryEntry[];
}

export type FetchStripePaymentMethodsSuccessPayload = StripePaymentMethod[];
