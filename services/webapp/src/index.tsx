import React from 'react';
import ReactDOM from 'react-dom';

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

// Observe loading of Open Sans (to remove open sans, remove the <link> tag in
// the index.html file and this observer)
const openSansObserver = new FontFaceObserver('Open Sans', {});

// When Open Sans is loaded, add a font-family using Open Sans to the body
openSansObserver.load().then(
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

const render = (): void => {
  const NextApp = require('./routes').default;

  ReactDOM.render(
    <Provider store={store}>
      <Router history={browserHistory}>
        <NextApp />
      </Router>
    </Provider>,
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
