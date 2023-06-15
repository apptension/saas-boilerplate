import * as apiUtils from '@sb/webapp-api-client/tests/utils/rendering';
import { getLocalePath } from '@sb/webapp-core/utils';
import { StoryContext } from '@storybook/react';
import { RenderOptions, render, renderHook } from '@testing-library/react';
import { ComponentClass, ComponentType, FC, ReactElement } from 'react';
import { MemoryRouterProps, generatePath } from 'react-router';

export type WrapperProps = apiUtils.WrapperProps;

/** @ignore */
export function getWrapper(
  WrapperComponent: ComponentClass<apiUtils.ApiTestProvidersProps> | FC<apiUtils.ApiTestProvidersProps>,
  wrapperProps: WrapperProps,
  storyContext?: StoryContext
): {
  wrapper: ComponentType<WrapperProps>;
  waitForApolloMocks: (mockIndex?: number) => Promise<void>;
} {
  return apiUtils.getWrapper(apiUtils.ApiTestProviders, wrapperProps, storyContext);
}

export type CustomRenderOptions = RenderOptions & WrapperProps;

/**
 * Method that extends [`render`](https://testing-library.com/docs/react-testing-library/api#render) method from
 * `@testing-library/react` package. It composes a wrapper using `ApiTestProviders` component from
 * `@sb/webapp-api-client/tests/utils/rendering` package and `options` property that is passed down to parent
 * `render` method. It also extends returned result with the
 * [`waitForApolloMocks`](../../../webapp-api-client/generated/modules/tests_utils_rendering#waitforapollomocks) method.
 *
 * @example
 * Example usage (reset CommonQuery):
 * ```tsx showLineNumbers
 * it('should render ', async () => {
 *   const apolloMocks = [
 *     fillCommonQueryWithUser(
 *       currentUserFactory({
 *         roles: [Role.ADMIN],
 *       })
 *     )
 *   ];
 *   const { waitForApolloMocks } = render(<Component />, {
 *     apolloMocks,
 *   });
 *
 *   await waitForApolloMocks();
 *
 *   expect(screen.getByText('Rendered')).toBeInTheDocument();
 * });
 * ```
 *
 * @example
 * Example usage (append query to default set):
 * ```tsx showLineNumbers
 * it('should render ', async () => {
 *   const requestMock = composeMockedQueryResult(...);
 *   const { waitForApolloMocks } = render(<Component />, {
 *      apolloMocks: append(requestMock),
 *   });
 *
 *   await waitForApolloMocks();
 *
 *   expect(screen.getByText('Rendered')).toBeInTheDocument();
 * });
 * ```
 *
 * @param ui
 * @param options
 */
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

/**
 * Method that extends [`renderHook`](https://testing-library.com/docs/react-testing-library/api#renderhook) method from
 * `@testing-library/react` package. It composes a wrapper using `ApiTestProviders` component from
 * `@sb/webapp-api-client/tests/utils/rendering` package and `options` property that is passed down to parent
 * `renderHook` method. It also extends returned result with the
 * [`waitForApolloMocks`](../../../webapp-api-client/generated/modules/tests_utils_rendering#waitforapollomocks) method.
 *
 * @param hook
 * @param options
 */
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

/**
 *
 * @param pathName
 * @param params
 */
export const createMockRouterProps = (pathName: string, params?: Record<string, any>): MemoryRouterProps => {
  return {
    initialEntries: [
      generatePath(getLocalePath(pathName), {
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
