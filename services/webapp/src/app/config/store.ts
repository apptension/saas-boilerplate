import { configureStore as baseConfigureStore, getDefaultMiddleware, Store } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import * as Sentry from '@sentry/react';
import { promiseMiddleware } from '../../shared/utils/reduxSagaPromise';
import createReducer from './reducers';
import rootSaga from './sagas';

export default function configureStore(initialState = {}): Store {
  const sagaMiddleware = createSagaMiddleware();

  const middlewares = [promiseMiddleware, sagaMiddleware];

  const defaultMiddlewareOptions = {
    serializableCheck: {
      ignoredActionPaths: ['meta.promise'],
    },
  };

  const sentryReduxEnhancer = Sentry.createReduxEnhancer();

  const store = baseConfigureStore({
    reducer: createReducer(),
    preloadedState: initialState,
    enhancers: [sentryReduxEnhancer],
    middleware: getDefaultMiddleware(defaultMiddlewareOptions).concat(middlewares),
  });

  sagaMiddleware.run(rootSaga);

  return store;
}
