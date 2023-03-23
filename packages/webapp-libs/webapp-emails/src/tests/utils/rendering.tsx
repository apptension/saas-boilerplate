import * as apiUtils from '@sb/webapp-api-client/tests/utils/rendering';
import { RenderOptions, render, renderHook } from '@testing-library/react';
import { ComponentClass, ComponentType, FC, ReactElement } from 'react';

export type WrapperProps = apiUtils.WrapperProps;

export function getWrapper(
  WrapperComponent: ComponentClass<apiUtils.ApiTestProvidersProps> | FC<apiUtils.ApiTestProvidersProps>,
  wrapperProps: WrapperProps
): {
  wrapper: ComponentType<WrapperProps>;
  waitForApolloMocks: (mockIndex?: number) => Promise<void>;
} {
  return apiUtils.getWrapper(apiUtils.ApiTestProviders, wrapperProps);
}

export type CustomRenderOptions = RenderOptions & WrapperProps;

function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { wrapper, waitForApolloMocks } = getWrapper(apiUtils.ApiTestProviders, options);

  return {
    ...render(ui, {
      ...options,
      wrapper,
    }),
    waitForApolloMocks,
  };
}

function customRenderHook<Result, Props>(hook: (initialProps: Props) => Result, options: CustomRenderOptions = {}) {
  const { wrapper, waitForApolloMocks } = getWrapper(apiUtils.ApiTestProviders, options);

  return {
    ...renderHook(hook, {
      ...options,
      wrapper,
    }),
    waitForApolloMocks,
  };
}

export { customRender as render, customRenderHook as renderHook };
