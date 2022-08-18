import { ReactElement, ReactNode } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { render } from '@testing-library/react';
import { createStore } from 'redux';
import { identity } from 'ramda';
import { Provider } from 'react-redux';
import { createMemoryHistory, MemoryHistory } from 'history';
import { Route, Routes } from 'react-router';
import { unstable_HistoryRouter as HistoryRouter } from 'react-router-dom';
import { IntlProvider } from 'react-intl';
import { produce } from 'immer';
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment, RelayMockEnvironment } from 'relay-test-utils';

import { DEFAULT_LOCALE, translationMessages, TranslationMessages } from '../../app/config/i18n';
import { store as fixturesStore } from '../../mocks/store';
import createReducer, { GlobalState } from '../../app/config/reducers';
import { ResponsiveThemeProvider } from '../../app/providers/responsiveThemeProvider';

export const PLACEHOLDER_TEST_ID = 'content';
export const PLACEHOLDER_CONTENT = <span data-testid="content">content</span>;

export const spiedHistory = (route = `/${DEFAULT_LOCALE}`) => {
  const history = createMemoryHistory({ initialEntries: [route] });
  history.push = jest.fn();
  return {
    history,
    pushSpy: history.push as jest.Mock,
  };
};

export interface ContextData {
  router?: {
    url?: string;
    routePath?: string;
    history?: MemoryHistory;
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
  const { url = `/${DEFAULT_LOCALE}`, routePath = '/:lang/', history } = router;

  const routerHistory: MemoryHistory = history ?? createMemoryHistory({ initialEntries: [url] });

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
      return createMockEnvironment();
    }
    if (typeof context.relayEnvironment === 'function') {
      const mockEnvironment = createMockEnvironment();
      context.relayEnvironment(mockEnvironment);
      return mockEnvironment;
    }
    return context.relayEnvironment;
  })();

  return (
    <HistoryRouter history={routerHistory}>
      <HelmetProvider>
        <ResponsiveThemeProvider>
          <RelayEnvironmentProvider environment={relayEnvironment}>
            <IntlProvider {...intlProviderMockProps}>
              <Provider store={createStore(createReducer(), produce(store, identity))}>
                <Routes>
                  <Route path={routePath} element={children}>
                    {router.children}
                  </Route>
                </Routes>
              </Provider>
            </IntlProvider>
          </RelayEnvironmentProvider>
        </ResponsiveThemeProvider>
      </HelmetProvider>
    </HistoryRouter>
  );
};

export function makeContextRenderer<T>(
  component: (props: T | Record<string, never>) => ReactElement,
  baseContext: ContextData = {}
) {
  return (props?: T, context?: ContextData) => {
    return render(component(props ?? {}), {
      wrapper: ({ children }) => (
        <ProvidersWrapper context={{ ...baseContext, ...context }}>{children}</ProvidersWrapper>
      ),
    });
  };
}

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

export const packHistoryArgs = (pathname: string, other = {}) => ([
  expect.objectContaining({ pathname, ...other }),
  undefined
])
