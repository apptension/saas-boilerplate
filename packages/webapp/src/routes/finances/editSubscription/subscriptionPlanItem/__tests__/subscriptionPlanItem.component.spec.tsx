import { screen, waitFor } from '@testing-library/react';
import { useLazyLoadQuery } from 'react-relay';
import { MockPayloadGenerator } from 'relay-test-utils';
import { OperationDescriptor } from 'react-relay/hooks';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';

import { SubscriptionPlanItem, SubscriptionPlanItemProps } from '../subscriptionPlanItem.component';
import {
  fillSubscriptionScheduleQuery,
  subscriptionFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../../../mocks/factories';
import { SubscriptionPlanName } from '../../../../../shared/services/api/subscription/types';
import { render } from '../../../../../tests/utils/rendering';
import subscriptionPlansAllQueryGraphql, {
  subscriptionPlansAllQuery,
} from '../../../../../modules/subscription/__generated__/subscriptionPlansAllQuery.graphql';
import { mapConnection } from '../../../../../shared/utils/graphql';
import { useActiveSubscriptionDetailsQueryRef } from '../../../activeSubscriptionContext/activeSubscriptionContext.hooks';
import { ActiveSubscriptionContext } from '../../../activeSubscriptionContext/activeSubscriptionContext.component';
import { getRelayEnv as getBaseRelayEnv } from '../../../../../tests/utils/relay';
import { connectionFromArray } from '../../../../../tests/utils/fixtures';

describe('SubscriptionPlanItem: Component', () => {
  const defaultProps: Pick<SubscriptionPlanItemProps, 'onSelect'> = { onSelect: () => jest.fn() };

  const Component = (props: Partial<SubscriptionPlanItemProps>) => {
    const data = useLazyLoadQuery<subscriptionPlansAllQuery>(subscriptionPlansAllQueryGraphql, {});
    const activeSubscriptionDetailsQueryRefContext = useActiveSubscriptionDetailsQueryRef();

    if (!activeSubscriptionDetailsQueryRefContext || !activeSubscriptionDetailsQueryRefContext.ref) return null;

    const plans = mapConnection((plan) => plan, data.allSubscriptionPlans);

    return (
      <SubscriptionPlanItem
        {...defaultProps}
        plan={plans[0]}
        activeSubscriptionQueryRef={activeSubscriptionDetailsQueryRefContext.ref}
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

  const freePlan = subscriptionPlanFactory({
    id: 'plan_free',
    product: { name: SubscriptionPlanName.FREE },
  });

  const monthlyPlan = subscriptionPlanFactory({
    id: 'plan_monthly',
    product: { name: SubscriptionPlanName.MONTHLY },
  });

  const yearlyPlan = subscriptionPlanFactory({ id: 'plan_yearly', product: { name: SubscriptionPlanName.YEARLY } });

  const subscriptionWithMonthlyPlan = subscriptionFactory({
    phases: [subscriptionPhaseFactory({ item: { price: monthlyPlan } })],
  });

  const subscriptionMigrationToYearly = subscriptionFactory({
    phases: [
      subscriptionPhaseFactory({ item: { price: monthlyPlan } }),
      subscriptionPhaseFactory({ item: { price: yearlyPlan } }),
    ],
  });

  it('should render name', async () => {
    const relayEnvironment = getRelayEnv();
    fillSubscriptionScheduleQuery(relayEnvironment, subscriptionWithMonthlyPlan);
    render(<Wrapper />, { relayEnvironment });
    expect(screen.getByText(/monthly/i)).toBeInTheDocument();
  });

  it('should render plan price', async () => {
    const relayEnvironment = getRelayEnv();
    fillSubscriptionScheduleQuery(relayEnvironment, subscriptionWithMonthlyPlan);
    render(<Wrapper />, { relayEnvironment });
    expect(screen.getByText(/2\.5 USD/i)).toBeInTheDocument();
  });

  describe('button is clicked', () => {
    describe('next billing plan is different from the clicked one', () => {
      it('should call onSelect', async () => {
        const onSelect = jest.fn();
        const relayEnvironment = getRelayEnv();
        fillSubscriptionScheduleQuery(relayEnvironment, subscriptionMigrationToYearly);
        render(<Wrapper onSelect={onSelect} />, { relayEnvironment });
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
        fillSubscriptionScheduleQuery(relayEnvironment, subscriptionWithMonthlyPlan);
        render(<Wrapper onSelect={onSelect} />, { relayEnvironment });
        await userEvent.click(screen.getByText(/select/i));
        expect(onSelect).not.toHaveBeenCalled();
      });
    });

    describe('active plan is clicked, but is has already been cancelled', () => {
      it('should call onSelect', async () => {
        const onSelect = jest.fn();
        const relayEnvironment = getRelayEnv();
        fillSubscriptionScheduleQuery(
          relayEnvironment,
          subscriptionFactory({
            phases: [
              subscriptionPhaseFactory({ item: { price: monthlyPlan } }),
              subscriptionPhaseFactory({ item: { price: freePlan } }),
            ],
          })
        );
        render(<Wrapper onSelect={onSelect} />, { relayEnvironment });
        await userEvent.click(screen.getByText(/select/i));
        expect(onSelect).toHaveBeenCalled();
      });
    });
  });

  describe('trial is eligible', () => {
    it('should show trial info', async () => {
      const relayEnvironment = getRelayEnv();
      fillSubscriptionScheduleQuery(relayEnvironment, subscriptionFactory({ canActivateTrial: true }));
      render(<Wrapper />, { relayEnvironment });
      expect(screen.getByText(/will start with a trial/i)).toBeInTheDocument();
    });
  });

  describe('trial is illegible', () => {
    it('should not show trial info', async () => {
      const relayEnvironment = getRelayEnv();
      fillSubscriptionScheduleQuery(relayEnvironment, subscriptionFactory({ canActivateTrial: false }));
      render(<Wrapper />, { relayEnvironment });
      expect(screen.queryByText(/will start with a trial/gi)).not.toBeInTheDocument();
    });
  });
});
