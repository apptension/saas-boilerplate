import { useQuery } from '@apollo/client';
import { times } from 'ramda';
import { useIntl } from 'react-intl';

import { ActiveSubscriptionDetailsContextType } from '../../activeSubscriptionContext/activeSubscriptionContext.hooks';
import { stripeSubscriptionQuery } from '../../../../shared/components/finances/stripe/stripePaymentMethodSelector/stripePaymentMethodSelector.graphql';
import { SubscriptionPlan, SubscriptionPlanName } from '../../../../shared/services/api/subscription/types';
import { SubscriptionPlanItemFragmentFragment } from '../../../../shared/services/graphqlApi/__generated/gql/graphql';

export const useSubscriptionPlanDetails = (plan?: SubscriptionPlanItemFragmentFragment | SubscriptionPlan) => {
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

export const useActiveSubscriptionQueryLoader = (): ActiveSubscriptionDetailsContextType => {
  const { data } = useQuery(stripeSubscriptionQuery, { nextFetchPolicy: 'cache-and-network' });

  return { allPaymentMethods: data?.allPaymentMethods, activeSubscription: data?.activeSubscription };
};
