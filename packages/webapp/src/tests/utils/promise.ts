/**
 * A utility function supposed to help with resolving or rejecting
 * promises outside their context.
 */
export function unpackPromise<P = void>() {
  let _resolve: (param: P) => void = () => null;
  let _reject: (error?: Error) => void = () => null;

  const promise = new Promise<P>((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;
  });

  return { promise, resolve: _resolve, reject: _reject };
}
