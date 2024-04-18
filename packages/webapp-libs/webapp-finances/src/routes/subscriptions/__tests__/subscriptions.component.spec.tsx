import { SubscriptionPlanName, Subscription as SubscriptionType } from '@sb/webapp-api-client/api/subscription/types';
import {
  currentUserFactory,
  fillCommonQueryWithUser,
  paymentMethodFactory,
  subscriptionFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '@sb/webapp-api-client/tests/factories';
import { matchTextContent } from '@sb/webapp-core/tests/utils/match';
import { getTenantPath, getTenantPathHelper } from '@sb/webapp-core/utils';
import { tenantFactory } from '@sb/webapp-tenants/tests/factories/tenant';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { append } from 'ramda';
import { Route, Routes } from 'react-router-dom';

import { ActiveSubscriptionContext } from '../../../components/activeSubscriptionContext';
import { RoutesConfig } from '../../../config/routes';
import { CurrentSubscriptionContent, PaymentMethodContent, TransactionsHistoryContent } from '../../../routes';
import {
  fillActivePlanDetailsQuery,
  fillAllStripeChargesQuery,
  fillSubscriptionScheduleQuery,
  fillSubscriptionScheduleQueryWithPhases,
} from '../../../tests/factories';
import { createMockRouterProps, render } from '../../../tests/utils/rendering';
import { Subscriptions } from '../currentSubscription.component';

const paymentMethodsMock = [paymentMethodFactory()];

const defaultActivePlan = {
  id: paymentMethodsMock[0].id,
  defaultPaymentMethod: {
    id: paymentMethodsMock[0].id,
  },
};

const resolveSubscriptionDetailsQuery = (tenantId = 'tenantId') => {
  return fillSubscriptionScheduleQueryWithPhases(
    [
      subscriptionPhaseFactory({
        endDate: new Date('Jan 1, 2099 GMT').toISOString(),
        item: { price: { product: { name: SubscriptionPlanName.FREE } } },
      }),
    ],
    undefined,
    tenantId
  );
};

const resolveSubscriptionDetailsQueryWithSubscriptionCanceled = (tenantId = 'tenantId') => {
  return fillSubscriptionScheduleQueryWithPhases(
    [
      subscriptionPhaseFactory({
        endDate: new Date('Jan 1, 2099 GMT').toISOString(),
        item: { price: { product: { name: SubscriptionPlanName.MONTHLY } } },
      }),
      subscriptionPhaseFactory({
        startDate: new Date('Jan 1, 2099 GMT').toISOString(),
        item: { price: { product: { name: SubscriptionPlanName.FREE } } },
      }),
    ],
    undefined,
    tenantId
  );
};

const resolveActiveSubscriptionMocks = (
  tenantId = 'tenantId',
  subscription = defaultActivePlan as SubscriptionType
) => {
  const activePlanMock = fillActivePlanDetailsQuery(subscription, tenantId);
  const stripeChargesMock = fillAllStripeChargesQuery();
  return [activePlanMock, stripeChargesMock];
};

const CANCEL_PLACEHOLDER_ID = 'cancel';
const EDIT_PLACEHOLDER_ID = 'edit';

const Component = () => (
  <Routes>
    <Route element={<ActiveSubscriptionContext />}>
      <Route element={<Subscriptions />}>
        <Route
          index
          path={getTenantPathHelper(RoutesConfig.subscriptions.index)}
          element={<CurrentSubscriptionContent />}
        />
        <Route
          path={getTenantPathHelper(RoutesConfig.subscriptions.paymentMethods.index)}
          element={<PaymentMethodContent />}
        />
        <Route
          path={getTenantPathHelper(RoutesConfig.subscriptions.transactionHistory.index)}
          element={<TransactionsHistoryContent />}
        />
      </Route>
      <Route
        path={getTenantPathHelper(RoutesConfig.subscriptions.currentSubscription.cancel)}
        element={<span data-testid={CANCEL_PLACEHOLDER_ID} />}
      />
      <Route
        path={getTenantPathHelper(RoutesConfig.subscriptions.currentSubscription.edit)}
        element={<span data-testid={EDIT_PLACEHOLDER_ID} />}
      />
    </Route>
  </Routes>
);

const tenantId = 'tenantId';
const currentSubscriptionTabPath = RoutesConfig.subscriptions.index;
const currentSubscriptionTabRouterProps = createMockRouterProps(getTenantPath(currentSubscriptionTabPath), {
  tenantId,
});

describe('Subscriptions: Component', () => {
  it('should render current subscription plan', async () => {
    const requestMock = resolveSubscriptionDetailsQuery();

    const tenantMock = fillCommonQueryWithUser(
      currentUserFactory({
        tenants: [
          tenantFactory({
            id: tenantId,
          }),
        ],
      })
    );

    render(<Component />, {
      apolloMocks: [tenantMock, requestMock, ...resolveActiveSubscriptionMocks(tenantId)],
      routerProps: currentSubscriptionTabRouterProps,
    });

    expect(await screen.findByText(matchTextContent(/current plan:.*free/i))).toBeInTheDocument();
  });

  it('should render default payment method', async () => {
    const tenantMock = fillCommonQueryWithUser(
      currentUserFactory({
        tenants: [
          tenantFactory({
            id: tenantId,
          }),
        ],
      })
    );
    const subscription = subscriptionFactory({
      defaultPaymentMethod: paymentMethodsMock[0],
    });
    const requestSubscriptionScheduleMock = fillSubscriptionScheduleQuery(subscription, paymentMethodsMock, tenantId);

    const { waitForApolloMocks } = render(<Component />, {
      apolloMocks: [requestSubscriptionScheduleMock, tenantMock],
      routerProps: currentSubscriptionTabRouterProps,
    });

    await waitForApolloMocks();

    await userEvent.click(await screen.findByText('Payment methods'));

    expect(await screen.findByText('MockLastName Visa **** 9999')).toBeInTheDocument();
  });

  describe('subscription is active', () => {
    it('should render next renewal date', async () => {
      const requestMock = resolveSubscriptionDetailsQuery();

      const tenantMock = fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [
            tenantFactory({
              id: tenantId,
            }),
          ],
        })
      );

      render(<Component />, {
        apolloMocks: [tenantMock, requestMock, ...resolveActiveSubscriptionMocks(tenantId)],
        routerProps: currentSubscriptionTabRouterProps,
      });

      expect(await screen.findByText(matchTextContent(/next renewal:.*january 01, 2099/i))).toBeInTheDocument();
    });

    it('should not render cancellation date', async () => {
      const requestMock = resolveSubscriptionDetailsQuery();
      render(<Component />, { apolloMocks: append(requestMock), routerProps: currentSubscriptionTabRouterProps });

      expect(screen.queryByText(/expiry date:/i)).not.toBeInTheDocument();
    });
  });

  describe('subscription is canceled', () => {
    it('should render cancellation date', async () => {
      const requestMock = resolveSubscriptionDetailsQueryWithSubscriptionCanceled();

      const tenantMock = fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [
            tenantFactory({
              id: tenantId,
            }),
          ],
        })
      );

      render(<Component />, {
        apolloMocks: [tenantMock, requestMock, ...resolveActiveSubscriptionMocks(tenantId)],
        routerProps: currentSubscriptionTabRouterProps,
      });

      expect(await screen.findByText(matchTextContent(/expiry date:.*january 01, 2099/i))).toBeInTheDocument();
    });

    it('should not render next renewal date', async () => {
      const requestMock = resolveSubscriptionDetailsQueryWithSubscriptionCanceled();
      render(<Component />, { apolloMocks: append(requestMock), routerProps: currentSubscriptionTabRouterProps });

      expect(screen.queryByText(/next renewal/i)).not.toBeInTheDocument();
    });
  });

  describe('edit subscription button', () => {
    it('should navigate to change plan screen', async () => {
      const tenantMock = fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [
            tenantFactory({
              id: tenantId,
            }),
          ],
        })
      );
      const requestMock = resolveSubscriptionDetailsQuery();

      render(<Component />, {
        apolloMocks: [tenantMock, requestMock, ...resolveActiveSubscriptionMocks(tenantId)],
        routerProps: currentSubscriptionTabRouterProps,
      });

      await userEvent.click(await screen.findByText(/edit subscription/i));
      expect(screen.getByTestId(EDIT_PLACEHOLDER_ID)).toBeInTheDocument();
    });
  });

  describe('cancel subscription button', () => {
    it('should be hidden if subscription is already canceled', async () => {
      const requestMock = resolveSubscriptionDetailsQueryWithSubscriptionCanceled();
      render(<Component />, { apolloMocks: append(requestMock), routerProps: currentSubscriptionTabRouterProps });

      expect(screen.queryByText(/cancel subscription/i)).not.toBeInTheDocument();
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
      render(<Component />, { apolloMocks: append(requestMock), routerProps: currentSubscriptionTabRouterProps });

      expect(screen.queryByText(/cancel subscription/i)).not.toBeInTheDocument();
    });

    it('should navigate to cancel subscription screen', async () => {
      const tenantMock = fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [
            tenantFactory({
              id: tenantId,
            }),
          ],
        })
      );
      const activeSubscription = subscriptionFactory();

      const requestMock = fillSubscriptionScheduleQuery(activeSubscription);

      render(<Component />, {
        apolloMocks: [tenantMock, requestMock, ...resolveActiveSubscriptionMocks(tenantId)],
        routerProps: currentSubscriptionTabRouterProps,
      });

      await userEvent.click(await screen.findByText(/cancel subscription/i));
      expect(screen.getByTestId(CANCEL_PLACEHOLDER_ID)).toBeInTheDocument();
    });
  });

  describe('trial section', () => {
    it('shouldnt be displayed if user has no trial active', async () => {
      const requestMock = resolveSubscriptionDetailsQuery(tenantId);

      const tenantMock = fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [
            tenantFactory({
              id: tenantId,
            }),
          ],
        })
      );

      const { waitForApolloMocks } = render(<Component />, {
        apolloMocks: [tenantMock, requestMock, ...resolveActiveSubscriptionMocks(tenantId)],
        routerProps: currentSubscriptionTabRouterProps,
      });
      await waitForApolloMocks(1);

      expect(screen.queryByText(/Free trial expiry date/i)).not.toBeInTheDocument();
    });

    it('should be displayed if user has trial active', async () => {
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

      const requestMock = fillSubscriptionScheduleQuery(activeSubscription, undefined, tenantId);

      const tenantMock = fillCommonQueryWithUser(
        currentUserFactory({
          tenants: [
            tenantFactory({
              id: tenantId,
            }),
          ],
        })
      );

      render(<Component />, {
        apolloMocks: [tenantMock, requestMock, ...resolveActiveSubscriptionMocks(tenantId)],
        routerProps: currentSubscriptionTabRouterProps,
      });

      expect(
        await screen.findByText(matchTextContent(/Free trial expiry date.*january 01, 2099/i))
      ).toBeInTheDocument();
    });
  });
});
