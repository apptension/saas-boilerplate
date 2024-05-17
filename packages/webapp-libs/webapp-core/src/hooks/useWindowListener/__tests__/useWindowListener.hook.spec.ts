import { empty } from 'ramda';
import throttle from 'lodash.throttle';
import { renderHook } from '@testing-library/react';
import { useWindowListener } from '../useWindowListener.hook';
import { UnknownObject } from '../../../utils/types';

jest.mock('lodash.throttle', () => jest.fn().mockImplementation((fn) => fn));

const defaultOptions = {
  foo: 'bar',
};

const defaultArgs: [string, (...args: unknown[]) => void, UnknownObject] = [
  'scroll',
  empty,
  {
    throttle: 0,
    ...defaultOptions,
  },
];

const render = (args = defaultArgs) => renderHook(() => useWindowListener(...args));

describe('useWindowListener: Hook', () => {
  const addEventListenerSpy = jest.spyOn(global.window, 'addEventListener');
  const removeEventListenerSpy = jest.spyOn(global.window, 'removeEventListener');

  afterEach(() => {
    addEventListenerSpy.mockReset();
    removeEventListenerSpy.mockReset();
  });

  it('should return nothing', () => {
    const { result } = render();
    expect(result.current).toBeUndefined();
  });

  it('should call addEventListener with proper eventType on mount', () => {
    render();
    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', defaultArgs[1], defaultOptions);
  });

  it('should call removeEventListener with proper eventType on unmount', () => {
    const el = render();
    el.unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), defaultOptions);
  });

  describe('when no throttling is provided', () => {
    it('should call addEventListener with provided function on mount', () => {
      const onEvent = (): void => undefined;
      render([defaultArgs[0], onEvent, { throttle: 0, ...defaultOptions }]);
      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', onEvent, defaultOptions);
    });

    it('should call removeEventListener with provided function on mount', () => {
      const onEvent = (): void => undefined;
      const el = render([defaultArgs[0], onEvent, { throttle: 0, ...defaultOptions }]);
      el.unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', onEvent, defaultOptions);
    });
  });

  describe('when throttle is provided', () => {
    it('should call throttle on given function', () => {
      const onEvent = (): void => undefined;
      render([defaultArgs[0], onEvent, { throttle: 100, ...defaultOptions }]);
      expect(throttle).toHaveBeenCalledWith(onEvent, 100, expect.anything());
    });
  });
});
