import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';

// Needed for redux-saga es6 generator support
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import { setUnsupportedClasses } from './unsupported/support';
import { UnsupportedBrowserDetection } from './unsupported/unsupportedBrowserDetection';
import { SentryProvider } from './providers/sentry';
import { ReduxProvider } from './providers/redux';
import { RelayProvider } from './providers/relay';
import { CommonQuery } from './providers/commonQuery';
import { RouterProvider } from './providers/router';

const render = () => {
  const { App } = require('./app.component');

  const container = document.getElementById('app');
  const root = createRoot(container!);
  root.render(
    <SentryProvider>
      <ReduxProvider>
        <RouterProvider>
          <HelmetProvider>
            <RelayProvider>
              <CommonQuery>
                <App />
              </CommonQuery>
            </RelayProvider>
          </HelmetProvider>
        </RouterProvider>
      </ReduxProvider>
    </SentryProvider>
  );
};

export const initApp = async () => {
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
