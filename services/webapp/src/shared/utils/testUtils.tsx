import React, { ReactNode, ReactElement } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Nullish, render } from '@testing-library/react';
import { createStore } from 'redux';
import { identity } from 'ramda';
import { Provider } from 'react-redux';
import { createMemoryHistory, MemoryHistory } from 'history';
import { Route, Router } from 'react-router';
import { IntlProvider } from 'react-intl';
import { produce } from 'immer';

import { MockedProvider } from '@apollo/client/testing';
import { DEFAULT_LOCALE, translationMessages, TranslationMessages } from '../../i18n';
import { store as fixturesStore } from '../../mocks/store';
import createReducer, { GlobalState } from '../../config/reducers';
import { ResponsiveThemeProvider } from '../components/responsiveThemeProvider';

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
  };
  store?: GlobalState;
  messages?: TranslationMessages;
  apolloMocks?: any[];
}

interface ProvidersWrapperProps {
  children: ReactNode;
  context?: ContextData;
}

export const ProvidersWrapper = ({ children, context = {} }: ProvidersWrapperProps) => {
  const { router = {}, store = fixturesStore, messages, apolloMocks = [] } = context;
  const { url = `/${DEFAULT_LOCALE}`, routePath = '/:lang/', history } = router;

  const routerHistory: MemoryHistory = history ?? createMemoryHistory({ initialEntries: [url] });

  const intlProviderMockProps = {
    locale: DEFAULT_LOCALE,
    messages: messages ?? translationMessages[DEFAULT_LOCALE],
  };

  return (
    <Router history={routerHistory}>
      <HelmetProvider>
        <ResponsiveThemeProvider>
          <MockedProvider mocks={apolloMocks} addTypename={false}>
            <IntlProvider {...intlProviderMockProps}>
              <Provider store={createStore(createReducer(), produce(store, identity))}>
                <Route path={routePath}>{children}</Route>
              </Provider>
            </IntlProvider>
          </MockedProvider>
        </ResponsiveThemeProvider>
      </HelmetProvider>
    </Router>
  );
};

export function makeContextRenderer<T>(component: (props: T | Record<string, never>) => ReactElement) {
  return (props?: T, context?: ContextData) =>
    render(component(props ?? {}), {
      wrapper: ({ children }) => <ProvidersWrapper context={context}>{children}</ProvidersWrapper>,
    });
}
export function makePropsRenderer<T>(component: (props: T | Record<string, never>) => ReactElement) {
  return (props?: T) => render(component(props ?? {}));
}

// using `screen.getByText(matchTextContent('hello world'))` will match <div>hello <span>world</span></div>
export const matchTextContent = (text: string) => (_: unknown, node: Nullish<Element>) => {
  const hasText = (node: Element) => node.textContent === text;
  const childrenDontHaveText = Array.from(node?.children ?? []).every((child) => !hasText(child));
  return Boolean(node && hasText(node) && childrenDontHaveText);
};
