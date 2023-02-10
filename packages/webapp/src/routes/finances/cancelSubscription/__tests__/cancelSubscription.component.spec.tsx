import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { append } from 'ramda';
import { Route, Routes } from 'react-router-dom';
import { RelayMockEnvironment } from 'relay-test-utils';

import { RoutesConfig } from '../../../../app/config/routes';
import {
  fillSubscriptionScheduleQuery,
  paymentMethodFactory,
  subscriptionFactory,
  subscriptionPhaseFactory,
} from '../../../../mocks/factories';
import { snackbarActions } from '../../../../modules/snackbar';
import { SubscriptionPlanName } from '../../../../shared/services/api/subscription/types';
import { composeMockedQueryResult } from '../../../../tests/utils/fixtures';
import { getRelayEnv } from '../../../../tests/utils/relay';
import { createMockRouterProps, render } from '../../../../tests/utils/rendering';
import { ActiveSubscriptionContext } from '../../activeSubscriptionContext/activeSubscriptionContext.component';
import { CancelSubscription } from '../cancelSubscription.component';
import { SUBSCRIPTION_CANCEL_MUTATION } from '../cancelSubscription.graphql';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

const fillSubscriptionScheduleQueryWithPhases = (relayEnvironment: RelayMockEnvironment, phases: any) => {
  return fillSubscriptionScheduleQuery(
    relayEnvironment,
    subscriptionFactory({
      defaultPaymentMethod: paymentMethodFactory({
        billingDetails: { name: 'Owner' },
        card: { last4: '1234' },
      }),
      phases,
    })
  );
};

const resolveSubscriptionDetailsQuery = (relayEnvironment: RelayMockEnvironment) => {
  return fillSubscriptionScheduleQueryWithPhases(relayEnvironment, [
    subscriptionPhaseFactory({
      endDate: '2020-10-10',
      item: { price: { product: { name: SubscriptionPlanName.MONTHLY } } },
    }),
    subscriptionPhaseFactory({ startDate: '2020-10-10' }),
  ]);
};

const mutationData = {
  cancelActiveSubscription: {
    subscriptionSchedule: {
      __typename: 'SubscriptionScheduleType',
      id: 'test-id',
      phases: [],
      subscription: null,
      canActivateTrial: true,
      defaultPaymentMethod: {},
    },
    __typename: 'SubscriptionScheduleType',
  },
  __typename: 'CancelActiveSubscriptionMutationPayload',
};

const mutationVariables = { input: {} };

const resolveSubscriptionCancelMutation = (errors?: GraphQLError[]) => {
  return composeMockedQueryResult(SUBSCRIPTION_CANCEL_MUTATION, {
    variables: mutationVariables,
    data: mutationData,
    errors,
  });
};

const routePath = ['subscriptions', 'list'];

const Component = () => {
  return (
    <Routes>
      <Route element={<ActiveSubscriptionContext />}>
        <Route path={RoutesConfig.getLocalePath(routePath)} element={<CancelSubscription />} />
      </Route>
    </Routes>
  );
};

describe('CancelSubscription: Component', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
  });

  it('should render current plan details', async () => {
    const relayEnvironment = getRelayEnv();
    const routerProps = createMockRouterProps(routePath);
    const requestMock = resolveSubscriptionDetailsQuery(relayEnvironment);
    const { waitForApolloMocks } = render(<Component />, {
      routerProps,
      apolloMocks: append(requestMock),
    });

    await waitForApolloMocks(0);

    expect(await screen.findByText(/Active plan:/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly/i)).toBeInTheDocument();
    expect(screen.getByText(/next renewal/i)).toBeInTheDocument();
    expect(screen.getByText(/October 10, 2020/i)).toBeInTheDocument();
  });

  describe('cancel button is clicked', () => {
    it('should trigger cancelSubscription action', async () => {
      const relayEnvironment = getRelayEnv();
      const routerProps = createMockRouterProps(routePath);
      const requestMock = resolveSubscriptionDetailsQuery(relayEnvironment);
      const requestCancelMock = resolveSubscriptionCancelMutation();
      requestCancelMock.newData = jest.fn(() => ({
        data: mutationData,
      }));

      render(<Component />, {
        routerProps,
        apolloMocks: (defaultMocks) => defaultMocks.concat(requestMock, requestCancelMock),
      });

      await userEvent.click(await screen.findByText(/cancel subscription/i));

      expect(requestCancelMock.newData).toHaveBeenCalled();
    });
  });

  describe('cancel completes successfully', () => {
    it('should show success message and redirect to subscriptions page', async () => {
      const routerProps = createMockRouterProps(routePath);
      const relayEnvironment = getRelayEnv();
      const requestMock = resolveSubscriptionDetailsQuery(relayEnvironment);
      const requestCancelMock = resolveSubscriptionCancelMutation();

      render(<Component />, {
        routerProps,
        apolloMocks: (defaultMocks) => defaultMocks.concat(requestMock, requestCancelMock),
      });

      await userEvent.click(await screen.findByText(/cancel subscription/i));

      expect(mockDispatch).toHaveBeenCalledWith(
        snackbarActions.showMessage({
          text: 'You will be moved to free plan with the next billing period',
          id: 1,
        })
      );
    });
  });

  describe('cancel completes with error', () => {
    it('shouldnt show success message and redirect to subscriptions page', async () => {
      const relayEnvironment = getRelayEnv();
      const errors = [new GraphQLError('Bad Error')];
      const routerProps = createMockRouterProps(routePath);
      const requestMock = resolveSubscriptionDetailsQuery(relayEnvironment);
      const requestCancelMock = resolveSubscriptionCancelMutation(errors);

      render(<Component />, {
        routerProps,
        apolloMocks: (defaultMocks) => defaultMocks.concat(requestMock, requestCancelMock),
      });

      await userEvent.click(await screen.findByText(/cancel subscription/i));

      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });
});
