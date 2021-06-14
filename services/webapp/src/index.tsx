import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';

// Needed for redux-saga es6 generator support
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// Import all the third party stuff
import { Provider } from 'react-redux';
import { Router } from 'react-router';
// @ts-ignore
import FontFaceObserver from 'fontfaceobserver';
import 'normalize.css/normalize.css';
import './theme/global';
import configureStore from './config/store';
import browserHistory from './shared/utils/history';
import UnsupportedBrowserDetection from './shared/utils/unsupported/unsupportedBrowserDetection';
import { setUnsupportedClasses } from './shared/utils/unsupported/support';
import { setupStoreInterceptors } from './shared/services/api/client';
import { fontFamily } from './theme';

Sentry.init({ dsn: process.env.REACT_APP_SENTRY_DSN });

// Observe loading of primary font
const primaryFontObserver = new FontFaceObserver(fontFamily.primary, {});

// When Open Sans is loaded, add a font-family using Open Sans to the body
primaryFontObserver.load().then(
  () => {
    document.body.classList.add('fontLoaded');
  },
  () => {
    document.body.classList.remove('fontLoaded');
  }
);

// Create redux store with history
// this uses the singleton browserHistory provided by react-router
// Optionally, this could be changed to leverage a created history
// e.g. `const browserHistory = useRouterHistory(createBrowserHistory)();`
const initialState = {};
const store = configureStore(initialState);
setupStoreInterceptors(store);

const render = (): void => {
  const NextApp = require('./routes').default;

  const app = (
    <Provider store={store}>
      <Router history={browserHistory}>
        <NextApp />
      </Router>
    </Provider>
  );

  ReactDOM.render(
    process.env.REACT_APP_SENTRY_DSN ? (
      <Sentry.ErrorBoundary fallback={'An error has occurred'}>{app}</Sentry.ErrorBoundary>
    ) : (
      app
    ),
    document.getElementById('app')
  );
};

const initApp = async (): Promise<void> => {
  const detection = new UnsupportedBrowserDetection();
  if (!detection.isSupported()) {
    setUnsupportedClasses();
    return;
  }

  // Chunked polyfill for browsers without Intl support
  if (!window.Intl) {
    new Promise((resolve) => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      resolve(require('intl'));
    })
      .then(() => Promise.all([require('intl/locale-data/jsonp/en.js'), require('intl/locale-data/jsonp/pl.js')]))
      .then(() => render())
      .catch((err) => {
        throw err;
      });
  } else {
    render();
  }
};

initApp();
