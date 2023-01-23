import { Story } from '@storybook/react';
import { useFragment, useLazyLoadQuery } from 'react-relay';
import {
  fillSubscriptionScheduleQueryWithPhases,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../../../mocks/factories';
import SubscriptionActivePlanDetailsQueryGraphql, {
  subscriptionActivePlanDetailsQuery,
} from '../../../../../modules/subscription/__generated__/subscriptionActivePlanDetailsQuery.graphql';
import SubscriptionActiveSubscriptionFragmentGraphql, {
  subscriptionActiveSubscriptionFragment$key,
} from '../../../../../modules/subscription/__generated__/subscriptionActiveSubscriptionFragment.graphql';
import { withRelay } from '../../../../utils/storybook';
import { SubscriptionPlanName } from '../../../../services/api/subscription/types';
import { StripePaymentMethodInfo, StripePaymentMethodInfoProps } from './stripePaymentMethodInfo.component';

const Template: Story<StripePaymentMethodInfoProps> = (args: StripePaymentMethodInfoProps) => {
  const data = useLazyLoadQuery<subscriptionActivePlanDetailsQuery>(SubscriptionActivePlanDetailsQueryGraphql, {});
  const subscription = useFragment<subscriptionActiveSubscriptionFragment$key>(
    SubscriptionActiveSubscriptionFragmentGraphql,
    data.activeSubscription
  );
  return <StripePaymentMethodInfo method={subscription?.defaultPaymentMethod ?? null} />;
};

export default {
  title: 'Shared/Finances/Stripe/StripePaymentMethodInfo',
  component: StripePaymentMethodInfo,
  decorators: [
    withRelay((env) => {
      fillSubscriptionScheduleQueryWithPhases(env, [
        subscriptionPhaseFactory({
          item: { price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }) },
        }),
      ]);
    }),
  ],
};

export const Default = Template.bind({});
