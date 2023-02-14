import { useQuery } from '@apollo/client';
import { Story } from '@storybook/react';
import { append } from 'ramda';

import {
  fillSubscriptionScheduleQueryWithPhases,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../../../mocks/factories';
import { SubscriptionPlanName } from '../../../../services/api/subscription/types';
import { mapConnection } from '../../../../utils/graphql';
import { withProviders } from '../../../../utils/storybook';
import { STRIPE_SUBSCRIPTION_QUERY } from '../stripePaymentMethodSelector/stripePaymentMethodSelector.graphql';
import { StripePaymentMethodInfo, StripePaymentMethodInfoProps } from './stripePaymentMethodInfo.component';

const Template: Story<StripePaymentMethodInfoProps> = (args: StripePaymentMethodInfoProps) => {
  const { data } = useQuery(STRIPE_SUBSCRIPTION_QUERY, { nextFetchPolicy: 'cache-and-network' });

  const paymentMethods = mapConnection((plan) => plan, data?.allPaymentMethods);
  const firstPaymentMethod = paymentMethods?.[0];

  return <StripePaymentMethodInfo method={firstPaymentMethod} />;
};

export default {
  title: 'Shared/Finances/Stripe/StripePaymentMethodInfo',
  component: StripePaymentMethodInfo,
  decorators: [
    withProviders({
      apolloMocks: append(
        fillSubscriptionScheduleQueryWithPhases(undefined, [
          subscriptionPhaseFactory({
            item: { price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }) },
          }),
        ])
      ),
    }),
  ],
};

export const Default = Template.bind({});
