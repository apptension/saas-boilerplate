import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeContextRenderer, matchTextContent, spiedHistory } from '../../../../shared/utils/testUtils';
import { Subscriptions } from '../subscriptions.component';
import { prepareState } from '../../../../mocks/store';
import {
  paymentMethodFactory,
  subscriptionFactory,
  subscriptionPhaseFactory,
  subscriptionPlanFactory,
} from '../../../../mocks/factories';
import { SubscriptionPlanName } from '../../../../shared/services/api/subscription/types';

const store = prepareState((state) => {
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

const storeWithSubscriptionCanceled = prepareState((state) => {
  state.subscription.activeSubscription = subscriptionFactory({
    phases: [
      subscriptionPhaseFactory({
        endDate: new Date('Jan 1, 2099 GMT').toISOString(),
        item: { price: { product: { name: SubscriptionPlanName.MONTHLY } } },
      }),
      subscriptionPhaseFactory({
        startDate: new Date('Jan 1, 2099 GMT').toISOString(),
        item: { price: { product: { name: SubscriptionPlanName.FREE } } },
      }),
    ],
  });
});

describe('Subscriptions: Component', () => {
  const component = () => <Subscriptions />;
  const render = makeContextRenderer(component);

  it('should render current subscription plan', () => {
    render({}, { store });
    expect(screen.getByText(matchTextContent(/current plan:.*free/gi))).toBeInTheDocument();
  });

  it('should render default payment method', () => {
    render({}, { store });
    expect(screen.getByText('Owner Visa **** 1234')).toBeInTheDocument();
  });

  describe('subscription is active', () => {
    it('should render next renewal date', () => {
      render({}, { store });
      expect(screen.getByText(matchTextContent(/next renewal:.*january 01, 2099/gi))).toBeInTheDocument();
    });

    it('should not render cancelation date', () => {
      render({}, { store });
      expect(screen.queryByText(/expiry date:/gi)).not.toBeInTheDocument();
    });
  });

  describe('subscription is canceled', () => {
    it('should render cancelation date', () => {
      render({}, { store: storeWithSubscriptionCanceled });
      expect(screen.getByText(matchTextContent(/expiry date:.*january 01, 2099/gi))).toBeInTheDocument();
    });

    it('should not render next renewal date', () => {
      render({}, { store: storeWithSubscriptionCanceled });
      expect(screen.queryByText(/next renewal/gi)).not.toBeInTheDocument();
    });
  });

  describe('edit subscription button', () => {
    it('should navigate to change plan screen', () => {
      const { history, pushSpy } = spiedHistory();
      render({}, { router: { history } });

      userEvent.click(screen.getByText(/edit subscription/gi));
      expect(pushSpy).toHaveBeenCalledWith('/en/subscriptions/edit');
    });
  });

  describe('cancel subscription button', () => {
    it('should be hidden if subscription is already canceled', () => {
      render({}, { store: storeWithSubscriptionCanceled });
      expect(screen.queryByText(/cancel subscription/gi)).not.toBeInTheDocument();
    });

    it('should be hidden if user is on free plan', () => {
      const store = prepareState((state) => {
        state.subscription.activeSubscription = subscriptionFactory({
          phases: [
            subscriptionPhaseFactory({
              item: {
                price: subscriptionPlanFactory({ product: { name: SubscriptionPlanName.FREE } }),
              },
            }),
          ],
        });
      });

      render({}, { store });
      expect(screen.queryByText(/cancel subscription/gi)).not.toBeInTheDocument();
    });

    it('should navigate to cancel subscription screen', () => {
      const store = prepareState((state) => {
        state.subscription.activeSubscription = subscriptionFactory();
      });

      const { history, pushSpy } = spiedHistory();
      render({}, { store, router: { history } });

      userEvent.click(screen.getByText(/cancel subscription/gi));
      expect(pushSpy).toHaveBeenCalledWith('/en/subscriptions/cancel');
    });
  });

  describe('trial section', () => {
    it('shouldnt be displayed if user has no trial active', () => {
      render({}, { store });
      expect(screen.queryByText(/free trial info/gi)).not.toBeInTheDocument();
    });

    it('should be displayed if user has  trial active', () => {
      const store = prepareState((state) => {
        state.subscription.activeSubscription = subscriptionFactory({
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
      });

      render({}, { store });
      expect(
        screen.getByText(matchTextContent(/free trial info.*expiry date.*january 01, 2099/gi))
      ).toBeInTheDocument();
    });
  });
});
