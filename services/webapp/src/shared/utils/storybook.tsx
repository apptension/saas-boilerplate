import React from 'react';
import { Action, createStore } from 'redux';
import { Provider } from 'react-redux';
import { createReducer, Reducer } from '@reduxjs/toolkit';
import { Story } from '@storybook/react';

import { store } from '../../mocks/store';
import { GlobalState } from '../../config/reducers';

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
