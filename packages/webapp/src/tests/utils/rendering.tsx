import { MockedProvider as MockedApolloProvider, MockedProviderProps, MockedResponse } from '@apollo/client/testing';
import * as coreUtils from '@sb/webapp-core/tests/utils/rendering';
import { StoryContext } from '@storybook/react';
import { RenderOptions, render, renderHook, waitFor } from '@testing-library/react';
import { ComponentClass, ComponentType, FC, PropsWithChildren, ReactElement } from 'react';
import { generatePath } from 'react-router';
import { MemoryRouterProps } from 'react-router-dom';

import { RoutesConfig } from '../../app/config/routes';
import { CommonQuery } from '../../app/providers';
import { fillCommonQueryWithUser } from '../factories';

export const PLACEHOLDER_TEST_ID = 'content';
export const PLACEHOLDER_CONTENT = <span data-testid="content">content</span>;

export type DefaultTestProvidersProps = PropsWithChildren<
  {
    apolloMocks?: ReadonlyArray<MockedResponse>;
    apolloProviderProps: MockedProviderProps;
  } & coreUtils.DefaultTestProvidersProps
>;

export function DefaultTestProviders({
  children,
  apolloMocks = [],
  apolloProviderProps = {},
}: DefaultTestProvidersProps) {
  return (
    <MockedApolloProvider addTypename={false} {...apolloProviderProps} mocks={apolloMocks}>
      <CommonQuery>{children}</CommonQuery>
    </MockedApolloProvider>
  );
}

export type WrapperProps<P extends DefaultTestProvidersProps = DefaultTestProvidersProps> = Partial<
  Omit<P, 'apolloMocks'>
> & {
  apolloMocks?:
    | ReadonlyArray<MockedResponse>
    | ((mocks: ReadonlyArray<MockedResponse>, storyContext?: StoryContext) => ReadonlyArray<MockedResponse>);
};

export function getWrapper<P extends DefaultTestProvidersProps = DefaultTestProvidersProps>(
  WrapperComponent: ComponentClass<P> | FC<P>,
  wrapperProps: WrapperProps<P>,
  storyContext?: StoryContext
): {
  wrapper: ComponentType<P>;
  waitForApolloMocks: (mockIndex?: number) => Promise<void>;
} {
  const { wrapper: CoreWrapper } = coreUtils.getWrapper(coreUtils.DefaultTestProviders, wrapperProps);
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

    await waitFor(() => expect(apolloMocks[mockIndex].result).toHaveBeenCalled());
  };

  const wrapper = (props: P) => {
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

export type CustomRenderOptions<P extends DefaultTestProvidersProps = DefaultTestProvidersProps> = RenderOptions &
  WrapperProps<P>;

function customRender<P extends DefaultTestProvidersProps = DefaultTestProvidersProps>(
  ui: ReactElement,
  options: CustomRenderOptions<P> = {}
) {
  const { wrapper, waitForApolloMocks } = getWrapper(DefaultTestProviders, options);

  return {
    ...render(ui, {
      ...options,
      wrapper,
    }),
    waitForApolloMocks,
  };
}

function customRenderHook<Result, Props, P extends DefaultTestProvidersProps = DefaultTestProvidersProps>(
  hook: (initialProps: Props) => Result,
  options: CustomRenderOptions<P> = {}
) {
  const { wrapper, waitForApolloMocks } = getWrapper(DefaultTestProviders, options);

  return {
    ...renderHook(hook, {
      ...options,
      wrapper,
    }),
    waitForApolloMocks,
  };
}

export { customRender as render, customRenderHook as renderHook };

export const createMockRouterProps = (
  pathName: string | Array<string>,
  params?: Record<string, any>
): MemoryRouterProps => {
  return {
    initialEntries: [
      generatePath(RoutesConfig.getLocalePath(Array.isArray(pathName) ? pathName : [pathName]), {
        lang: 'en',
        ...(params ?? {}),
      }),
    ],
  };
};
