import userEvent from '@testing-library/user-event';
import { act, screen } from '@testing-library/react';
import { OperationDescriptor } from 'react-relay/hooks';
import { Route, Routes } from 'react-router-dom';
import { MockPayloadGenerator, RelayMockEnvironment } from 'relay-test-utils';

import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { EditSubscription } from '../editSubscription.component';
import { fillSubscriptionScheduleQuery, subscriptionPlanFactory } from '../../../../mocks/factories';
import { SubscriptionPlanName } from '../../../../shared/services/api/subscription/types';
import { snackbarActions } from '../../../../modules/snackbar';
import subscriptionPlansAllQueryGraphql from '../../../../modules/subscription/__generated__/subscriptionPlansAllQuery.graphql';
import { ActiveSubscriptionContext } from '../../activeSubscriptionContext/activeSubscriptionContext.component';
import { getRelayEnv as getBaseRelayEnv } from '../../../../tests/utils/relay';
import { connectionFromArray } from '../../../../tests/utils/fixtures';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

const mockMonthlyPlan = subscriptionPlanFactory({
  id: 'plan_monthly',
  pk: 'plan_monthly',
  product: { name: SubscriptionPlanName.MONTHLY },
});
const mockYearlyPlan = subscriptionPlanFactory({ id: 'plan_yearly', product: { name: SubscriptionPlanName.YEARLY } });

const getRelayEnv = () => {
  const relayEnvironment = getBaseRelayEnv();
  relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
    MockPayloadGenerator.generate(operation, {
      SubscriptionPlanConnection: () => connectionFromArray([mockMonthlyPlan, mockYearlyPlan]),
    })
  );
  relayEnvironment.mock.queuePendingOperation(subscriptionPlansAllQueryGraphql, {});
  return relayEnvironment;
};

const fillCurrentSubscriptionQuery = (relayEnvironment: RelayMockEnvironment) =>
  fillSubscriptionScheduleQuery(
    relayEnvironment,
    subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } })
  );

const placeholder = 'Subscriptions placeholder';

const Component = () => {
  return (
    <Routes>
      <Route path="/en" element={<ActiveSubscriptionContext />}>
        <Route index element={<EditSubscription />} />
        <Route path="/en/subscriptions" element={<span>{placeholder}</span>} />
      </Route>
    </Routes>
  );
};

describe('EditSubscription: Component', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
  });

  describe('plan is changed sucessfully', () => {
    it('should show success message and redirect to my subscription page', async () => {
      const relayEnvironment = getRelayEnv();
      fillCurrentSubscriptionQuery(relayEnvironment);
      const routerProps = createMockRouterProps(['home']);
      render(<Component />, { relayEnvironment, routerProps });

      await userEvent.click(screen.getByText(/monthly/i));
      await userEvent.click(screen.getAllByRole('button', { name: /select/i })[0]);

      expect(relayEnvironment).toHaveLatestOperation('subscriptionChangeActiveSubscriptionMutation');
      expect(relayEnvironment).toLatestOperationInputEqual({ price: 'plan_monthly' });

      await act(async () => {
        const operation = relayEnvironment.mock.getMostRecentOperation();
        relayEnvironment.mock.resolve(operation, MockPayloadGenerator.generate(operation));
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        snackbarActions.showMessage({
          text: 'Plan changed successfully',
          id: 1,
        })
      );
      expect(screen.getByText(placeholder)).toBeInTheDocument();
    });
  });

  describe('plan fails to update', () => {
    it('should show error message', async () => {
      const relayEnvironment = getRelayEnv();
      fillCurrentSubscriptionQuery(relayEnvironment);

      const routerProps = createMockRouterProps(['home']);
      render(<Component />, { relayEnvironment, routerProps });

      await userEvent.click(screen.getByText(/monthly/i));
      await userEvent.click(screen.getAllByRole('button', { name: /select/i })[0]);

      const errorMessage = 'Missing payment method';
      await act(async () => {
        const operation = relayEnvironment.mock.getMostRecentOperation();
        relayEnvironment.mock.resolve(operation, {
          ...MockPayloadGenerator.generate(operation),
          errors: [
            {
              message: 'GraphQlValidationError',
              extensions: {
                id: [
                  {
                    message: errorMessage,
                    code: 'invalid',
                  },
                ],
              },
            },
          ],
        } as any);
      });

      expect(mockDispatch).toHaveBeenCalledWith(
        snackbarActions.showMessage({
          text: 'You need first to add a payment method. Go back and set it there',
          id: 1,
        })
      );
    });
  });
});
