import { FC, PropsWithChildren, ComponentClass, ComponentType, ReactElement } from 'react';
import { Environment, RelayEnvironmentProvider } from 'react-relay';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { createMockEnvironment } from 'relay-test-utils';
import { HelmetProvider } from 'react-helmet-async';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { Store as ReduxStore } from 'redux';
import { Store } from '@reduxjs/toolkit';
import { render, RenderOptions } from '@testing-library/react';
import invariant from 'invariant';
import { generatePath } from 'react-router';

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
  routerProps: MemoryRouterProps;
  intlLocale: Locale;
  intlMessages: TranslationMessages;
  reduxStore: ReduxStore<ReduxState>;
}>;

export function DefaultTestProviders<ReduxState>({
  children,
  relayEnvironment,
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
                <CommonQuery>{children}</CommonQuery>
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
> = Partial<P> & {
  reduxInitialState?: ReduxState;
};

export function getWrapper<
  ReduxState extends Store = DefaultReduxState,
  P extends DefaultTestProvidersProps<ReduxState> = DefaultTestProvidersProps<ReduxState>
>(WrapperComponent: ComponentClass<P> | FC<P>, wrapperProps: WrapperProps<ReduxState, P>): ComponentType<P> {
  const defaultRelayEnvironment = createMockEnvironment();
  fillCommonQueryWithUser(defaultRelayEnvironment);
  const defaultRouterProps: MemoryRouterProps = { initialEntries: ['/'] };
  const defaultReduxStore = configureStore(wrapperProps.reduxInitialState);

  invariant(
    !(wrapperProps.reduxStore && wrapperProps.reduxInitialState),
    'Both redux store and initial redux state have been provided while they are exclusive. Define the initial state directly while configuring your store'
  );

  return (props) => {
    return (
      <WrapperComponent
        {...props}
        relayEnvironment={defaultRelayEnvironment}
        routerProps={defaultRouterProps}
        intlLocale={DEFAULT_LOCALE}
        intlMessages={translationMessages[DEFAULT_LOCALE]}
        reduxStore={defaultReduxStore}
        {...(wrapperProps ?? {})}
      />
    );
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
  return render(ui, {
    ...options,
    wrapper: getWrapper(DefaultTestProviders, options),
  });
}

export { customRender as render };

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
