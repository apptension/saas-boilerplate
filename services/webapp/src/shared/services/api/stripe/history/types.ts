import { StripeBillingDetails, StripePaymentMethod } from '../paymentMethod';
import { SubscriptionPlan } from '../../subscription/types';

export interface TransactionHistoryEntryInvoice {
  id: string;
  items: {
    id: string;
    price: SubscriptionPlan;
  }[];
}

export interface TransactionHistoryEntry {
  id: string;
  created: string;
  billingDetails: StripeBillingDetails;
  paymentMethodDetails: StripePaymentMethod;
  amount: number;
  invoice: TransactionHistoryEntryInvoice | null;
}

export type HistoryListApiResponseData = TransactionHistoryEntry[];
