import { ApiTestProviders } from '@sb/webapp-api-client/tests/utils/rendering';
import { Story } from '@storybook/react';
import { Elements } from '@stripe/react-stripe-js';
import { Route, Routes } from 'react-router-dom';

import { ActiveSubscriptionContext } from '../../routes/finances/activeSubscriptionContext/activeSubscriptionContext.component';
import { WrapperProps, getWrapper } from '../../tests/utils/rendering';
import { stripePromise } from '../services/stripe';

export const withActiveSubscriptionContext = (StoryComponent: Story) => {
  return (
    <Routes>
      <Route element={<ActiveSubscriptionContext />}>
        <Route
          index
          element={
            <Elements stripe={stripePromise}>
              <StoryComponent />
            </Elements>
          }
        />
      </Route>
    </Routes>
  );
};

export function withProviders(wrapperProps: WrapperProps = {}) {
  return (StoryComponent: Story) => {
    const { wrapper: WrapperComponent } = getWrapper(ApiTestProviders, wrapperProps) as any;

    return (
      <WrapperComponent {...wrapperProps}>
        <StoryComponent />
      </WrapperComponent>
    );
  };
}
