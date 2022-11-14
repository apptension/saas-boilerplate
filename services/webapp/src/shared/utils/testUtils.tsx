import { ReactElement, ReactNode } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { render } from '@testing-library/react';
import { createStore } from 'redux';
import { identity } from 'ramda';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { produce } from 'immer';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, RelayMockEnvironment } from 'relay-test-utils';

import { DEFAULT_LOCALE, translationMessages, TranslationMessages } from '../../app/config/i18n';
import { store as fixturesStore } from '../../mocks/store';
import createReducer, { GlobalState } from '../../app/config/reducers';
import { ResponsiveThemeProvider } from '../../app/providers/responsiveThemeProvider';
import { CommonQuery } from '../../app/providers/commonQuery';
import { fillCommonQueryWithUser } from './commonQuery';

export const PLACEHOLDER_TEST_ID = 'content';
export const PLACEHOLDER_CONTENT = <span data-testid="content">content</span>;

export interface ContextData {
  router?: {
    url?: string;
    routePath?: string;
    routerProps?: MemoryRouterProps;
    children?: ReactNode;
  };
  store?: GlobalState | ((draft: GlobalState) => void);
  messages?: TranslationMessages;
  relayEnvironment?: RelayMockEnvironment | ((env: RelayMockEnvironment) => void);
}

export interface ProvidersWrapperProps {
  children: ReactNode;
  context?: ContextData;
}

export const ProvidersWrapper = ({ children, context = {} }: ProvidersWrapperProps) => {
  const { router = {}, messages } = context;
  const { url = `/${DEFAULT_LOCALE}`, routePath = '/:lang/', routerProps: rProps } = router;

  const routerProps: MemoryRouterProps = rProps ?? { initialEntries: [url] };

  const intlProviderMockProps = {
    locale: DEFAULT_LOCALE,
    messages: messages ?? translationMessages[DEFAULT_LOCALE],
  };

  const store = (() => {
    if (!context?.store) return fixturesStore;
    if (typeof context.store === 'function') return produce(fixturesStore, context.store);
    return context.store;
  })();

  const relayEnvironment = (() => {
    if (context?.relayEnvironment === undefined) {
      const env = createMockEnvironment();
      fillCommonQueryWithUser(env);
      return env;
    }
    if (typeof context.relayEnvironment === 'function') {
      const mockEnvironment = createMockEnvironment();
      context.relayEnvironment(mockEnvironment);
      return mockEnvironment;
    }
    return context.relayEnvironment;
  })();

  return (
    <MemoryRouter {...routerProps}>
      <HelmetProvider>
        <ResponsiveThemeProvider>
          <RelayEnvironmentProvider environment={relayEnvironment}>
            <CommonQuery>
              <IntlProvider {...intlProviderMockProps}>
                <Provider store={createStore(createReducer(), produce(store, identity))}>
                  <Routes>
                    <Route path={routePath} element={children}>
                      {router.children}
                    </Route>
                  </Routes>
                </Provider>
              </IntlProvider>
            </CommonQuery>
          </RelayEnvironmentProvider>
        </ResponsiveThemeProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
};

export function makePropsRenderer<T>(component: (props: T | Record<string, never>) => ReactElement) {
  return (props?: T) => render(component(props ?? {}));
}

// using `screen.getByText(matchTextContent('hello world'))` will match <div>hello <span>world</span></div>
export const matchTextContent = (text: string | RegExp) => (_: unknown, node: Element | null | undefined) => {
  const hasText = (node: Element) => {
    const isPlainString = typeof text === 'string';
    const nodeContent = node.textContent ?? '';
    return isPlainString ? nodeContent === text : new RegExp(text).test(nodeContent);
  };
  const childrenDontHaveText = Array.from(node?.children ?? []).every((child) => !hasText(child));
  return Boolean(node && hasText(node) && childrenDontHaveText);
};

export const connectionFromArray = <T extends Record<string, any>>(arr: T[] = []) => {
  if (!arr || arr.length === 0) {
    return {
      edges: [],
      totalCount: 0,
      count: 0,
      endCursorOffset: 0,
      startCursorOffset: 0,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  return {
    edges: arr.map((node) => ({ node })),
    totalCount: arr.length,
    count: arr.length,
    endCursorOffset: arr.length,
    startCursorOffset: 0,
    pageInfo: {
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
};
