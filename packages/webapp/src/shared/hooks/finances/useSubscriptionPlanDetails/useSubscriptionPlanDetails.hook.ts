import { useIntl } from 'react-intl';
import { useEffect } from 'react';
import { times } from 'ramda';
import { useQueryLoader } from 'react-relay';

import { SubscriptionPlan, SubscriptionPlanName } from '../../../services/api/subscription/types';
import { subscriptionPlanItemFragment$data } from '../../../../modules/subscription/__generated__/subscriptionPlanItemFragment.graphql';
import subscriptionActivePlanDetailsQueryGraphql, {
  subscriptionActivePlanDetailsQuery,
} from '../../../../modules/subscription/__generated__/subscriptionActivePlanDetailsQuery.graphql';

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

export const useActiveSubscriptionQueryLoader = ({ forceRefetch } = { forceRefetch: false }) => {
  const [activeSubscriptionQueryRef, loadActiveSubscription] = useQueryLoader<subscriptionActivePlanDetailsQuery>(
    subscriptionActivePlanDetailsQueryGraphql
  );

  useEffect(() => {
    loadActiveSubscription({}, { fetchPolicy: forceRefetch ? 'store-or-network' : 'store-and-network' });
  }, [loadActiveSubscription, forceRefetch]);

  return activeSubscriptionQueryRef;
};
