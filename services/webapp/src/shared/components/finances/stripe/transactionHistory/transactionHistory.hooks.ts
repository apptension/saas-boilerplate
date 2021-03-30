import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { selectStripeTransactionHistory } from '../../../../../modules/stripe/stripe.selectors';
import * as stripeActions from '../../../../../modules/stripe/stripe.actions';

export const useTransactionHistory = () => {
  const [isFetched, setIsFetched] = useState(false);
  const dispatch = useDispatch();
  const transactionsHistory = useSelector(selectStripeTransactionHistory);

  useEffect(() => {
    if (transactionsHistory.length === 0 && !isFetched) {
      dispatch(stripeActions.fetchStripeTransactionHistory());
      setIsFetched(true);
    }
  }, [dispatch, isFetched, transactionsHistory]);

  return transactionsHistory;
};
