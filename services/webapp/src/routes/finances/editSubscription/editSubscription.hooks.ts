import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAsyncDispatch } from '../../../shared/utils/reduxSagaPromise';
import { selectAvailableSubscriptionPlans } from '../../../modules/subscription/subscription.selectors';
import { subscriptionActions } from '../../../modules/subscription';

export const useAvailableSubscriptionPlans = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAsyncDispatch();
  const plans = useSelector(selectAvailableSubscriptionPlans);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await dispatch(subscriptionActions.fetchAvailableSubscriptionPlans());
      setIsLoading(false);
    })();
  }, [dispatch]);

  return { isLoading, plans };
};
