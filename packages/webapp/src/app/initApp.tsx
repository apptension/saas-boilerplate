import { GTM } from '@sb/webapp-core/components/gtm';
import { LocalesProvider, ThemeProvider } from '@sb/webapp-core/providers';
import { ToastProvider } from '@sb/webapp-core/toast';
import { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import 'regenerator-runtime/runtime';

import { ApiProvider, RouterProvider, SentryProvider } from './providers';

const render = () => {
  const App = lazy(() => import('./app.component'));

  const container = document.getElementById('root');
  const root = createRoot(container!);

  root.render(
    <SentryProvider>
      <LocalesProvider>
        <ThemeProvider>
          <ToastProvider>
            <RouterProvider>
              <HelmetProvider>
                <ApiProvider>
                  <Suspense>
                    <App />
                  </Suspense>
                  <GTM />
                </ApiProvider>
              </HelmetProvider>
            </RouterProvider>
          </ToastProvider>
        </ThemeProvider>
      </LocalesProvider>
    </SentryProvider>
  );
};

export const initApp = async () => {
  // Chunked polyfill for browsers without Intl support
  if (!window.Intl) {
    Promise.resolve(require('intl'))
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
