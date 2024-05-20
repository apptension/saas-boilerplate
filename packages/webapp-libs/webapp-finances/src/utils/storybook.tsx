import { StoryFn } from '@storybook/react';
import { Elements } from '@stripe/react-stripe-js';
import { Route, Routes } from 'react-router-dom';

import { ActiveSubscriptionContext } from '../components/activeSubscriptionContext';
import { stripePromise } from '../services/stripe';
import { WrapperProps, getWrapper } from '../tests/utils/rendering';

export const withActiveSubscriptionContext = (StoryComponent: StoryFn) => {
  return (
    <Routes>
      <Route element={<ActiveSubscriptionContext />}>
        <Route
          index
          element={
            <Elements stripe={stripePromise} options={{ locale: 'en' }}>
              <StoryComponent />
            </Elements>
          }
        />
      </Route>
    </Routes>
  );
};

export function withProviders(wrapperProps: WrapperProps = {}) {
  return (StoryComponent: StoryFn) => {
    const { wrapper: WrapperComponent } = getWrapper(wrapperProps) as any;

    return (
      <WrapperComponent {...wrapperProps}>
        <StoryComponent />
      </WrapperComponent>
    );
  };
}
