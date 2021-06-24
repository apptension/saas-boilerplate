import React from 'react';
import { Action, createStore } from 'redux';
import { Provider } from 'react-redux';
import { createReducer, Reducer } from '@reduxjs/toolkit';
import { Story } from '@storybook/react';
import { createMockEnvironment, RelayMockEnvironment } from 'relay-test-utils';
import { RelayEnvironmentProvider } from 'react-relay';
import { store } from '../../mocks/store';
import { GlobalState } from '../../config/reducers';
import { ContextData, ProvidersWrapper } from './testUtils';

export const withRedux = (initialState: GlobalState = store, reducer: Reducer | null = null) => (
  StoryComponent: Story
) => {
  const store = createStore<GlobalState, Action, unknown, unknown>(reducer ?? createReducer(initialState, {}));
  return (
    <Provider store={store}>
      <StoryComponent />
    </Provider>
  );
};

export const withRelay = (environmentArg?: RelayMockEnvironment | ((env: RelayMockEnvironment) => void)) => (
  StoryComponent: Story
) => {
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
