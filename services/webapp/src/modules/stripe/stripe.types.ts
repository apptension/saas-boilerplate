import { TransactionHistoryEntry } from '../../shared/services/api/stripe/history/types';

export interface StripeState {
  transactionHistory: TransactionHistoryEntry[];
}
