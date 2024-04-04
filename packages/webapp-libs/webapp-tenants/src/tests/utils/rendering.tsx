import * as apiUtils from '@sb/webapp-api-client/tests/utils/rendering';
import * as corePath from '@sb/webapp-core/utils/path';
import { RenderOptions, render, renderHook } from '@testing-library/react';
import { ComponentClass, ComponentType, FC, PropsWithChildren, ReactElement } from 'react';
import { MemoryRouterProps, generatePath } from 'react-router';
import { Outlet, Route, Routes } from 'react-router-dom';

import { CurrentTenantProvider } from '../../providers';

export type WrapperProps = apiUtils.WrapperProps & {
  TenantWrapper?: ComponentType<PropsWithChildren>;
};

/**
 * Component that wraps `children` with `CurrentTenant`
 * @param children
 * @param TenantWrapper
 * @constructor
 */
export function TenantsTestProviders({ children, TenantWrapper = CurrentTenantProvider }: WrapperProps) {
  return <TenantWrapper>{children}</TenantWrapper>;
}

export function getWrapper(
  WrapperComponent: ComponentClass<WrapperProps> | FC<WrapperProps>,
  wrapperProps: WrapperProps
): {
  wrapper: ComponentType<apiUtils.WrapperProps>;
  waitForApolloMocks: (mockIndex?: number) => Promise<void>;
} {
  const { wrapper: ApiCoreWrapper, ...rest } = apiUtils.getWrapper(apiUtils.ApiTestProviders, wrapperProps);
  const wrapper = (props: WrapperProps) => (
    <ApiCoreWrapper {...props} {...(wrapperProps ?? {})}>
      <WrapperComponent {...props} {...(wrapperProps ?? {})} />
    </ApiCoreWrapper>
  );
  return {
    ...rest,
    wrapper,
  };
}

export type CustomRenderOptions = RenderOptions & WrapperProps;

function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { wrapper, waitForApolloMocks } = getWrapper(TenantsTestProviders, options);

  return {
    ...render(ui, {
      ...options,
      wrapper,
    }),
    waitForApolloMocks,
  };
}

function customRenderHook<Result, Props>(hook: (initialProps: Props) => Result, options: CustomRenderOptions = {}) {
  const { wrapper, waitForApolloMocks } = getWrapper(TenantsTestProviders, options);

  return {
    ...renderHook(hook, {
      ...options,
      wrapper,
    }),
    waitForApolloMocks,
  };
}

export { customRender as render, customRenderHook as renderHook };

export const createMockRouterProps = (pathName: string, params?: Record<string, any>): MemoryRouterProps => {
  return {
    initialEntries: [
      generatePath(corePath.getLocalePath(corePath.getTenantPath(pathName)), {
        lang: 'en',
        ...(params ?? {}),
      }),
    ],
  };
};

export const PLACEHOLDER_TEST_ID = 'content';
export const PLACEHOLDER_CONTENT = <span data-testid="content">content</span>;

const CurrentTenantRouteElement = () => (
  <CurrentTenantProvider>
    <Outlet />
  </CurrentTenantProvider>
);

export const CurrentTenantRouteWrapper = ({ children }: PropsWithChildren) => {
  return (
    <Routes>
      <Route element={<CurrentTenantRouteElement />}>
        <Route path="/:lang?/:tenantId?/*" element={children} />
      </Route>
    </Routes>
  );
};
