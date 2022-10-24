import { configureStore, Store } from '@reduxjs/toolkit';
import createReducer from '../reducers';

export default function (initialState = {}): Store {
  const defaultMiddlewareOptions = {
    serializableCheck: {
      ignoredActionPaths: ['meta.promise'],
    },
  };

  return configureStore({
    reducer: createReducer(),
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(defaultMiddlewareOptions),
  });
}
