import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { selectStripeTransactionHistory } from '../../../../../modules/stripe/stripe.selectors';
import * as stripeActions from '../../../../../modules/stripe/stripe.actions';

export const useTransactionHistory = () => {
  const dispatch = useDispatch();
  const transactionsHistory = useSelector(selectStripeTransactionHistory);

  useEffect(() => {
    if (transactionsHistory.length === 0) {
      dispatch(stripeActions.fetchStripeTransactionHistory());
    }
  }, [dispatch, transactionsHistory]);

  return transactionsHistory;
};
