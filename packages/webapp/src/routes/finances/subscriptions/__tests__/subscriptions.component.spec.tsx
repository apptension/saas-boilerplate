import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RelayMockEnvironment } from 'relay-test-utils';
import { Routes, Route } from 'react-router-dom';
import { append } from 'ramda';

import { render } from '../../../../tests/utils/rendering';
import { Subscriptions } from '../subscriptions.component';
import {
  subscriptionFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
  fillSubscriptionScheduleQuery,
  fillSubscriptionScheduleQueryWithPhases,
  fillAllPaymentsMethodsQuery,
  fillActivePlanDetailsQuery,
  paymentMethodFactory,
} from '../../../../mocks/factories';
import {
  SubscriptionPlanName,
  Subscription as SubscriptionType,
} from '../../../../shared/services/api/subscription/types';
import { ActiveSubscriptionContext } from '../../activeSubscriptionContext/activeSubscriptionContext.component';
import { getRelayEnv } from '../../../../tests/utils/relay';
import { matchTextContent } from '../../../../tests/utils/match';

const defaultPaymentPlan = [paymentMethodFactory()];

const defaultActivePlan = {
  defaultPaymentMethod: {
    id: defaultPaymentPlan[0].id,
  },
};

const resolveSubscriptionDetailsQuery = (relayEnvironment: RelayMockEnvironment) => {
  return fillSubscriptionScheduleQueryWithPhases(relayEnvironment, [
    subscriptionPhaseFactory({
      endDate: new Date('Jan 1, 2099 GMT').toISOString(),
      item: { price: { product: { name: SubscriptionPlanName.FREE } } },
    }),
  ]);
};

const resolveSubscriptionDetailsQueryWithSubscriptionCanceled = (relayEnvironment: RelayMockEnvironment) => {
  return fillSubscriptionScheduleQueryWithPhases(relayEnvironment, [
    subscriptionPhaseFactory({
      endDate: new Date('Jan 1, 2099 GMT').toISOString(),
      item: { price: { product: { name: SubscriptionPlanName.MONTHLY } } },
    }),
    subscriptionPhaseFactory({
      startDate: new Date('Jan 1, 2099 GMT').toISOString(),
      item: { price: { product: { name: SubscriptionPlanName.FREE } } },
    }),
  ]);
};

const CANCEL_PLACEHOLDER_ID = 'cancel';
const EDIT_PLACEHOLDER_ID = 'edit';

const Component = () => (
  <Routes>
    <Route element={<ActiveSubscriptionContext />}>
      <Route index element={<Subscriptions />} />
      <Route path="/en/subscriptions/cancel" element={<span data-testid={CANCEL_PLACEHOLDER_ID} />} />
      <Route path="/en/subscriptions/edit" element={<span data-testid={EDIT_PLACEHOLDER_ID} />} />
    </Route>
  </Routes>
);

