import makeThrottled from 'lodash.throttle';
import { useEffect } from 'react';
import { UnknownObject } from '../../utils/types';

export const useWindowListener = (
  eventType: string,
  callback: (...args: any) => void,
  { throttle, ...options }: { throttle?: number } & UnknownObject
) => {
  const throttledFn = (fn: (...args: any[]) => any) => makeThrottled(fn, throttle, { leading: true, trailing: true });
  const handler = throttle ? throttledFn(callback) : callback;

  useEffect(() => {
    window.addEventListener(eventType, handler, options);
    return () => {
      window.removeEventListener(eventType, handler, options);
    };
  }, [eventType, handler, options]);
};
