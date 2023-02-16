import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { append } from 'ramda';
import { Route, Routes } from 'react-router-dom';

import {
  fillActivePlanDetailsQuery,
  fillAllPaymentsMethodsQuery,
  fillSubscriptionScheduleQuery,
  fillSubscriptionScheduleQueryWithPhases,
  paymentMethodFactory,
  subscriptionFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../../mocks/factories';
import {
  SubscriptionPlanName,
  Subscription as SubscriptionType,
} from '../../../../shared/services/api/subscription/types';
import { matchTextContent } from '../../../../tests/utils/match';
import { render } from '../../../../tests/utils/rendering';
import { ActiveSubscriptionContext } from '../../activeSubscriptionContext/activeSubscriptionContext.component';
import { Subscriptions } from '../subscriptions.component';

const defaultPaymentPlan = [paymentMethodFactory()];

const defaultActivePlan = {
  defaultPaymentMethod: {
    id: defaultPaymentPlan[0].id,
  },
};

const resolveSubscriptionDetailsQuery = () => {
  return fillSubscriptionScheduleQueryWithPhases([
    subscriptionPhaseFactory({
      endDate: new Date('Jan 1, 2099 GMT').toISOString(),
      item: { price: { product: { name: SubscriptionPlanName.FREE } } },
    }),
  ]);
};

const resolveSubscriptionDetailsQueryWithSubscriptionCanceled = () => {
  return fillSubscriptionScheduleQueryWithPhases([
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
    const requestMock = resolveSubscriptionDetailsQuery();
    render(<Component />, { apolloMocks: append(requestMock) });

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
      const requestMock = resolveSubscriptionDetailsQuery();
      render(<Component />, { apolloMocks: append(requestMock) });

      expect(await screen.findByText(matchTextContent(/next renewal:.*january 01, 2099/gi))).toBeInTheDocument();
    });

    it('should not render cancellation date', async () => {
      const requestMock = resolveSubscriptionDetailsQuery();
      render(<Component />, { apolloMocks: append(requestMock) });

      expect(screen.queryByText(/expiry date:/gi)).not.toBeInTheDocument();
    });
  });

  describe('subscription is canceled', () => {
    it('should render cancellation date', async () => {
      const requestMock = resolveSubscriptionDetailsQueryWithSubscriptionCanceled();
      render(<Component />, { apolloMocks: append(requestMock) });

      expect(await screen.findByText(matchTextContent(/expiry date:.*january 01, 2099/gi))).toBeInTheDocument();
    });

    it('should not render next renewal date', async () => {
      const requestMock = resolveSubscriptionDetailsQueryWithSubscriptionCanceled();
      render(<Component />, { apolloMocks: append(requestMock) });

      expect(screen.queryByText(/next renewal/gi)).not.toBeInTheDocument();
    });
  });

  describe('edit subscription button', () => {
    it('should navigate to change plan screen', async () => {
      const requestMock = resolveSubscriptionDetailsQuery();
      render(<Component />, { apolloMocks: append(requestMock) });

      await userEvent.click(await screen.findByText(/edit subscription/i));
      expect(screen.getByTestId(EDIT_PLACEHOLDER_ID)).toBeInTheDocument();
    });
  });

  describe('cancel subscription button', () => {
    it('should be hidden if subscription is already canceled', async () => {
      const requestMock = resolveSubscriptionDetailsQueryWithSubscriptionCanceled();
      render(<Component />, { apolloMocks: append(requestMock) });

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

      const requestMock = fillSubscriptionScheduleQueryWithPhases(phases);
      render(<Component />, { apolloMocks: append(requestMock) });

      expect(screen.queryByText(/cancel subscription/gi)).not.toBeInTheDocument();
    });

    it('should navigate to cancel subscription screen', async () => {
      const activeSubscription = subscriptionFactory();

      const requestMock = fillSubscriptionScheduleQuery(activeSubscription);
      render(<Component />, { apolloMocks: append(requestMock) });

      await userEvent.click(await screen.findByText(/cancel subscription/i));
      expect(screen.getByTestId(CANCEL_PLACEHOLDER_ID)).toBeInTheDocument();
    });
  });

  describe('trial section', () => {
    it('shouldnt be displayed if user has no trial active', async () => {
      const { waitForApolloMocks } = render(<Component />);
      await waitForApolloMocks();
      await act(() => {
        resolveSubscriptionDetailsQuery();
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

      const requestMock = fillSubscriptionScheduleQuery(activeSubscription);
      render(<Component />, { apolloMocks: append(requestMock) });

      expect(
        await screen.findByText(matchTextContent(/free trial info.*expiry date.*january 01, 2099/gi))
      ).toBeInTheDocument();
    });
  });
});
