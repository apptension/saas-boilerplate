import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { produce } from 'immer';
import { createReducer, Reducer } from '@reduxjs/toolkit';
import { Story } from '@storybook/react';
import { createMockEnvironment, RelayMockEnvironment } from 'relay-test-utils';
import { RelayEnvironmentProvider } from 'react-relay';
import { Suspense } from 'react';
import { store } from '../../mocks/store';
import { GlobalState } from '../../config/reducers';
import { ContextData, ProvidersWrapper } from './testUtils';

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

export const withProviders = (context?: ContextData) => (StoryComponent: Story) => {
  return (
    <ProvidersWrapper context={context}>
      <StoryComponent />
    </ProvidersWrapper>
  );
};

export const withSuspense = (StoryComponent: Story) => (
  <Suspense fallback={<span>Loading</span>}>
    <StoryComponent />
  </Suspense>
);
