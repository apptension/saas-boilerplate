import { MockedProvider as MockedApolloProvider, MockedProviderProps, MockedResponse } from '@apollo/client/testing';
import { CommonQuery } from '@sb/webapp-api-client/providers';
import { fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import * as coreUtils from '@sb/webapp-core/tests/utils/rendering';
import * as corePath from '@sb/webapp-core/utils/path';
import { StoryContext } from '@storybook/react';
import { RenderOptions, render, renderHook, waitFor } from '@testing-library/react';
import { ComponentClass, ComponentType, FC, PropsWithChildren, ReactElement } from 'react';
import { MemoryRouterProps, generatePath } from 'react-router';

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
      generatePath(corePath.getLocalePath(pathName), {
        lang: 'en',
        ...(params ?? {}),
      }),
    ],
  };
};
