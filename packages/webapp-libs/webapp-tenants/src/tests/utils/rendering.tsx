import * as apiUtils from '@sb/webapp-api-client/tests/utils/rendering';
import * as corePath from '@sb/webapp-core/utils/path';
import { Queries, queries } from '@testing-library/dom';
import { RenderOptions, RenderResult, render, renderHook } from '@testing-library/react';
import { ComponentClass, ComponentType, FC, PropsWithChildren, ReactElement } from 'react';
import { MemoryRouterProps, generatePath } from 'react-router';
import { Outlet, Route, Routes } from 'react-router-dom';

import { CurrentTenantProvider } from '../../providers';

export type WrapperProps = apiUtils.WrapperProps & {
  TenantWrapper?: ComponentType<PropsWithChildren>;
};

/**
 * Component that wraps `children` with [`CurrentTenantProvider`](./providers#currenttenantprovider)
 * @param children
 * @param TenantWrapper
 * @constructor
 */
export function TenantsTestProviders({ children, TenantWrapper = CurrentTenantProvider }: WrapperProps) {
  return <TenantWrapper>{children}</TenantWrapper>;
}

/** @ignore */
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

export type CustomRenderOptions<
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container,
> = RenderOptions<Q, Container, BaseElement> & WrapperProps;

/**
 * Method that extends [`render`](https://testing-library.com/docs/react-testing-library/api#render) method from
 * `@testing-library/react` package. It composes a wrapper using [`TenantsTestProviders`](#tenantstestproviders)
 * component.
 *
 * @param ui
 * @param options
 */
function customRender<
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container,
>(
  ui: ReactElement,
  options: CustomRenderOptions<Q, Container, BaseElement> = {}
): RenderResult<Q, Container, BaseElement> & { waitForApolloMocks: apiUtils.WaitForApolloMocks } {
  const { wrapper, waitForApolloMocks } = getWrapper(TenantsTestProviders, options);

  return {
    ...render(ui, {
      ...options,
      wrapper,
    }),
    waitForApolloMocks,
  };
}

/**
 * Method that extends [`renderHook`](https://testing-library.com/docs/react-testing-library/api#renderhook) method from
 * `@testing-library/react` package. It composes a wrapper using [`TenantsTestProviders`](#tenantstestproviders)
 * component.
 *
 * @param hook
 * @param options
 */
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

/** @ignore */
export const PLACEHOLDER_TEST_ID = 'content';
/** @ignore */
export const PLACEHOLDER_CONTENT = <span data-testid="content">content</span>;

/** @ignore */
const CurrentTenantRouteElement = () => (
  <CurrentTenantProvider>
    <Outlet />
  </CurrentTenantProvider>
);

/** @ignore */
export const CurrentTenantRouteWrapper = ({ children }: PropsWithChildren) => {
  return (
    <Routes>
      <Route element={<CurrentTenantRouteElement />}>
        <Route path="/:lang?/:tenantId?/*" element={children} />
      </Route>
    </Routes>
  );
};
