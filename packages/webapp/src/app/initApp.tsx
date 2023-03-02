import { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import 'regenerator-runtime/runtime';

import {
  ApolloProvider,
  CommonQuery,
  LocalesProvider,
  RouterProvider,
  SentryProvider,
  SnackbarProvider,
} from './providers';
import { setUnsupportedClasses } from './unsupported/support';
import { UnsupportedBrowserDetection } from './unsupported/unsupportedBrowserDetection';

const render = () => {
  const App = lazy(() => import('./app.component'));

  const container = document.getElementById('root');
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const root = createRoot(container!);

  root.render(
    <SentryProvider>
      <LocalesProvider>
        <SnackbarProvider>
          <RouterProvider>
            <HelmetProvider>
              <ApolloProvider>
                <CommonQuery>
                  <Suspense>
                    <App />
                  </Suspense>
                </CommonQuery>
              </ApolloProvider>
            </HelmetProvider>
          </RouterProvider>
        </SnackbarProvider>
      </LocalesProvider>
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
      // @ts-ignore
      .then(() => Promise.all([import('intl/locale-data/jsonp/en.js'), import('intl/locale-data/jsonp/pl.js')]))
      .then(() => render())
      .catch((err) => {
        throw err;
      });
  } else {
    render();
  }
};
