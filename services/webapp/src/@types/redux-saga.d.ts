import { PayloadAction, ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { PromiseAction, PromiseActionCreatorWithPayload } from '../shared/utils/reduxSagaPromise';

declare module 'redux-saga/effects' {
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

  type EffectHandlerBinding = <Payload, Resolved = void, Rejected = void>(
    actionCreator: ActionCreatorWithPayload<Payload> | PromiseActionCreatorWithPayload<Payload, Resolved, Rejected>,
    effectHandler: actionCreator extends PromiseActionCreatorWithPayload<Payload, Resolved, Rejected>
      ? (action: PromiseAction<Payload, Resolved, Rejected>) => any
      : (action: PayloadAction<Payload>) => any
  ) => any;

  export const takeMaybe: EffectHandlerBinding;
  export const takeLeading: EffectHandlerBinding;
  export const takeLatest: EffectHandlerBinding;
  export const takeEvery: EffectHandlerBinding;
  export const take: EffectHandlerBinding;
}
