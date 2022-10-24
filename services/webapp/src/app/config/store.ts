import { configureStore as baseConfigureStore, Store } from '@reduxjs/toolkit';
import * as Sentry from '@sentry/react';
import createReducer from './reducers';

export default function configureStore(initialState = {}): Store {
  const defaultMiddlewareOptions = {
    serializableCheck: {
      ignoredActionPaths: ['meta.promise'],
    },
  };

  const sentryReduxEnhancer = Sentry.createReduxEnhancer();

  return baseConfigureStore({
    reducer: createReducer(),
    preloadedState: initialState,
    enhancers: [sentryReduxEnhancer],
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(defaultMiddlewareOptions),
  });
}
