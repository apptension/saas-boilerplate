import { createAction } from '@reduxjs/toolkit';

export const actionCreator = (prefix: string) => {
  const prefixActionName = (actionName: string) => [prefix, actionName].join('/');

  return {
    createAction: <T>(actionName: string) => createAction<T>(prefixActionName(actionName)),
  };
};
