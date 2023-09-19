import { SubscriptionPlanName } from '@sb/webapp-api-client/api/subscription/types';
import {
  paymentMethodFactory,
  subscriptionFactory,
  subscriptionPhaseFactory,
} from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils/fixtures';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { getLocalePath } from '@sb/webapp-core/utils';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import { append } from 'ramda';
import { Route, Routes } from 'react-router-dom';

import { ActiveSubscriptionContext } from '../../../components/activeSubscriptionContext';
import { RoutesConfig } from '../../../config/routes';
import { fillSubscriptionScheduleQuery } from '../../../tests/factories';
import { createMockRouterProps, render } from '../../../tests/utils/rendering';
import { CancelSubscription } from '../cancelSubscription.component';
import { subscriptionCancelMutation } from '../cancelSubscription.graphql';

jest.mock('@sb/webapp-core/services/analytics');

const fillSubscriptionScheduleQueryWithPhases = (phases: any) => {
  return fillSubscriptionScheduleQuery(
    subscriptionFactory({
      defaultPaymentMethod: paymentMethodFactory({
        billingDetails: { name: 'Owner' },
        card: { last4: '1234' },
      }),
      phases,
    })
  );
};

const resolveSubscriptionDetailsQuery = () => {
  return fillSubscriptionScheduleQueryWithPhases([
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
      defaultPaymentMethod: { id: 'payment-id' },
    },
    __typename: 'SubscriptionScheduleType',
  },
  __typename: 'CancelActiveSubscriptionMutationPayload',
};

const mutationVariables = { input: {} };

const resolveSubscriptionCancelMutation = (errors?: GraphQLError[]) => {
  return composeMockedQueryResult(subscriptionCancelMutation, {
    variables: mutationVariables,
    data: mutationData,
    errors,
  });
};

const routePath = RoutesConfig.subscriptions.currentSubscription.cancel;

const Component = () => {
  return (
    <Routes>
      <Route element={<ActiveSubscriptionContext />}>
        <Route path={getLocalePath(routePath)} element={<CancelSubscription />} />
      </Route>
    </Routes>
  );
};

describe('CancelSubscription: Component', () => {
  it('should render current plan details', async () => {
    const routerProps = createMockRouterProps(routePath);
    const requestMock = resolveSubscriptionDetailsQuery();
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
      const routerProps = createMockRouterProps(routePath);
      const requestMock = resolveSubscriptionDetailsQuery();
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
      const requestMock = resolveSubscriptionDetailsQuery();
      const requestCancelMock = resolveSubscriptionCancelMutation();

      render(<Component />, {
        routerProps,
        apolloMocks: (defaultMocks) => defaultMocks.concat(requestMock, requestCancelMock),
      });

      await userEvent.click(await screen.findByText(/cancel subscription/i));

      const toast = await screen.findByTestId('toast-1');
      expect(toast).toHaveTextContent('You will be moved to free plan with the next billing period');
      expect(trackEvent).toHaveBeenCalledWith('subscription', 'cancel');
    });
  });

  describe('cancel completes with error', () => {
    it('shouldnt show success message and redirect to subscriptions page', async () => {
      const errors = [new GraphQLError('Bad Error')];
      const routerProps = createMockRouterProps(routePath);
      const requestMock = resolveSubscriptionDetailsQuery();
      const requestCancelMock = resolveSubscriptionCancelMutation(errors);

      render(<Component />, {
        routerProps,
        apolloMocks: (defaultMocks) => defaultMocks.concat(requestMock, requestCancelMock),
      });

      await userEvent.click(await screen.findByText(/cancel subscription/i));

      const toaster = await screen.findByTestId('toaster');
      expect(toaster).toBeEmptyDOMElement();
    });
  });
});
