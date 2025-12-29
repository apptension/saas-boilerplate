import '@testing-library/jest-dom';
import 'core-js/stable';
import 'isomorphic-fetch';
import MockDate from 'mockdate';
import { identity } from 'ramda';
import 'regenerator-runtime/runtime';

import { ENV } from '../config/env';
import './mocks/icons';
import './mocks/reactIntl';

MockDate.set('2020-11-22');

jest.disableAutomock();

// Mock import.meta for Jest (Vite uses import.meta.env, but Jest runs in Node.js)
// We use a global mock that the getImportMeta helper can access
(globalThis as any).__importMetaMock = {
  env: {
    MODE: 'test',
    VITE_BASE_API_URL: '/api',
    VITE_ENVIRONMENT_NAME: 'test',
    VITE_SENTRY_DSN: '',
    VITE_WEB_APP_URL: 'http://localhost:5173',
    VITE_EMAIL_ASSETS_URL: '/email-assets',
    VITE_CONTENTFUL_SPACE: '',
    VITE_CONTENTFUL_ENV: '',
    VITE_CONTENTFUL_TOKEN: '',
    VITE_STRIPE_PUBLISHABLE_KEY: '',
    VITE_GOOGLE_ANALYTICS_TRACKING_ID: '',
    VITE_ENABLE_SSO: 'true',
    VITE_ENABLE_PASSKEYS: 'true',
    VITE_ENABLE_SOCIAL_LOGIN: 'true',
    VITE_ENABLE_PASSWORD_LOGIN: 'true',
    VITE_USE_REMOTE_TRANSLATIONS: 'false',
    VITE_TRANSLATIONS_URL: '/api/translations',
    VITE_TRANSLATIONS_POLLING: 'false',
  },
};

global.ResizeObserver = require('resize-observer-polyfill');

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: Function.prototype,
      removeListener: Function.prototype,
    };
  };

ENV.ENVIRONMENT_NAME = 'test';

window.HTMLElement.prototype.scrollIntoView = jest.fn();
window.HTMLElement.prototype.releasePointerCapture = jest.fn();
window.HTMLElement.prototype.hasPointerCapture = jest.fn();

const DELAY = 100;

const orignalGlobalImage = window.Image;

beforeAll(() => {
  (window.Image as any) = class MockImage {
    onload: () => void = identity<void>;
    src = '';
    constructor() {
      setTimeout(() => {
        this.onload();
      }, DELAY);
      return this;
    }
  };
});

afterAll(() => {
  window.Image = orignalGlobalImage;
});
