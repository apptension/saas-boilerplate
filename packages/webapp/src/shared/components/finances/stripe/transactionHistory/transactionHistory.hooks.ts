import { useEffect } from 'react';
import { useQueryLoader } from 'react-relay';
import StripeAllChargesQueryGraphql, {
  stripeAllChargesQuery,
} from '../../../../../modules/stripe/__generated__/stripeAllChargesQuery.graphql';

export const useTransactionsHistoryQuery = () => {
  const [transactionsHistoryQueryRef, loadTransactionsHistoryQuery] =
    useQueryLoader<stripeAllChargesQuery>(StripeAllChargesQueryGraphql);

  useEffect(() => {
    loadTransactionsHistoryQuery({}, { fetchPolicy: 'store-and-network' });
  }, [loadTransactionsHistoryQuery]);

  return { transactionsHistoryQueryRef };
};
