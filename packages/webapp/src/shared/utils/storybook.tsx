import { Reducer, Store, createReducer } from '@reduxjs/toolkit';
import { Story } from '@storybook/react';
import { Elements } from '@stripe/react-stripe-js';
import { produce } from 'immer';
import { Suspense } from 'react';
import { Provider } from 'react-redux';
import { RelayEnvironmentProvider } from 'react-relay';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { createStore } from 'redux';
import { RelayMockEnvironment, createMockEnvironment } from 'relay-test-utils';

import { GlobalState } from '../../app/config/reducers';
import { store } from '../../mocks/store';
import { ActiveSubscriptionContext } from '../../routes/finances/activeSubscriptionContext/activeSubscriptionContext.component';
import {
  DefaultReduxState,
  DefaultTestProviders,
  DefaultTestProvidersProps,
  WrapperProps,
  getWrapper,
} from '../../tests/utils/rendering';
import { stripePromise } from '../services/stripe';

export const withRedux =
  (initialState: GlobalState | ((draft: GlobalState) => void) = store, reducer: Reducer | null = null) =>
  (StoryComponent: Story) => {
    const state = typeof initialState === 'function' ? produce(store, initialState) : initialState;
    const createdStore = createStore(reducer ?? createReducer(state, {}));
    return (
      <Provider store={createdStore}>
        <StoryComponent />
      </Provider>
    );
  };

export const withRelay =
  (environmentArg?: RelayMockEnvironment | ((env: RelayMockEnvironment) => void)) => (StoryComponent: Story) => {
    const environment = (() => {
      if (typeof environmentArg === 'function') {
        const envToMutate = createMockEnvironment();
        environmentArg(envToMutate);
        return envToMutate;
      }
      if (environmentArg !== undefined) {
        return environmentArg;
      }
      return createMockEnvironment();
    })();

    return (
      <RelayEnvironmentProvider environment={environment}>
        <StoryComponent />
      </RelayEnvironmentProvider>
    );
  };

export const withSuspense = (StoryComponent: Story) => (
  <Suspense fallback={<span>Loading</span>}>
    <StoryComponent />
  </Suspense>
);

export const withActiveSubscriptionContext = (StoryComponent: Story) => {
  return (
    <Routes>
      <Route element={<ActiveSubscriptionContext />}>
        <Route
          index
          element={
            <Elements stripe={stripePromise}>
              <Suspense fallback={null}>
                <StoryComponent />
              </Suspense>
            </Elements>
          }
        />
      </Route>
    </Routes>
  );
};

export function withProviders<
  ReduxState extends Store = DefaultReduxState,
  P extends DefaultTestProvidersProps<ReduxState> = DefaultTestProvidersProps<ReduxState>
>(wrapperProps: WrapperProps<ReduxState, P> = {}) {
  return (StoryComponent: Story, storyContext: any) => {
    const { wrapper: WrapperComponent } = getWrapper(DefaultTestProviders, wrapperProps, storyContext) as any;
    return (
      <WrapperComponent>
        <StoryComponent />
      </WrapperComponent>
    );
  };
}