describe('Subscriptions: Component', () => {
  it('should render current subscription plan', async () => {
    const relayEnvironment = getRelayEnv();
    const requestMock = resolveSubscriptionDetailsQuery(relayEnvironment);
    render(<Component />, { relayEnvironment, apolloMocks: append(requestMock) });

    expect(await screen.findByText(matchTextContent(/current plan:.*free/gi))).toBeInTheDocument();
  });

  it('should render default payment method', async () => {
    const requestPaymentsMock = fillAllPaymentsMethodsQuery(defaultPaymentPlan as Partial<SubscriptionType>[]);
    const requestPlanDetailsMock = fillActivePlanDetailsQuery(defaultActivePlan as SubscriptionType);
    render(<Component />, {
      apolloMocks: (defaultMocks) => defaultMocks.concat([requestPaymentsMock, requestPlanDetailsMock]),
    });

    expect(await screen.findByText('MockLastName Visa **** 9999')).toBeInTheDocument();
  });

  describe('subscription is active', () => {
    it('should render next renewal date', async () => {
      const relayEnvironment = getRelayEnv();
      const requestMock = resolveSubscriptionDetailsQuery(relayEnvironment);
      render(<Component />, { relayEnvironment, apolloMocks: append(requestMock) });

      expect(await screen.findByText(matchTextContent(/next renewal:.*january 01, 2099/gi))).toBeInTheDocument();
    });

    it('should not render cancellation date', async () => {
      const relayEnvironment = getRelayEnv();
      const requestMock = resolveSubscriptionDetailsQuery(relayEnvironment);
      render(<Component />, { relayEnvironment, apolloMocks: append(requestMock) });

      expect(screen.queryByText(/expiry date:/gi)).not.toBeInTheDocument();
    });
  });

  describe('subscription is canceled', () => {
    it('should render cancellation date', async () => {
      const relayEnvironment = getRelayEnv();
      const requestMock = resolveSubscriptionDetailsQueryWithSubscriptionCanceled(relayEnvironment);
      render(<Component />, { relayEnvironment, apolloMocks: append(requestMock) });

      expect(await screen.findByText(matchTextContent(/expiry date:.*january 01, 2099/gi))).toBeInTheDocument();
    });

    it('should not render next renewal date', async () => {
      const relayEnvironment = getRelayEnv();
      const requestMock = resolveSubscriptionDetailsQueryWithSubscriptionCanceled(relayEnvironment);
      render(<Component />, { relayEnvironment, apolloMocks: append(requestMock) });

      expect(screen.queryByText(/next renewal/gi)).not.toBeInTheDocument();
    });
  });

  describe('edit subscription button', () => {
    it('should navigate to change plan screen', async () => {
      const relayEnvironment = getRelayEnv();
      const requestMock = resolveSubscriptionDetailsQuery(relayEnvironment);
      render(<Component />, { relayEnvironment, apolloMocks: append(requestMock) });

      await userEvent.click(await screen.findByText(/edit subscription/i));
      expect(screen.getByTestId(EDIT_PLACEHOLDER_ID)).toBeInTheDocument();
    });
  });

  describe('cancel subscription button', () => {
    it('should be hidden if subscription is already canceled', async () => {
      const relayEnvironment = getRelayEnv();
      const requestMock = resolveSubscriptionDetailsQueryWithSubscriptionCanceled(relayEnvironment);
      render(<Component />, { relayEnvironment, apolloMocks: append(requestMock) });

      expect(screen.queryByText(/cancel subscription/gi)).not.toBeInTheDocument();
    });

    it('should be hidden if user is on free plan', async () => {
      const phases = [
        subscriptionPhaseFactory({
          item: {
            price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }),
          },
        }),
      ];

      const relayEnvironment = getRelayEnv();
      const requestMock = fillSubscriptionScheduleQueryWithPhases(relayEnvironment, phases);
      render(<Component />, { relayEnvironment, apolloMocks: append(requestMock) });

      expect(screen.queryByText(/cancel subscription/gi)).not.toBeInTheDocument();
    });

    it('should navigate to cancel subscription screen', async () => {
      const activeSubscription = subscriptionFactory();

      const relayEnvironment = getRelayEnv();
      const requestMock = fillSubscriptionScheduleQuery(relayEnvironment, activeSubscription);
      render(<Component />, { relayEnvironment, apolloMocks: append(requestMock) });

      await userEvent.click(await screen.findByText(/cancel subscription/i));
      expect(screen.getByTestId(CANCEL_PLACEHOLDER_ID)).toBeInTheDocument();
    });
  });

  describe('trial section', () => {
    it('shouldnt be displayed if user has no trial active', async () => {
      const relayEnvironment = getRelayEnv();
      const { waitForApolloMocks } = render(<Component />, { relayEnvironment });
      await waitForApolloMocks();
      await act(() => {
        resolveSubscriptionDetailsQuery(relayEnvironment);
      });
      expect(screen.queryByText(/free trial info/gi)).not.toBeInTheDocument();
    });

    it('should be displayed if user has  trial active', async () => {
      const activeSubscription = subscriptionFactory({
        subscription: {
          trialEnd: new Date('Jan 1, 2099 GMT').toISOString(),
        },
        phases: [
          subscriptionPhaseFactory({
            endDate: new Date('Jan 1, 2099 GMT').toISOString(),
            item: { price: { product: { name: SubscriptionPlanName.MONTHLY } } },
          }),
        ],
      });

      const relayEnvironment = getRelayEnv();
      const requestMock = fillSubscriptionScheduleQuery(relayEnvironment, activeSubscription);
      render(<Component />, { relayEnvironment, apolloMocks: append(requestMock) });

      expect(
        await screen.findByText(matchTextContent(/free trial info.*expiry date.*january 01, 2099/gi))
      ).toBeInTheDocument();
    });
  });
});
