import React, { ReactNode, ReactElement } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { render } from '@testing-library/react';
import { createStore } from 'redux';
import { identity } from 'ramda';
import { Provider } from 'react-redux';
import { createMemoryHistory, MemoryHistory } from 'history';
import { Route, Router } from 'react-router';
import { IntlProvider } from 'react-intl';
import produce from 'immer';

import { DEFAULT_LOCALE, translationMessages, MessagesObject } from '../../i18n';
import { store as fixturesStore } from '../../mocks/store';
import createReducer, { GlobalState } from '../../config/reducers';

export const PLACEHOLDER_TEST_ID = 'content';
export const PLACEHOLDER_CONTENT = <span data-testid="content">content</span>;

export const spiedHistory = (route = '/') => {
  const history = createMemoryHistory({ initialEntries: [route] });
  const pushSpy = jest.spyOn(history, 'push');
  return {
    history,
    pushSpy,
  };
};

interface ContextData {
  router?: {
    url?: string;
    routePath?: string;
    history?: MemoryHistory;
  };
  store?: GlobalState;
  messages?: MessagesObject;
}

interface ProvidersWrapperProps {
  children: ReactNode;
  context?: ContextData;
}

export const ProvidersWrapper = ({ children, context = {} }: ProvidersWrapperProps) => {
  const { router = {}, store = fixturesStore, messages } = context;
  const { url = `/${DEFAULT_LOCALE}`, routePath = '/:lang/', history } = router;

  const routerHistory: MemoryHistory = history ?? createMemoryHistory({ initialEntries: [url] });

  const intlProviderMockProps = {
    locale: DEFAULT_LOCALE,
    messages: messages ?? translationMessages[DEFAULT_LOCALE],
  };

  return (
    <Router history={routerHistory}>
      <HelmetProvider>
        <IntlProvider {...intlProviderMockProps}>
          <Provider store={createStore(createReducer(), produce(store, identity))}>
            <Route path={routePath}>{children}</Route>
          </Provider>
        </IntlProvider>
      </HelmetProvider>
    </Router>
  );
};

export const makeContextRenderer = <T, _>(component: (props: T | Record<string, never>) => ReactElement) => (
  props?: T,
  context?: ContextData
) =>
  render(component(props ?? {}), {
    wrapper: ({ children }) => <ProvidersWrapper context={context}>{children}</ProvidersWrapper>,
  });

export const makePropsRenderer = <T, _>(component: (props: T | Record<string, never>) => ReactElement) => (props?: T) =>
  render(component(props ?? {}));
