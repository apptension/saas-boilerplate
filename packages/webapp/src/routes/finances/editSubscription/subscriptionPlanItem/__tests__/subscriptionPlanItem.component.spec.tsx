import { useQuery } from '@apollo/client';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { append } from 'ramda';
import { OperationDescriptor } from 'react-relay/hooks';
import { Route, Routes } from 'react-router-dom';
import { MockPayloadGenerator } from 'relay-test-utils';

import {
  fillSubscriptionPlansAllQuery,
  fillSubscriptionScheduleQuery,
  subscriptionFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../../../mocks/factories';
import subscriptionPlansAllQueryGraphql from '../../../../../modules/subscription/__generated__/subscriptionPlansAllQuery.graphql';
import { SubscriptionPlanName } from '../../../../../shared/services/api/subscription/types';
import { mapConnection } from '../../../../../shared/utils/graphql';
import { connectionFromArray } from '../../../../../tests/utils/fixtures';
import { getRelayEnv as getBaseRelayEnv } from '../../../../../tests/utils/relay';
import { render } from '../../../../../tests/utils/rendering';
import { ActiveSubscriptionContext } from '../../../activeSubscriptionContext/activeSubscriptionContext.component';
import { useActiveSubscriptionDetails } from '../../../activeSubscriptionContext/activeSubscriptionContext.hooks';
import { SUBSCRIPTION_PLANS_ALL_QUERY } from '../../subscriptionPlans/subscriptionPlans.graphql';
import { SubscriptionPlanItem, SubscriptionPlanItemProps } from '../subscriptionPlanItem.component';

describe('SubscriptionPlanItem: Component', () => {
  const defaultProps: Pick<SubscriptionPlanItemProps, 'onSelect'> = { onSelect: () => jest.fn() };

  const Component = (props: Partial<SubscriptionPlanItemProps>) => {
    const { activeSubscription } = useActiveSubscriptionDetails();
    const { data } = useQuery(SUBSCRIPTION_PLANS_ALL_QUERY);

    const plans = mapConnection((plan) => plan, data?.allSubscriptionPlans);

    return (
      <SubscriptionPlanItem
        {...defaultProps}
        plan={plans[0]}
        activeSubscription={activeSubscription}
        loading={false}
        {...props}
      />
    );
  };

  const Wrapper = (props: Partial<SubscriptionPlanItemProps>) => {
    return (
      <Routes>
        <Route element={<ActiveSubscriptionContext />}>
          <Route index element={<Component {...props} />} />
        </Route>
      </Routes>
    );
  };

  const getRelayEnv = () => {
    const relayEnvironment = getBaseRelayEnv();
    relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        SubscriptionPlanConnection: () =>
          connectionFromArray([
            {
              unitAmount: 250,
              product: {
                name: SubscriptionPlanName.MONTHLY,
              },
            },
          ]),
      })
    );
    relayEnvironment.mock.queuePendingOperation(subscriptionPlansAllQueryGraphql, {});
    return relayEnvironment;
  };

  const monthlyPlan = subscriptionPlanFactory({
    id: 'plan_monthly',
    pk: 'price_monthly',
    product: { name: SubscriptionPlanName.MONTHLY },
  });

  const subscriptionWithMonthlyPlan = subscriptionFactory({
    phases: [subscriptionPhaseFactory({ item: { price: monthlyPlan } })],
  });

  it('should render name', async () => {
    const relayEnvironment = getRelayEnv();
    const requestPlansMock = fillSubscriptionPlansAllQuery(relayEnvironment, [monthlyPlan]);
    render(<Wrapper />, {
      relayEnvironment,
      apolloMocks: append(requestPlansMock),
    });

    expect(await screen.findByText(/monthly/i)).toBeInTheDocument();
  });

  it('should render plan price', async () => {
    const relayEnvironment = getRelayEnv();
    const requestPlansMock = fillSubscriptionPlansAllQuery(relayEnvironment, [monthlyPlan]);
    render(<Wrapper />, { relayEnvironment, apolloMocks: append(requestPlansMock) });
    expect(await screen.findByText(/10 USD/i)).toBeInTheDocument();
  });

  describe('button is clicked', () => {
    describe('next billing plan is different from the clicked one', () => {
      it('should call onSelect', async () => {
        const onSelect = jest.fn();
        const relayEnvironment = getRelayEnv();
        const requestPlansMock = fillSubscriptionPlansAllQuery(relayEnvironment, [monthlyPlan]);
        const { waitForApolloMocks } = render(<Wrapper onSelect={onSelect} />, {
          relayEnvironment,
          apolloMocks: append(requestPlansMock),
        });
        await waitForApolloMocks();
        await userEvent.click(screen.getByText(/select/i));
        await waitFor(() => {
          expect(onSelect).toHaveBeenCalled();
        });
      });
    });

    describe('next billing plan is same as the clicked one', () => {
      it('should not call onSelect', async () => {
        const onSelect = jest.fn();
        const relayEnvironment = getRelayEnv();
        const requestMock = fillSubscriptionScheduleQuery(relayEnvironment, subscriptionWithMonthlyPlan);
        const requestPlansMock = fillSubscriptionPlansAllQuery(relayEnvironment, [monthlyPlan]);

        const { waitForApolloMocks } = render(<Wrapper onSelect={onSelect} />, {
          relayEnvironment,
          apolloMocks: (defaultMocks) => defaultMocks.concat(requestMock, requestPlansMock),
        });
        await waitForApolloMocks();

        await userEvent.click(screen.getByText(/select/i));
        expect(onSelect).not.toHaveBeenCalled();
      });
    });

    describe('active plan is clicked, but is has already been cancelled', () => {
      it('should call onSelect', async () => {
        const onSelect = jest.fn();
        const relayEnvironment = getRelayEnv();
        const requestPlansMock = fillSubscriptionPlansAllQuery(relayEnvironment, [monthlyPlan]);
        const { waitForApolloMocks } = render(<Wrapper onSelect={onSelect} />, {
          relayEnvironment,
          apolloMocks: append(requestPlansMock),
        });
        await waitForApolloMocks();
        await userEvent.click(screen.getByText(/select/i));
        expect(onSelect).toHaveBeenCalled();
      });
    });
  });

  describe('trial is eligible', () => {
    it('should show trial info', async () => {
      const relayEnvironment = getRelayEnv();
      const requestMock = fillSubscriptionScheduleQuery(
        relayEnvironment,
        subscriptionFactory({ canActivateTrial: true })
      );
      render(<Wrapper />, { relayEnvironment, apolloMocks: append(requestMock) });
      expect(await screen.findByText(/will start with a trial/i)).toBeInTheDocument();
    });
  });

  describe('trial is illegible', () => {
    it('should not show trial info', async () => {
      const relayEnvironment = getRelayEnv();
      fillSubscriptionScheduleQuery(relayEnvironment, subscriptionFactory({ canActivateTrial: false }));
      const { waitForApolloMocks } = render(<Wrapper />, { relayEnvironment });
      await waitForApolloMocks();
      expect(screen.queryByText(/will start with a trial/gi)).not.toBeInTheDocument();
    });
  });
});
