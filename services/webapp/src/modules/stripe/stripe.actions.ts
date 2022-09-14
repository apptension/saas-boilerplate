import { HistoryListApiResponseData } from '../../shared/services/api/stripe/history/types';
import { createActionRoutine } from '../../shared/utils/reduxSagaPromise';

export const fetchStripeTransactionHistory = createActionRoutine<void, HistoryListApiResponseData, unknown>(
  'FETCH_STRIPE_TRANSACTION_HISTORY'
);
