import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { times } from 'ramda';
import { SubscriptionPlan, SubscriptionPlanName } from '../../../services/api/subscription/types';
import { selectActiveSubscriptionPlan } from '../../../../modules/subscription/subscription.selectors';
import { subscriptionActions } from '../../../../modules/subscription';
import { subscriptionPlanItemFragment$data } from '../../../../modules/subscription/__generated__/subscriptionPlanItemFragment.graphql';

export const useSubscriptionPlanDetails = (plan?: subscriptionPlanItemFragment$data | SubscriptionPlan) => {
  const intl = useIntl();

  const examplePlanFeatureItem = intl.formatMessage({
    id: 'Subscription plan example feature / Free',
    defaultMessage: 'Lorem ipsum dolor sit amet',
  });

  const planDisplayNames: Record<SubscriptionPlanName, string> = {
    [SubscriptionPlanName.FREE]: intl.formatMessage({
      id: 'Subscription plan display name / Free',
      defaultMessage: 'Free',
    }),
    [SubscriptionPlanName.MONTHLY]: intl.formatMessage({
      id: 'Subscription plan display name / Monthly',
      defaultMessage: 'Monthly',
    }),
    [SubscriptionPlanName.YEARLY]: intl.formatMessage({
      id: 'Subscription plan display name / Yearly',
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
        name: planDisplayNames[plan.product.name as SubscriptionPlanName],
        features: planFeaturesList[plan.product.name as SubscriptionPlanName],
        price: (plan.unitAmount ?? 0) / 100,
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
