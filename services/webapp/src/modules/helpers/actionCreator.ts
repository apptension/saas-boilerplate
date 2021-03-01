import { createAction } from '@reduxjs/toolkit';
import { createActionRoutine, createPromiseAction } from '../../shared/utils/reduxSagaPromise';

export const actionCreator = (prefix: string) => {
  const prefixActionName = (actionName: string) => [prefix, actionName].join('/');

  return {
    createAction: <T>(actionName: string) => createAction<T>(prefixActionName(actionName)),
    createPromiseAction: <T = void, A = void, B = any>(actionName: string) =>
      createPromiseAction<T, A, B>(prefixActionName(actionName)),
    createActionRoutine: <T = void, A = void, B = any>(actionName: string) =>
      createActionRoutine<T, A, B>(prefixActionName(actionName)),
  };
};
