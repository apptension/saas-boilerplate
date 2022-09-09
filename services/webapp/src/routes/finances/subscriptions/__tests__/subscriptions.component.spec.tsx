import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockEnvironment, RelayMockEnvironment } from 'relay-test-utils';
import { Routes, Route } from 'react-router-dom';

import { matchTextContent, packHistoryArgs, spiedHistory } from '../../../../shared/utils/testUtils';
import { render } from '../../../../tests/utils/rendering';
import { Subscriptions } from '../subscriptions.component';
import { prepareState } from '../../../../mocks/store';
import {
  paymentMethodFactory,
  subscriptionFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
  fillSubscriptionScheduleQuery,
  fillSubscriptionScheduleQueryWithPhases,
} from '../../../../mocks/factories';
import { SubscriptionPlanName } from '../../../../shared/services/api/subscription/types';
import { fillCommonQueryWithUser } from '../../../../shared/utils/commonQuery';
import { ActiveSubscriptionContext } from '../../activeSubscriptionContext/activeSubscriptionContext.component';

const getRelayEnv = () => {
  const relayEnvironment = createMockEnvironment();
  fillCommonQueryWithUser(relayEnvironment);
  return relayEnvironment;
};

const reduxInitialState = prepareState((state) => {
  state.subscription.activeSubscription = subscriptionFactory({
    defaultPaymentMethod: paymentMethodFactory({ billingDetails: { name: 'Owner' }, card: { last4: '1234' } }),
    phases: [
      subscriptionPhaseFactory({
        endDate: new Date('Jan 1, 2099 GMT').toISOString(),
        item: { price: { product: { name: SubscriptionPlanName.FREE } } },
      }),
    ],
  });
});

const resolveSubscriptionDetailsQuery = (relayEnvironment: RelayMockEnvironment) => {
  fillSubscriptionScheduleQueryWithPhases(relayEnvironment, [
    subscriptionPhaseFactory({
      endDate: new Date('Jan 1, 2099 GMT').toISOString(),
      item: { price: { product: { name: SubscriptionPlanName.FREE } } },
    }),
  ]);
};

const resolveSubscriptionDetailsQueryWithSubscriptionCanceled = (relayEnvironment: RelayMockEnvironment) => {
  fillSubscriptionScheduleQueryWithPhases(relayEnvironment, [
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

const Component = () => (
  <Routes>
    <Route element={<ActiveSubscriptionContext />}>
      <Route index element={<Subscriptions />} />
    </Route>
  </Routes>
);

describe('Subscriptions: Component', () => {
  it('should render current subscription plan', async () => {
    const relayEnvironment = getRelayEnv();
    render(<Component />, { relayEnvironment });

    await act(() => {
      resolveSubscriptionDetailsQuery(relayEnvironment);
    });

    await waitFor(() => {
      expect(screen.getByText(matchTextContent(/current plan:.*free/gi))).toBeInTheDocument();
    });
  });

  it('should render default payment method', async () => {
    const relayEnvironment = getRelayEnv();
    render(<Component />, { reduxInitialState, relayEnvironment });

    await act(() => {
      resolveSubscriptionDetailsQuery(relayEnvironment);
    });

    await waitFor(() => {
      expect(screen.getByText('Owner Visa **** 1234')).toBeInTheDocument();
    });
  });

  describe('subscription is active', () => {
    it('should render next renewal date', async () => {
      const relayEnvironment = getRelayEnv();
      render(<Component />, { relayEnvironment });

      await act(() => {
        resolveSubscriptionDetailsQuery(relayEnvironment);
      });
      await waitFor(() => {
        expect(screen.getByText(matchTextContent(/next renewal:.*january 01, 2099/gi))).toBeInTheDocument();
      });
    });

    it('should not render cancellation date', async () => {
      const relayEnvironment = getRelayEnv();
      render(<Component />, { relayEnvironment });

      await act(() => {
        resolveSubscriptionDetailsQuery(relayEnvironment);
      });
      await waitFor(() => {
        expect(screen.queryByText(/expiry date:/gi)).not.toBeInTheDocument();
      });
    });
  });

  describe('subscription is canceled', () => {
    it('should render cancellation date', async () => {
      const relayEnvironment = getRelayEnv();
      render(<Component />, { relayEnvironment });
      await act(() => {
        resolveSubscriptionDetailsQueryWithSubscriptionCanceled(relayEnvironment);
      });

      await waitFor(() => {
        expect(screen.getByText(matchTextContent(/expiry date:.*january 01, 2099/gi))).toBeInTheDocument();
      });
    });

    it('should not render next renewal date', async () => {
      const relayEnvironment = getRelayEnv();
      render(<Component />, { relayEnvironment });
      await act(() => {
        resolveSubscriptionDetailsQueryWithSubscriptionCanceled(relayEnvironment);
      });

      await waitFor(() => {
        expect(screen.queryByText(/next renewal/gi)).not.toBeInTheDocument();
      });
    });
  });

  describe('edit subscription button', () => {
    it('should navigate to change plan screen', async () => {
      const { history, pushSpy } = spiedHistory('/');

      const relayEnvironment = getRelayEnv();
      render(<Component />, { relayEnvironment, routerHistory: history });

      await act(() => {
        resolveSubscriptionDetailsQuery(relayEnvironment);
      });

      await userEvent.click(screen.getByText(/edit subscription/i));
      expect(pushSpy).toHaveBeenCalledWith(...packHistoryArgs('/en/subscriptions/edit'));
    });
  });

  describe('cancel subscription button', () => {
    it('should be hidden if subscription is already canceled', async () => {
      const relayEnvironment = getRelayEnv();
      render(<Component />, { relayEnvironment });
      await act(() => {
        resolveSubscriptionDetailsQueryWithSubscriptionCanceled(relayEnvironment);
      });
      await waitFor(() => {
        expect(screen.queryByText(/cancel subscription/gi)).not.toBeInTheDocument();
      });
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
      render(<Component />, { relayEnvironment });

      await act(() => {
        fillSubscriptionScheduleQueryWithPhases(relayEnvironment, phases);
      });

      expect(screen.queryByText(/cancel subscription/gi)).not.toBeInTheDocument();
    });

    it('should navigate to cancel subscription screen', async () => {
      const activeSubscription = subscriptionFactory();

      const relayEnvironment = getRelayEnv();
      const { history, pushSpy } = spiedHistory('/');
      render(<Component />, { relayEnvironment, routerHistory: history });

      await act(() => {
        fillSubscriptionScheduleQuery(relayEnvironment, activeSubscription);
      });

      await userEvent.click(screen.getByText(/cancel subscription/i));
      expect(pushSpy).toHaveBeenCalledWith(...packHistoryArgs('/en/subscriptions/cancel'));
    });
  });

  describe('trial section', () => {
    it('shouldnt be displayed if user has no trial active', async () => {
      const relayEnvironment = getRelayEnv();
      render(<Component />, { relayEnvironment });
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
      render(<Component />, { relayEnvironment });

      await act(() => {
        fillSubscriptionScheduleQuery(relayEnvironment, activeSubscription);
      });

      expect(
        screen.getByText(matchTextContent(/free trial info.*expiry date.*january 01, 2099/gi))
      ).toBeInTheDocument();
    });
  });
});
