import React from 'react';

import { screen } from '@testing-library/react';
import { makeContextRenderer } from '../../../../shared/utils/testUtils';
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
});
