import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { times } from 'ramda';
import { SubscriptionPlan, SubscriptionPlanName } from '../../../services/api/subscription/types';
import { selectActiveSubscriptionPlan } from '../../../../modules/subscription/subscription.selectors';
import { subscriptionActions } from '../../../../modules/subscription';

export const useSubscriptionPlanDetails = (plan?: SubscriptionPlan) => {
  const intl = useIntl();

  const examplePlanFeatureItem = intl.formatMessage({
    description: 'Subscription plan example feature / Free',
    defaultMessage: 'Lorem ipsum dolor sit amet',
  });

  const planDisplayNames: Record<SubscriptionPlanName, string> = {
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

  const planFeaturesList: Record<SubscriptionPlanName, Array<string>> = {
    [SubscriptionPlanName.FREE]: times(() => examplePlanFeatureItem, 5),
    [SubscriptionPlanName.MONTHLY]: times(() => examplePlanFeatureItem, 5),
    [SubscriptionPlanName.YEARLY]: times(() => examplePlanFeatureItem, 5),
  };

  return plan
    ? {
        name: planDisplayNames[plan.product.name],
        features: planFeaturesList[plan.product.name],
        price: plan.unitAmount / 100,
        isFree: plan.product.name === SubscriptionPlanName.FREE,
      }
    : {};
};

export const useActiveSubscriptionPlanDetails = ({ forceRefetch } = { forceRefetch: true }) => {
  const dispatch = useDispatch();
  const activeSubscriptionPlan = useSelector(selectActiveSubscriptionPlan);
  const [initialActiveSubscriptionPlan] = useState(activeSubscriptionPlan);

  useEffect(() => {
    if (!initialActiveSubscriptionPlan || forceRefetch) {
      dispatch(subscriptionActions.fetchActiveSubscription());
    }
  }, [initialActiveSubscriptionPlan, dispatch, forceRefetch]);

  return {
    ...useSubscriptionPlanDetails(activeSubscriptionPlan),
    isLoading: !activeSubscriptionPlan,
  };
};
