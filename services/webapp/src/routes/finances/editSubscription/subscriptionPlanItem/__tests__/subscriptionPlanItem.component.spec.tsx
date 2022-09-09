import { screen, waitFor } from '@testing-library/react';
import { useLazyLoadQuery } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { OperationDescriptor } from 'react-relay/hooks';
import userEvent from '@testing-library/user-event';

import { SubscriptionPlanItem, SubscriptionPlanItemProps } from '../subscriptionPlanItem.component';
import { subscriptionFactory, subscriptionPhaseFactory, subscriptionPlanFactory } from '../../../../../mocks/factories';
import { SubscriptionPlanName } from '../../../../../shared/services/api/subscription/types';
import { connectionFromArray } from '../../../../../shared/utils/testUtils';
import { render } from '../../../../../tests/utils/rendering';
import { prepareState } from '../../../../../mocks/store';
import subscriptionPlansAllQueryGraphql, {
  subscriptionPlansAllQuery,
} from '../../../../../modules/subscription/__generated__/subscriptionPlansAllQuery.graphql';
import { mapConnection } from '../../../../../shared/utils/graphql';
import { fillCommonQueryWithUser } from '../../../../../shared/utils/commonQuery';

describe('SubscriptionPlanItem: Component', () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const defaultProps: Pick<SubscriptionPlanItemProps, 'onSelect'> = { onSelect: () => {} };

  const Wrapper = (props: Partial<SubscriptionPlanItemProps>) => {
    const data = useLazyLoadQuery<subscriptionPlansAllQuery>(subscriptionPlansAllQueryGraphql, {});

    const plans = mapConnection((plan) => plan, data.allSubscriptionPlans);

    return <SubscriptionPlanItem {...defaultProps} plan={plans[0]} {...props} />;
  };

  const getRelayEnv = () => {
    const relayEnvironment = createMockEnvironment();
    fillCommonQueryWithUser(relayEnvironment);
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
    product: { name: SubscriptionPlanName.MONTHLY },
  });

  const defaultReduxInitialState = prepareState((state) => {
    state.subscription.activeSubscription = subscriptionFactory({
      phases: [subscriptionPhaseFactory({ item: { price: monthlyPlan } })],
    });
  });

  it('should render name', () => {
    const relayEnvironment = getRelayEnv();
    render(<Wrapper />, { relayEnvironment, reduxInitialState: defaultReduxInitialState });
    expect(screen.getByText(/monthly/i)).toBeInTheDocument();
  });

  it('should render plan price', () => {
    const relayEnvironment = getRelayEnv();
    render(<Wrapper />, { relayEnvironment, reduxInitialState: defaultReduxInitialState });
    expect(screen.getByText(/2\.5 USD/i)).toBeInTheDocument();
  });

  describe('button is clicked', () => {
    describe('next billing plan is different from the clicked one', () => {
      const yearlyPlan = subscriptionPlanFactory({ id: 'plan_yearly', product: { name: SubscriptionPlanName.YEARLY } });

      const reduxInitialState = prepareState((state) => {
        state.subscription.activeSubscription = subscriptionFactory({
          phases: [
            subscriptionPhaseFactory({ item: { price: monthlyPlan } }),
            subscriptionPhaseFactory({ item: { price: yearlyPlan } }),
          ],
        });
      });

      it('should call onSelect', async () => {
        const onSelect = jest.fn();
        const relayEnvironment = getRelayEnv();
        render(<Wrapper onSelect={onSelect} />, { relayEnvironment, reduxInitialState });
        await userEvent.click(screen.getByText(/select/i));
        await waitFor(() => {
          expect(onSelect).toHaveBeenCalled();
        });
      });
    });

    describe('next billing plan is same as the clicked one', () => {
      const monthlyPlan = subscriptionPlanFactory({
        id: 'plan_monthly',
        product: { name: SubscriptionPlanName.MONTHLY },
      });
      const reduxInitialState = prepareState((state) => {
        state.subscription.activeSubscription = subscriptionFactory({
          phases: [subscriptionPhaseFactory({ item: { price: monthlyPlan } })],
        });
      });

      it('should not call onSelect', async () => {
        const onSelect = jest.fn();
        const relayEnvironment = getRelayEnv();
        render(<Wrapper onSelect={onSelect} />, { relayEnvironment, reduxInitialState });
        await userEvent.click(screen.getByText(/select/i));
        expect(onSelect).not.toHaveBeenCalled();
      });
    });

    describe('active plan is clicked, but is has already been cancelled', () => {
      const monthlyPlan = subscriptionPlanFactory({
        id: 'plan_monthly',
        product: { name: SubscriptionPlanName.MONTHLY },
      });
      const freePlan = subscriptionPlanFactory({
        id: 'plan_free',
        product: { name: SubscriptionPlanName.FREE },
      });
      const reduxInitialState = prepareState((state) => {
        state.subscription.activeSubscription = subscriptionFactory({
          phases: [
            subscriptionPhaseFactory({ item: { price: monthlyPlan } }),
            subscriptionPhaseFactory({ item: { price: freePlan } }),
          ],
        });
      });

      it('should call onSelect', async () => {
        const onSelect = jest.fn();
        const relayEnvironment = getRelayEnv();
        render(<Wrapper onSelect={onSelect} />, { relayEnvironment, reduxInitialState });
        await userEvent.click(screen.getByText(/select/i));
        expect(onSelect).toHaveBeenCalled();
      });
    });
  });

  describe('trial is eligible', () => {
    it('should show trial info', () => {
      const relayEnvironment = getRelayEnv();
      const reduxInitialState = prepareState((state) => {
        state.subscription.activeSubscription = subscriptionFactory({ canActivateTrial: true });
      });

      render(<Wrapper />, { relayEnvironment, reduxInitialState });
      expect(screen.getByText(/will start with a trial/i)).toBeInTheDocument();
    });
  });

  describe('trial is illegible', () => {
    it('should not show trial info', () => {
      const relayEnvironment = getRelayEnv();
      const reduxInitialState = prepareState((state) => {
        state.subscription.activeSubscription = subscriptionFactory({ canActivateTrial: false });
      });
      render(<Wrapper />, { relayEnvironment, reduxInitialState });
      expect(screen.queryByText(/will start with a trial/gi)).not.toBeInTheDocument();
    });
  });
});
