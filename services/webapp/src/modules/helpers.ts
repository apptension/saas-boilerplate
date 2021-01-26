import { createAction } from '@reduxjs/toolkit';

import { createPromiseAction } from '../shared/utils/reduxSagaPromise';

export const actionCreator = (prefix: string) => {
  const prefixActionName = (actionName: string) => [prefix, actionName].join('/');

  return {
    createAction: <T>(actionName: string) => createAction<T>(prefixActionName(actionName)),
    createPromiseAction: <T = void, A = void, B = void>(actionName: string) =>
      createPromiseAction<T, A, B>(prefixActionName(actionName)),
  };
};
