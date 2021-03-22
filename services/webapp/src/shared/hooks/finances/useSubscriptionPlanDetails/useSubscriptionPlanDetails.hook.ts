import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { SubscriptionPlan, SubscriptionPlanName } from '../../../services/api/subscription/types';
import { selectActiveSubscriptionPlan } from '../../../../modules/subscription/subscription.selectors';
import { subscriptionActions } from '../../../../modules/subscription';

export const useSubscriptionPlanDetails = (plan?: SubscriptionPlan) => {
  const intl = useIntl();

  const planDisplayNames = {
    [SubscriptionPlanName.FREE]: intl.formatMessage({
      description: 'Subscription plan display name / Free',
      defaultMessage: 'Free',
    }),
    [SubscriptionPlanName.MONTHLY]: intl.formatMessage({
      description: 'Subscription plan display name / Monthly',
      defaultMessage: 'Monthly',
    }),
    [SubscriptionPlanName.YEARLY]: intl.formatMessage({
      description: 'Subscription plan display name / Yearly',
      defaultMessage: 'Yearly',
    }),
  };

  return plan
    ? {
        name: planDisplayNames[plan.product.name],
        price: plan.unitAmount / 100,
        isFree: plan.product.name === SubscriptionPlanName.FREE,
      }
    : {};
};

export const useActiveSubscriptionPlanDetails = () => {
  const dispatch = useDispatch();
  const activeSubscriptionPlan = useSelector(selectActiveSubscriptionPlan);

  useEffect(() => {
    dispatch(subscriptionActions.fetchActiveSubscription());
  }, [dispatch]);

  return useSubscriptionPlanDetails(activeSubscriptionPlan);
};
