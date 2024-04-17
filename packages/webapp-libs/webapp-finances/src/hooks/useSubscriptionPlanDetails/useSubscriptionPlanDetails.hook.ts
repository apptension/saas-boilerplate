import { useQuery } from '@apollo/client';
import { ResultOf } from '@graphql-typed-document-node/core';
import { SubscriptionPlanName } from '@sb/webapp-api-client/api/subscription/types';
import { useCurrentTenant } from '@sb/webapp-tenants/providers';
import { times } from 'ramda';
import { useIntl } from 'react-intl';

import { ActiveSubscriptionDetailsContextType } from '../../components/activeSubscriptionContext';
import { stripeSubscriptionQuery } from '../../components/stripe';
import { SUBSRIPTION_PRICE_ITEM_FRAGMENT } from '../../routes/editSubscription/subscriptionPlans';

export const useSubscriptionPlanDisplayName = (productName: SubscriptionPlanName) => {
  const intl = useIntl();

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

  return planDisplayNames[productName] ?? '';
};

export const useSubscriptionPlanDetails = (plan?: ResultOf<typeof SUBSRIPTION_PRICE_ITEM_FRAGMENT>) => {
  const intl = useIntl();

  const examplePlanFeatureItem = intl.formatMessage({
    id: 'Subscription plan example feature / Free',
    defaultMessage: 'Lorem ipsum dolor sit amet',
  });

  const planDisplayName = useSubscriptionPlanDisplayName(plan?.product?.name as SubscriptionPlanName);

  const planFeaturesList: Record<SubscriptionPlanName, Array<string>> = {
    [SubscriptionPlanName.FREE]: times(() => examplePlanFeatureItem, 5),
    [SubscriptionPlanName.MONTHLY]: times(() => examplePlanFeatureItem, 5),
    [SubscriptionPlanName.YEARLY]: times(() => examplePlanFeatureItem, 5),
  };

  return plan
    ? {
        name: planDisplayName,
        features: planFeaturesList[plan.product?.name as SubscriptionPlanName],
        price: (plan.unitAmount ?? 0) / 100,
        isFree: plan.product.name === SubscriptionPlanName.FREE,
      }
    : {};
};

export const useActiveSubscriptionQueryLoader = (): ActiveSubscriptionDetailsContextType => {
  const { data: currentTenant } = useCurrentTenant();

  const { data } = useQuery(stripeSubscriptionQuery, {
    nextFetchPolicy: 'cache-and-network',
    variables: {
      tenantId: currentTenant?.id ?? '',
    },
    skip: !currentTenant?.id,
  });

  return {
    allPaymentMethods: data?.allPaymentMethods,
    activeSubscription: data?.activeSubscription,
  };
};
