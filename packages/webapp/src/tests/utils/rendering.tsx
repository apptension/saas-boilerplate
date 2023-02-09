import { FC, PropsWithChildren, ComponentClass, ComponentType, ReactElement } from 'react';
import { Environment, RelayEnvironmentProvider } from 'react-relay';
import { MockedProvider as MockedApolloProvider, MockedProviderProps, MockedResponse } from '@apollo/client/testing';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { createMockEnvironment, RelayMockEnvironment } from 'relay-test-utils';
import { HelmetProvider } from 'react-helmet-async';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { Store as ReduxStore } from 'redux';
import { Store } from '@reduxjs/toolkit';
import { render, renderHook, RenderOptions, waitFor } from '@testing-library/react';
import invariant from 'invariant';
import { generatePath } from 'react-router';
import { StoryContext } from '@storybook/react';

import { ResponsiveThemeProvider } from '../../app/providers/responsiveThemeProvider';
import { DEFAULT_LOCALE, Locale, translationMessages, TranslationMessages } from '../../app/config/i18n';
import configureStore from '../../app/config/store';
import { RoutesConfig } from '../../app/config/routes';
import { CommonQuery } from '../../app/providers/commonQuery';
import { fillCommonQueryWithUser } from '../../shared/utils/commonQuery';

export const PLACEHOLDER_TEST_ID = 'content';
export const PLACEHOLDER_CONTENT = <span data-testid="content">content</span>;

const defaultReduxStore = configureStore({});

export type DefaultReduxState = typeof defaultReduxStore;

export type DefaultTestProvidersProps<ReduxState> = PropsWithChildren<{
  relayEnvironment: Environment;
  apolloMocks?: ReadonlyArray<MockedResponse>;
  apolloProviderProps: MockedProviderProps;
  routerProps: MemoryRouterProps;
  intlLocale: Locale;
  intlMessages: TranslationMessages;
  reduxStore: ReduxStore<ReduxState>;
}>;

export function DefaultTestProviders<ReduxState>({
  children,
  relayEnvironment,
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
              <RelayEnvironmentProvider environment={relayEnvironment}>
                <MockedApolloProvider addTypename={false} {...apolloProviderProps} mocks={apolloMocks}>
                  <CommonQuery>{children}</CommonQuery>
                </MockedApolloProvider>
              </RelayEnvironmentProvider>
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
> = Partial<Omit<P, 'relayEnvironment' | 'apolloMocks'>> & {
  reduxInitialState?: ReduxState;
  relayEnvironment?: Environment | ((env: RelayMockEnvironment, storyContext?: StoryContext) => void);
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
  const relayEnvironment = (() => {
    if (typeof wrapperProps.relayEnvironment === 'function') {
      const envToMutate = createMockEnvironment();
      wrapperProps.relayEnvironment(envToMutate, storyContext);
      return envToMutate;
    }
    if (wrapperProps.relayEnvironment !== undefined) {
      return wrapperProps.relayEnvironment;
    }
    const defaultRelayEnvironment = createMockEnvironment();
    fillCommonQueryWithUser(defaultRelayEnvironment);
    return defaultRelayEnvironment;
  })();

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
        relayEnvironment={relayEnvironment}
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
