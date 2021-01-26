declare module 'redux-saga/effects' {
  import { PayloadActionCreator, PayloadAction } from '@reduxjs/toolkit';
  import { PromiseAction, PromiseActionCreatorWithPayload } from '../shared/utils/reduxSagaPromise';

  export {
    put,
    all,
    actionChannel,
    delay,
    throttle,
    cancel,
    call,
    apply,
    cancelled,
    cps,
    race,
    debounce,
    select,
    setContext,
    spawn,
    getContext,
    putResolve,
    retry,
    flush,
    fork,
    join,
    effectTypes,
  } from 'redux-saga/effects';

  type EffectHandlerBinding = <P, A = never, B = never>(
    actionCreator: PayloadActionCreator<P> | PromiseActionCreatorWithPayload<P, A, B>,
    effectHandler: (action: PayloadAction<P> | PromiseAction<P, A, B>) => void
  ) => any;

  export const takeMaybe: EffectHandlerBinding;
  export const takeLeading: EffectHandlerBinding;
  export const takeLatest: EffectHandlerBinding;
  export const takeEvery: EffectHandlerBinding;
  export const take: EffectHandlerBinding;
}
