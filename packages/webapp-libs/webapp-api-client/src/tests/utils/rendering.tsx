import { MockedProvider as MockedApolloProvider, MockedProviderProps, MockedResponse } from '@apollo/client/testing';
import * as coreUtils from '@sb/webapp-core/tests/utils/rendering';
import { CoreTestProviders, CoreTestProvidersProps } from '@sb/webapp-core/tests/utils/rendering';
import { StoryContext } from '@storybook/react';
import { Queries, queries } from '@testing-library/dom';
import { RenderOptions, RenderResult, render, renderHook, waitFor } from '@testing-library/react';
import { ComponentClass, ComponentType, FC, PropsWithChildren, ReactElement } from 'react';

import { CommonQuery } from '../../providers';
import { fillCommonQueryWithUser } from '../factories';

/**
 * A set of properties that will be passed to Apollo's
 * [MockerProvider](https://www.apollographql.com/docs/react/api/react/testing#mockedprovider)
 */
export type ApiTestProvidersProps = PropsWithChildren<{
  apolloMocks?: ReadonlyArray<MockedResponse>;
  apolloProviderProps?: MockedProviderProps;
}>;

/**
 * Component that wraps `children` with Apollo
 * [MockerProvider](https://www.apollographql.com/docs/react/api/react/testing#mockedprovider) and
 * [CommonQuery](./providers#commonquery)
 * @param children
 * @param apolloMocks
 * @param apolloProviderProps
 * @constructor
 */
export function ApiTestProviders({ children, apolloMocks = [], apolloProviderProps = {} }: ApiTestProvidersProps) {
  return (
    <MockedApolloProvider addTypename={false} {...apolloProviderProps} mocks={apolloMocks}>
      <CommonQuery>{children}</CommonQuery>
    </MockedApolloProvider>
  );
}

export type WrapperProps = Partial<Omit<ApiTestProvidersProps & CoreTestProvidersProps, 'apolloMocks'>> & {
  apolloMocks?:
    | ReadonlyArray<MockedResponse>
    | ((mocks: ReadonlyArray<MockedResponse>, storyContext?: StoryContext) => ReadonlyArray<MockedResponse>);
};

/**
 * Helper method that is returned from [`render`](#render) and [`renderHook`](#renderhook). It allows to wait until
 * mocked requests from `apolloMocks` wrapper are resolved. By default, it will wait for all mocks. Optionally it can
 * receive `mockIndex` parameter to select the request for which it should wait for
 *
 * @param mockIndex Index of the `apolloMocks` array.
 */
export type WaitForApolloMocks = (mockIndex?: number) => Promise<void>;

/** @ignore */
export function getWrapper(
  WrapperComponent: ComponentClass<ApiTestProvidersProps> | FC<ApiTestProvidersProps>,
  wrapperProps: WrapperProps,
  storyContext?: StoryContext
): {
  wrapper: ComponentType<WrapperProps>;
  waitForApolloMocks: WaitForApolloMocks;
} {
  const { wrapper: CoreWrapper } = coreUtils.getWrapper(CoreTestProviders, wrapperProps);
  const apolloMocks = (() => {
    const defaultApolloMocks = [fillCommonQueryWithUser()];

    if (typeof wrapperProps.apolloMocks === 'function') {
      return wrapperProps.apolloMocks(defaultApolloMocks, storyContext);
    }

    if (wrapperProps.apolloMocks !== undefined) {
      return wrapperProps.apolloMocks;
    }

    return defaultApolloMocks;
  })();

  const waitForApolloMocks = async (mockIndex: number = apolloMocks.length - 1) => {
    if (!apolloMocks.length) {
      return Promise.resolve();
    }

    // @ts-ignore
    await waitFor(() => expect(apolloMocks[mockIndex].result).toHaveBeenCalled());
  };

  const wrapper = (props: WrapperProps) => {
    return (
      <CoreWrapper {...props} {...(wrapperProps ?? {})}>
        <WrapperComponent {...props} {...(wrapperProps ?? {})} apolloMocks={apolloMocks} />
      </CoreWrapper>
    );
  };

  return {
    wrapper,
    waitForApolloMocks,
  };
}

export type CustomRenderOptions<
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container,
> = RenderOptions<Q, Container, BaseElement> & WrapperProps;

/**
 * Method that extends [`render`](https://testing-library.com/docs/react-testing-library/api#render) method from
 * `@testing-library/react` package. It composes a wrapper using [`ApiTestProviders`](#apitestprovidersprops) component
 * and `options` property that is passed down to parent `render` method. It also extends returned result with the
 * [`waitForApolloMocks`](#waitforapollomocks) method.
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
): RenderResult<Q, Container, BaseElement> & { waitForApolloMocks: WaitForApolloMocks } {
  const { wrapper, waitForApolloMocks } = getWrapper(ApiTestProviders, options);

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
 * `@testing-library/react` package. It composes a wrapper using [`ApiTestProviders`](#apitestprovidersprops) component
 * and `options` property that is passed down to parent `renderHook` method. It also extends returned result with the
 * [`waitForApolloMocks`](#waitforapollomocks) method.
 * @param hook
 * @param options
 */
function customRenderHook<Result, Props>(hook: (initialProps: Props) => Result, options: CustomRenderOptions = {}) {
  const { wrapper, waitForApolloMocks } = getWrapper(ApiTestProviders, options);

  return {
    ...renderHook(hook, {
      ...options,
      wrapper,
    }),
    waitForApolloMocks,
  };
}

export { customRender as render, customRenderHook as renderHook };
