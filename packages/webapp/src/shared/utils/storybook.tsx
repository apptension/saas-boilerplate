import { Story } from '@storybook/react';
import { Elements } from '@stripe/react-stripe-js';
import { Route, Routes } from 'react-router-dom';

import { DefaultTestProviders, DefaultTestProvidersProps, WrapperProps, getWrapper } from '../../tests/utils/rendering';
import { ActiveSubscriptionContext } from '../../routes/finances/activeSubscriptionContext/activeSubscriptionContext.component';
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

export function withProviders<P extends DefaultTestProvidersProps = DefaultTestProvidersProps>(
  wrapperProps: WrapperProps<P> = {}
) {
  return (StoryComponent: Story, storyContext: any) => {
    const { wrapper: WrapperComponent } = getWrapper(DefaultTestProviders, wrapperProps, storyContext) as any;

    return (
      <WrapperComponent>
        <StoryComponent />
      </WrapperComponent>
    );
  };
}
