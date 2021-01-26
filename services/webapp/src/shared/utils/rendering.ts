import { always, Arity0Fn, complement, equals, ifElse, isNil } from 'ramda';

export const renderWhen = (pred: (arg: any) => boolean, fn: Arity0Fn) => ifElse(pred, fn, always(null));

export const renderWhenNotNil = (fn: Arity0Fn) => renderWhen(complement(isNil), fn);

export const renderWhenTrue = (fn: Arity0Fn) => renderWhen(equals(true), fn);

export const renderWhenTrueOtherwise = (fn: Arity0Fn, otherwise: Arity0Fn) => ifElse(equals(true), fn, otherwise);
