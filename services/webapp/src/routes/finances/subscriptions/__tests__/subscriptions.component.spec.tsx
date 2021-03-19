import React from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeContextRenderer, spiedHistory } from '../../../../shared/utils/testUtils';
import { Subscriptions } from '../subscriptions.component';
import { prepareState } from '../../../../mocks/store';
import { subscriptionFactory } from '../../../../mocks/factories';
import { SubscriptionPlanName } from '../../../../shared/services/api/subscription/types';

const store = prepareState((state) => {
  state.subscription.activeSubscription = subscriptionFactory({
    currentPeriodEnd: '2020-10-10',
    item: {
      price: {
        product: {
          name: SubscriptionPlanName.FREE,
        },
      },
    },
  });
});

describe('Subscriptions: Component', () => {
  const component = () => <Subscriptions />;
  const render = makeContextRenderer(component);

  it('should render current subscription plan', () => {
    render({}, { store });
    expect(screen.getByText(/active plan.+free/gi)).toBeInTheDocument();
  });

  it('should render next renewal date', () => {
    render({}, { store });
    expect(screen.getByText(/next renewal.+2020-10-10/gi)).toBeInTheDocument();
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
    it('should be hidden if user is on free plan', () => {
      const store = prepareState((state) => {
        state.subscription.activeSubscription = subscriptionFactory({
          item: {
            price: {
              product: {
                name: SubscriptionPlanName.FREE,
              },
            },
          },
        });
      });

      render({}, { store });
      expect(screen.queryByText(/cancel subscription/gi)).not.toBeInTheDocument();
    });

    it('should navigate to cancel subscription screen', () => {
      const store = prepareState((state) => {
        state.subscription.activeSubscription = subscriptionFactory({
          item: {
            price: {
              product: {
                name: SubscriptionPlanName.MONTHLY,
              },
            },
          },
        });
      });

      const { history, pushSpy } = spiedHistory();
      render({}, { store, router: { history } });

      userEvent.click(screen.getByText(/cancel subscription/gi));
      expect(pushSpy).toHaveBeenCalledWith('/en/subscriptions/cancel');
    });
  });
});
