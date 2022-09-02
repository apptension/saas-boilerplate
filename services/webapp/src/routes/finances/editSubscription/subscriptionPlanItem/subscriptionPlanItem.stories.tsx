import { Story } from '@storybook/react';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { OperationDescriptor } from 'react-relay/hooks';
import { useLazyLoadQuery } from 'react-relay';

import { subscriptionFactory, subscriptionPhaseFactory, subscriptionPlanFactory } from '../../../../mocks/factories';
import { SubscriptionPlanName } from '../../../../shared/services/api/subscription/types';
import { withProviders } from '../../../../shared/utils/storybook';
import { prepareState } from '../../../../mocks/store';

import subscriptionPlansAllQueryGraphql, {
  subscriptionPlansAllQuery,
} from '../../../../modules/subscription/__generated__/subscriptionPlansAllQuery.graphql';
import { connectionFromArray, ProvidersWrapper } from '../../../../shared/utils/testUtils';
import { mapConnection } from '../../../../shared/utils/graphql';
import { SubscriptionPlanItem } from './subscriptionPlanItem.component';

type StoryProps = {
  name: string;
};

const Wrapper = () => {
  const data = useLazyLoadQuery<subscriptionPlansAllQuery>(subscriptionPlansAllQueryGraphql, {});

  return (
    <>
      {mapConnection(
        (plan) => (
          <SubscriptionPlanItem plan={plan} onSelect={console.log} />
        ),
        data.allSubscriptionPlans
      )}
    </>
  );
};

const Template: Story<StoryProps> = ({ name }: StoryProps) => {
  const relayEnvironment = createMockEnvironment();
  relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
    MockPayloadGenerator.generate(operation, {
      SubscriptionPlanConnection: () => connectionFromArray([{ name }]),
    })
  );
  relayEnvironment.mock.queuePendingOperation(subscriptionPlansAllQueryGraphql, {});

  return (
    <ProvidersWrapper
      context={{
        relayEnvironment,
      }}
    >
      <Wrapper />
    </ProvidersWrapper>
  );
};

const freePlan = subscriptionPlanFactory();
freePlan.product.name = SubscriptionPlanName.FREE;

const monthlyPlan = subscriptionPlanFactory();
monthlyPlan.product.name = SubscriptionPlanName.MONTHLY;

const storeWithFreePlan = prepareState((state) => {
  state.subscription.activeSubscription = subscriptionFactory({
    phases: [subscriptionPhaseFactory({ item: { price: freePlan } })],
  });
});

const storeWithMonthlyPlan = prepareState((state) => {
  state.subscription.activeSubscription = subscriptionFactory({
    phases: [subscriptionPhaseFactory({ item: { price: monthlyPlan } })],
  });
});

const storeWithTrialEligible = prepareState((state) => {
  state.subscription.activeSubscription = subscriptionFactory({ canActivateTrial: true });
});

export default {
  title: 'Shared/Subscriptions/SubscriptionPlanItem',
  component: SubscriptionPlanItem,
};

export const Free = Template.bind({});
Free.args = { name: SubscriptionPlanName.FREE };
Free.decorators = [withProviders({ store: storeWithMonthlyPlan })];

export const ActiveFree = Template.bind({});
ActiveFree.args = { name: SubscriptionPlanName.FREE };
ActiveFree.decorators = [withProviders({ store: storeWithFreePlan })];

export const Paid = Template.bind({});
Paid.args = { name: SubscriptionPlanName.MONTHLY };
Paid.decorators = [withProviders({ store: storeWithFreePlan })];

export const ActivePaid = Template.bind({});
ActivePaid.args = { name: SubscriptionPlanName.MONTHLY };
ActivePaid.decorators = [withProviders({ store: storeWithMonthlyPlan })];

export const WithTrialEligible = Template.bind({});
WithTrialEligible.args = { name: SubscriptionPlanName.MONTHLY };
WithTrialEligible.decorators = [withProviders({ store: storeWithTrialEligible })];
