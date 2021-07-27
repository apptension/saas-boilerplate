import { useDispatch } from 'react-redux';
import {
  ActionCreatorWithPayload,
  ActionCreatorWithPreparedPayload,
  createAction,
  Middleware,
  PayloadAction,
  PrepareAction,
} from '@reduxjs/toolkit';
import { put } from 'redux-saga/effects';
import { GlobalState } from '../../app/config/reducers';

export interface PromiseActionMeta<A, B> {
  promise: {
    resolveAction: ActionCreatorWithPayload<A>;
    rejectAction: ActionCreatorWithPayload<B>;
    resolve?(value: A): void;
    reject?(value: B): void;
  };
}

export interface PromiseActionCreatorWithPayload<P, A, B = void> {
  (payload: P): PromiseAction<P, A, B>;
  type: string;
  trigger: ActionCreatorWithPreparedPayload<[P], PreparePromiseAction<P, A, B>>;
  resolved: ActionCreatorWithPayload<A>;
  rejected: ActionCreatorWithPayload<B>;
}

export type PreparePromiseAction<P, A, B> = (...args: [P]) => {
  payload: P;
  meta: PromiseActionMeta<A, B>;
};

export type PromiseAction<P = void, A = void, B = void> = PayloadAction<P, string, PromiseActionMeta<A, B>>;

export function createActionRoutine<P = void, A = void, B = void>(
  prefix: string,
  meta?: any
): PromiseActionCreatorWithPayload<P, A, B> {
  const resolveAction = createAction<PrepareAction<A>, string>(`${prefix}.RESOLVED`, (payload) => ({ payload }));
  const rejectAction = createAction<PrepareAction<B>>(`${prefix}.REJECTED`, (payload) => ({ payload }));

  const triggerAction = createAction<PreparePromiseAction<P, A, B>>(`${prefix}.TRIGGER`, (payload: P) => ({
    payload,
    meta: {
      ...(meta || {}),
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

export function createPromiseAction<P = void, A = void, B = void>(prefix: string) {
  return createActionRoutine<P, A, B>(prefix, { promisified: true });
}

export function* resolvePromiseAction<P = void, A = void, B = void>(action: PromiseAction<P, A, B>, value: A) {
  yield put(action.meta.promise.resolveAction(value));
  action.meta?.promise?.resolve?.(value);
}

export function* rejectPromiseAction<P = void, A = void, B = void>(action: PromiseAction<P, A, B>, value: B) {
  yield put(action.meta.promise.rejectAction(value));
  action.meta?.promise?.reject?.(value);
}

const isPromiseTriggerAction = (action: PayloadAction<any, string, any>) =>
  !!action.meta?.promise?.resolveAction && !!action.meta?.promisified;

export const promiseMiddleware: Middleware<unknown, GlobalState> =
  (store) => (next) => (action: PayloadAction<any, string, any>) => {
    if (isPromiseTriggerAction(action)) {
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

type PromiseDispatch = <P, A, B>(action: PromiseAction<P, A, B>) => Promise<A>;
export const useAsyncDispatch = () => useDispatch<PromiseDispatch>();
