import { configureStore, getDefaultMiddleware, Store } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import { promiseMiddleware } from '../shared/utils/reduxSagaPromise';
import createReducer from './reducers';
import rootSaga from './sagas';

export default function (initialState = {}): Store {
  const sagaMiddleware = createSagaMiddleware();

  const middlewares = [promiseMiddleware, sagaMiddleware];

  const store = configureStore({
    reducer: createReducer(),
    preloadedState: initialState,
    middleware: getDefaultMiddleware().concat(middlewares),
  });

  sagaMiddleware.run(rootSaga);

  return store;
}
