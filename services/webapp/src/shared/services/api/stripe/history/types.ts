import { StripePaymentMethod } from '../paymentMethod';

export interface TransactionHistoryEntry {
  id: string;
  date: string;
  paymentMethod: StripePaymentMethod;
  amount: number;
}

export type HistoryListApiResponseData = TransactionHistoryEntry[];
