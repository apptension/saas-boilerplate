import { useQuery } from '@apollo/client';
import { SubscriptionPlanName } from '@sb/webapp-api-client/api/subscription/types';
import { subscriptionPhaseFactory, subscriptionPlanFactory } from '@sb/webapp-api-client/tests/factories';
import { mapConnection } from '@sb/webapp-core/utils/graphql';
import { Meta, StoryFn, StoryObj } from '@storybook/react';
import { append } from 'ramda';

import { fillSubscriptionScheduleQueryWithPhases } from '../../../tests/factories';
import { withProviders } from '../../../utils/storybook';
import { stripeSubscriptionQuery } from '../stripePaymentMethodSelector';
import { StripePaymentMethodInfo, StripePaymentMethodInfoProps } from './stripePaymentMethodInfo.component';

const Template: StoryFn<StripePaymentMethodInfoProps> = (args: StripePaymentMethodInfoProps) => {
  const { data } = useQuery(stripeSubscriptionQuery, {
    nextFetchPolicy: 'cache-and-network',
    variables: { tenantId: 'tenantId' },
  });

  const paymentMethods = mapConnection((plan) => plan, data?.allPaymentMethods);
  const firstPaymentMethod = paymentMethods?.[0];

  return <StripePaymentMethodInfo method={firstPaymentMethod} />;
};

const meta: Meta<typeof StripePaymentMethodInfo> = {
  title: 'Finances/StripePaymentMethodInfo',
  component: StripePaymentMethodInfo,
  decorators: [
    withProviders({
      apolloMocks: append(
        fillSubscriptionScheduleQueryWithPhases([
          subscriptionPhaseFactory({
            item: {
              price: subscriptionPlanFactory({
                product: { name: SubscriptionPlanName.FREE },
              }),
            },
          }),
        ])
      ),
    }),
  ],
};

export default meta;

export const Default: StoryObj<typeof meta> = {
  render: Template,
};
