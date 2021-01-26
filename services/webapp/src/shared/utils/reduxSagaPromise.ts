import {
  ActionCreatorWithPayload,
  ActionCreatorWithPreparedPayload,
  createAction,
  Middleware,
  PayloadAction,
  PrepareAction,
} from '@reduxjs/toolkit';
import { put } from 'redux-saga/effects';

import { GlobalState } from '../../config/reducers';

export interface PromiseActionMeta<A, B> {
  promise: {
    resolveAction: ActionCreatorWithPayload<A>;
    rejectAction: ActionCreatorWithPayload<B>;
    resolve?(value: A): void;
    reject?(value: B): void;
  };
}

export interface PromiseActionCreatorWithPayload<P, A, B> extends ActionCreatorWithPayload<P> {
  (payload: P): PayloadAction<P, string, PromiseActionMeta<A, B>>;
  trigger: ActionCreatorWithPreparedPayload<[P], PreparePromiseAction<P, A, B>>;
  resolved: ActionCreatorWithPayload<A>;
  rejected: ActionCreatorWithPayload<B>;
}

export type PreparePromiseAction<P, A, B> = (
  ...args: [P]
) => {
  payload: P;
  meta: PromiseActionMeta<A, B>;
};

export type PromiseAction<P = void, A = void, B = void> = PayloadAction<P, string, PromiseActionMeta<A, B>>;

export function createPromiseAction<P = void, A = void, B = void>(
  prefix: string
): PromiseActionCreatorWithPayload<P, A, B> {
  const resolveAction = createAction<PrepareAction<A>, string>(`${prefix}.RESOLVED`, (payload) => ({ payload }));
  const rejectAction = createAction<PrepareAction<B>>(`${prefix}.REJECTED`, (payload) => ({ payload }));

  const triggerAction = createAction<PreparePromiseAction<P, A, B>>(`${prefix}.TRIGGER`, (payload: P) => ({
    payload,
    meta: {
      promise: {
        resolveAction,
        rejectAction,
      },
    },
  }));

  return ((): PromiseActionCreatorWithPayload<P, A, B> => {
    const f: any = triggerAction;
    f.trigger = triggerAction;
    f.resolved = resolveAction;
    f.rejected = rejectAction;
    return f;
  })();
}

export function* resolvePromiseAction<P = void, A = void, B = void>(action: PromiseAction<P, A, B>, value: A) {
  yield put(action.meta.promise.resolveAction(value));
  action.meta?.promise?.resolve?.(value);
}

export function* rejectPromiseAction<P = void, A = void, B = void>(action: PromiseAction<P, A, B>, value: B) {
  yield put(action.meta.promise.rejectAction(value));
  action.meta?.promise?.reject?.(value);
}

const isTriggerAction = (action: PayloadAction<any, string, any>) => !!action.meta?.promise?.resolveAction;

export const promiseMiddleware: Middleware<unknown, GlobalState> = (store) => (next) => (
  action: PayloadAction<any, string, any>
) => {
  if (isTriggerAction(action)) {
    return new Promise((resolve, reject) =>
      next({
        ...action,
        meta: {
          promise: {
            ...action.meta.promise,
            resolve,
            reject,
          },
        },
      })
    );
  }

  return next(action);
};
