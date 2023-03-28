import { MockedProvider as MockedApolloProvider, MockedProviderProps, MockedResponse } from '@apollo/client/testing';
import * as coreUtils from '@sb/webapp-core/tests/utils/rendering';
import { CoreTestProviders, CoreTestProvidersProps } from '@sb/webapp-core/tests/utils/rendering';
import { StoryContext } from '@storybook/react';
import { RenderOptions, render, renderHook, waitFor } from '@testing-library/react';
import { ComponentClass, ComponentType, FC, PropsWithChildren, ReactElement } from 'react';

import { CommonQuery } from '../../providers';
import { fillCommonQueryWithUser } from '../factories';

export type ApiTestProvidersProps = PropsWithChildren<{
  apolloMocks?: ReadonlyArray<MockedResponse>;
  apolloProviderProps?: MockedProviderProps;
}>;

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

export function getWrapper(
  WrapperComponent: ComponentClass<ApiTestProvidersProps> | FC<ApiTestProvidersProps>,
  wrapperProps: WrapperProps,
  storyContext?: StoryContext
): {
  wrapper: ComponentType<WrapperProps>;
  waitForApolloMocks: (mockIndex?: number) => Promise<void>;
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

export type CustomRenderOptions = RenderOptions & WrapperProps;

function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { wrapper, waitForApolloMocks } = getWrapper(ApiTestProviders, options);

  return {
    ...render(ui, {
      ...options,
      wrapper,
    }),
    waitForApolloMocks,
  };
}

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
