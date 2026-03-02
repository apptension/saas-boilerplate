import { SubscriptionPlan } from '../../subscription/types';
import { StripeBillingDetails, StripePaymentMethod } from '../paymentMethod';

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
  paymentMethod: StripePaymentMethod;
  amount: number;
  invoice: TransactionHistoryEntryInvoice | null;
}
