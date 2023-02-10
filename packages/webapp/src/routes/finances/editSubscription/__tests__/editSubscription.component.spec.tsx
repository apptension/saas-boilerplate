import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { OperationDescriptor } from 'react-relay/hooks';
import { Route, Routes } from 'react-router-dom';
import { MockPayloadGenerator, RelayMockEnvironment } from 'relay-test-utils';

import { fillSubscriptionScheduleQuery, subscriptionPlanFactory } from '../../../../mocks/factories';
import { snackbarActions } from '../../../../modules/snackbar';
import subscriptionPlansAllQueryGraphql from '../../../../modules/subscription/__generated__/subscriptionPlansAllQuery.graphql';
import { SubscriptionPlanName } from '../../../../shared/services/api/subscription/types';
import { composeMockedQueryResult, connectionFromArray } from '../../../../tests/utils/fixtures';
import { getRelayEnv as getBaseRelayEnv } from '../../../../tests/utils/relay';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { ActiveSubscriptionContext } from '../../activeSubscriptionContext/activeSubscriptionContext.component';
import { EditSubscription } from '../editSubscription.component';
import { SUBSCRIPTION_CHANGE_ACTIVE_MUTATION } from '../editSubscription.graphql';

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

const mockMutationVariables = { input: { price: 'plan_monthly' } };

const mockMutationData = {
  changeActiveSubscription: {
    subscriptionSchedule: {
      phases: [],
      subscription: null,
      canActivateTrial: true,
      defaultPaymentMethod: {},
      __typename: 'SubscriptionScheduleType',
    },
    __typename: 'ChangeActiveSubscriptionMutationPayload',
  },
};

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

const fillChangeSubscriptionMutation = (errors?: GraphQLError[]) =>
  composeMockedQueryResult(SUBSCRIPTION_CHANGE_ACTIVE_MUTATION, {
    data: mockMutationData,
    variables: mockMutationVariables,
    errors,
  });

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
      const requestMock = fillCurrentSubscriptionQuery(relayEnvironment);
      const requestMockMutation = fillChangeSubscriptionMutation();

      const routerProps = createMockRouterProps(['home']);
      render(<Component />, {
        relayEnvironment,
        routerProps,
        apolloMocks: (defaultMock) => defaultMock.concat(requestMock, requestMockMutation),
      });

      await userEvent.click(await screen.findByText(/monthly/i));
      const monthlyButton = screen.getAllByRole('button', { name: /select/i })[0];
      expect(monthlyButton).not.toBeDisabled();
      await userEvent.click(monthlyButton);
      expect(monthlyButton).toBeDisabled();

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

      const requestMock = fillCurrentSubscriptionQuery(relayEnvironment);
      const errorMessage = 'Missing payment method';
      const requestMockMutation = fillChangeSubscriptionMutation([new GraphQLError(errorMessage)]);

      const routerProps = createMockRouterProps(['home']);
      render(<Component />, {
        relayEnvironment,
        routerProps,
        apolloMocks: (defaultMock) => defaultMock.concat(requestMock, requestMockMutation),
      });

      await userEvent.click(await screen.findByText(/monthly/i));
      await userEvent.click(screen.getAllByRole('button', { name: /select/i })[0]);

      expect(mockDispatch).toHaveBeenCalledWith(
        snackbarActions.showMessage({
          text: 'You need first to add a payment method. Go back and set it there',
          id: 1,
        })
      );
    });
  });
});
