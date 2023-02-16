import { MockedProvider as MockedApolloProvider, MockedProviderProps, MockedResponse } from '@apollo/client/testing';
import { Store } from '@reduxjs/toolkit';
import { StoryContext } from '@storybook/react';
import { RenderOptions, render, renderHook, waitFor } from '@testing-library/react';
import invariant from 'invariant';
import { ComponentClass, ComponentType, FC, PropsWithChildren, ReactElement } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { generatePath } from 'react-router';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { Store as ReduxStore } from 'redux';

import { DEFAULT_LOCALE, Locale, TranslationMessages, translationMessages } from '../../app/config/i18n';
import { RoutesConfig } from '../../app/config/routes';
import configureStore from '../../app/config/store';
import { CommonQuery } from '../../app/providers/commonQuery';
import { ResponsiveThemeProvider } from '../../app/providers/responsiveThemeProvider';
import { fillCommonQueryWithUser } from '../../shared/utils/commonQuery';

export const PLACEHOLDER_TEST_ID = 'content';
export const PLACEHOLDER_CONTENT = <span data-testid="content">content</span>;

const defaultReduxStore = configureStore({});

export type DefaultReduxState = typeof defaultReduxStore;

export type DefaultTestProvidersProps<ReduxState> = PropsWithChildren<{
  apolloMocks?: ReadonlyArray<MockedResponse>;
  apolloProviderProps: MockedProviderProps;
  routerProps: MemoryRouterProps;
  intlLocale: Locale;
  intlMessages: TranslationMessages;
  reduxStore: ReduxStore<ReduxState>;
}>;

export function DefaultTestProviders<ReduxState>({
  children,
  apolloMocks = [],
  apolloProviderProps = {},
  routerProps,
  intlMessages,
  intlLocale,
  reduxStore,
}: DefaultTestProvidersProps<ReduxState>) {
  return (
    <MemoryRouter {...routerProps}>
      <HelmetProvider>
        <ResponsiveThemeProvider>
          <IntlProvider locale={intlLocale} messages={intlMessages}>
            <Provider store={reduxStore}>
              <MockedApolloProvider addTypename={false} {...apolloProviderProps} mocks={apolloMocks}>
                <CommonQuery>{children}</CommonQuery>
              </MockedApolloProvider>
            </Provider>
          </IntlProvider>
        </ResponsiveThemeProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

export type WrapperProps<
  ReduxState = DefaultReduxState,
  P extends DefaultTestProvidersProps<ReduxState> = DefaultTestProvidersProps<ReduxState>
> = Partial<Omit<P, 'apolloMocks'>> & {
  reduxInitialState?: ReduxState;
  apolloMocks?:
    | ReadonlyArray<MockedResponse>
    | ((mocks: ReadonlyArray<MockedResponse>, storyContext?: StoryContext) => ReadonlyArray<MockedResponse>);
};

export function getWrapper<
  ReduxState extends Store = DefaultReduxState,
  P extends DefaultTestProvidersProps<ReduxState> = DefaultTestProvidersProps<ReduxState>
>(
  WrapperComponent: ComponentClass<P> | FC<P>,
  wrapperProps: WrapperProps<ReduxState, P>,
  storyContext?: StoryContext
): {
  wrapper: ComponentType<P>;
  waitForApolloMocks: (mockIndex?: number) => Promise<void>;
} {
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

  const defaultRouterProps: MemoryRouterProps = { initialEntries: ['/'] };
  const defaultReduxStore = configureStore(wrapperProps.reduxInitialState);

  invariant(
    !(wrapperProps.reduxStore && wrapperProps.reduxInitialState),
    'Both redux store and initial redux state have been provided while they are exclusive. Define the initial state directly while configuring your store'
  );

  const waitForApolloMocks = async (mockIndex: number = apolloMocks.length - 1) => {
    if (!apolloMocks.length) {
      return Promise.resolve();
    }
    await waitFor(() => expect(apolloMocks[mockIndex].result).toHaveBeenCalled());
  };

  const wrapper = (props) => {
    return (
      <WrapperComponent
        {...props}
        routerProps={defaultRouterProps}
        intlLocale={DEFAULT_LOCALE}
        intlMessages={translationMessages[DEFAULT_LOCALE]}
        reduxStore={defaultReduxStore}
        {...(wrapperProps ?? {})}
        apolloMocks={apolloMocks}
      />
    );
  };
  return {
    wrapper,
    waitForApolloMocks,
  };
}

export type CustomRenderOptions<
  ReduxState = DefaultReduxState,
  P extends DefaultTestProvidersProps<ReduxState> = DefaultTestProvidersProps<ReduxState>
> = RenderOptions & WrapperProps<ReduxState, P>;

function customRender<
  ReduxState extends Store = DefaultReduxState,
  P extends DefaultTestProvidersProps<ReduxState> = DefaultTestProvidersProps<ReduxState>
>(ui: ReactElement, options: CustomRenderOptions<ReduxState, P> = {}) {
  const { wrapper, waitForApolloMocks } = getWrapper(DefaultTestProviders, options);
  return {
    ...render(ui, {
      ...options,
      wrapper,
    }),
    waitForApolloMocks,
  };
}

function customRenderHook<
  Result,
  Props,
  ReduxState extends Store = DefaultReduxState,
  P extends DefaultTestProvidersProps<ReduxState> = DefaultTestProvidersProps<ReduxState>
>(hook: (initialProps: Props) => Result, options: CustomRenderOptions<ReduxState, P> = {}) {
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
