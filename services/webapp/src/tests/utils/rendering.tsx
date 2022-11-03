import { FC, PropsWithChildren, ComponentClass, ComponentType, ReactElement } from 'react';
import { Environment, RelayEnvironmentProvider } from 'react-relay';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { createMockEnvironment } from 'relay-test-utils';
import { createMemoryHistory, History, MemoryHistory } from 'history';
import { HelmetProvider } from 'react-helmet-async';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { Store as ReduxStore } from 'redux';
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
  routerHistory: History;
  intlLocale: Locale;
  intlMessages: TranslationMessages;
  reduxStore: ReduxStore<ReduxState>;
}>;

export function DefaultTestProviders<ReduxState>({
  children,
  relayEnvironment,
  routerHistory,
  intlMessages,
  intlLocale,
  reduxStore,
}: DefaultTestProvidersProps<ReduxState>) {
  return (
    <HistoryRouter history={routerHistory}>
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
    </HistoryRouter>
  );
}

export type WrapperProps<
  ReduxState = DefaultReduxState,
  P extends DefaultTestProvidersProps<ReduxState> = DefaultTestProvidersProps<ReduxState>
> = Partial<P> & {
  reduxInitialState?: ReduxState;
};

export function getWrapper<
  ReduxState = DefaultReduxState,
  P extends DefaultTestProvidersProps<ReduxState> = DefaultTestProvidersProps<ReduxState>
>(WrapperComponent: ComponentClass<P> | FC<P>, wrapperProps: WrapperProps<ReduxState, P>): ComponentType<P> {
  const defaultRelayEnvironment = createMockEnvironment();
  fillCommonQueryWithUser(defaultRelayEnvironment);
  const defaultRouterHistory: MemoryHistory = createMemoryHistory({ initialEntries: ['/'] });
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
        routerHistory={defaultRouterHistory}
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
  ReduxState = DefaultReduxState,
  P extends DefaultTestProvidersProps<ReduxState> = DefaultTestProvidersProps<ReduxState>
>(ui: ReactElement, options: CustomRenderOptions<ReduxState, P> = {}) {
  return render(ui, {
    ...options,
    wrapper: getWrapper(DefaultTestProviders, options),
  });
}

export { customRender as render };

export const createMockRouterHistory = (pathName: string | Array<string>, params?: Record<string, any>) => {
  return createMemoryHistory({
    initialEntries: [
      generatePath(RoutesConfig.getLocalePath(Array.isArray(pathName) ? pathName : [pathName]), {
        lang: 'en',
        ...(params ?? {}),
      }),
    ],
  });
};
