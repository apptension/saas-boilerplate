import { Story } from '@storybook/react';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { OperationDescriptor } from 'react-relay/hooks';
import { useLazyLoadQuery } from 'react-relay';
import { Route } from 'react-router-dom';

import {
  queueSubscriptionScheduleQuery,
  queueSubscriptionScheduleQueryWithPhases,
  subscriptionFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../../mocks/factories';
import { SubscriptionPlanName } from '../../../../shared/services/api/subscription/types';
import { withRelay } from '../../../../shared/utils/storybook';

import subscriptionPlansAllQueryGraphql, {
  subscriptionPlansAllQuery,
} from '../../../../modules/subscription/__generated__/subscriptionPlansAllQuery.graphql';
import { connectionFromArray, ProvidersWrapper } from '../../../../shared/utils/testUtils';
import { mapConnection } from '../../../../shared/utils/graphql';
import { ActiveSubscriptionContext } from '../../activeSubscriptionContext/activeSubscriptionContext.component';
import { useActiveSubscriptionDetailsQueryRef } from '../../activeSubscriptionContext/activeSubscriptionContext.hooks';
import { SubscriptionPlanItem } from './subscriptionPlanItem.component';

type StoryProps = {
  name: string;
};

const Wrapper = () => {
  const data = useLazyLoadQuery<subscriptionPlansAllQuery>(subscriptionPlansAllQueryGraphql, {});
  const activeSubscriptionDetailsQueryRefContext = useActiveSubscriptionDetailsQueryRef();

  return (
    <>
      {mapConnection(
        (plan) => (
          <SubscriptionPlanItem
            plan={plan}
            onSelect={console.log}
            activeSubscriptionQueryRef={activeSubscriptionDetailsQueryRefContext.ref}
          />
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
        router: {
          routePath: undefined,
          children: <Route element={<Wrapper />} />,
        },
      }}
    >
      <ActiveSubscriptionContext />
    </ProvidersWrapper>
  );
};

const freePlan = subscriptionPlanFactory();
freePlan.product.name = SubscriptionPlanName.FREE;

const monthlyPlan = subscriptionPlanFactory();
monthlyPlan.product.name = SubscriptionPlanName.MONTHLY;

export default {
  title: 'Shared/Subscriptions/SubscriptionPlanItem',
  component: SubscriptionPlanItem,
};

export const Free = Template.bind({});
Free.args = { name: SubscriptionPlanName.FREE };
Free.decorators = [
  withRelay((env) => {
    queueSubscriptionScheduleQueryWithPhases(env, [
      subscriptionPhaseFactory({
        item: { price: monthlyPlan },
      }),
    ]);
  }),
];

export const ActiveFree = Template.bind({});
ActiveFree.args = { name: SubscriptionPlanName.FREE };
ActiveFree.decorators = [
  withRelay((env) => {
    queueSubscriptionScheduleQueryWithPhases(env, [
      subscriptionPhaseFactory({
        item: { price: freePlan },
      }),
    ]);
  }),
];

export const Paid = Template.bind({});
Paid.args = { name: SubscriptionPlanName.MONTHLY };
Paid.decorators = [
  withRelay((env) => {
    queueSubscriptionScheduleQueryWithPhases(env, [
      subscriptionPhaseFactory({
        item: { price: freePlan },
      }),
    ]);
  }),
];

export const ActivePaid = Template.bind({});
ActivePaid.args = { name: SubscriptionPlanName.MONTHLY };
ActivePaid.decorators = [
  withRelay((env) => {
    queueSubscriptionScheduleQueryWithPhases(env, [
      subscriptionPhaseFactory({
        item: { price: monthlyPlan },
      }),
    ]);
  }),
];

export const WithTrialEligible = Template.bind({});
WithTrialEligible.args = { name: SubscriptionPlanName.MONTHLY };
WithTrialEligible.decorators = [
  withRelay((env) => {
    queueSubscriptionScheduleQuery(
      env,
      subscriptionFactory({
        canActivateTrial: true,
        phases: [
          subscriptionPhaseFactory({
            item: { price: monthlyPlan },
          }),
        ],
      })
    );
  }),
];
