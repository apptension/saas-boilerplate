import '@testing-library/jest-dom';
import 'core-js/stable';
import 'isomorphic-fetch';
import MockDate from 'mockdate';
import { identity } from 'ramda';
import 'regenerator-runtime/runtime';

import { ENV } from '../config/env';
import './mocks/icons';
import './mocks/reactIntl';

// Polyfill TextEncoder/TextDecoder for Jest environment (required by react-router-dom)
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Suppress unhandled AbortError from Apollo Client when React 19 strict mode causes component unmount
// This is expected behavior in tests and should not cause test failures
const originalOnUnhandledRejection = process.listeners('unhandledRejection')[0];
process.removeAllListeners('unhandledRejection');
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  // Suppress AbortError which is expected in React 19 strict mode with Apollo Client
  if (reason?.name === 'AbortError' || (reason instanceof DOMException && reason.name === 'AbortError')) {
    return;
  }
  // Re-throw other unhandled rejections
  if (originalOnUnhandledRejection) {
    (originalOnUnhandledRejection as any)(reason, promise);
  } else {
    throw reason;
  }
});

// Also handle uncaught exceptions for DOMException which can be thrown synchronously
const originalOnUncaughtException = process.listeners('uncaughtException')[0];
process.removeAllListeners('uncaughtException');
process.on('uncaughtException', (error: any) => {
  // Suppress AbortError DOMException which is expected in React 19 strict mode
  if (error instanceof DOMException && error.name === 'AbortError') {
    return;
  }
  // Re-throw other errors
  if (originalOnUncaughtException) {
    (originalOnUncaughtException as any)(error);
  } else {
    throw error;
  }
});

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

// Mock addEventListener for HTMLImageElement (required by Radix UI Avatar)
// Radix UI Avatar uses addEventListener('load') and addEventListener('error') on image elements
const imageEventListeners = new WeakMap<HTMLImageElement, Map<string, Set<() => void>>>();

Object.defineProperty(HTMLImageElement.prototype, 'addEventListener', {
  value: function (this: HTMLImageElement, event: string, handler: (event: Event) => void) {
    if (!imageEventListeners.has(this)) {
      imageEventListeners.set(this, new Map());
    }
    const listeners = imageEventListeners.get(this)!;
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event)!.add(handler);

    // Automatically trigger 'load' event after a short delay to simulate successful image load
    // Radix UI Avatar.Image creates image element and adds listener before setting src
    // So we need to trigger load event regardless of src state
    if (event === 'load') {
      const img = this;
      setTimeout(() => {
        // Create a proper Event object with target set to the image element
        const loadEvent = new Event('load');
        Object.defineProperty(loadEvent, 'target', { value: img, writable: false });
        Object.defineProperty(loadEvent, 'currentTarget', { value: img, writable: false });
        handler(loadEvent);
      }, 50);
    }
  },
  writable: true,
  configurable: true,
});

Object.defineProperty(HTMLImageElement.prototype, 'removeEventListener', {
  value: function (this: HTMLImageElement, event: string, handler: () => void) {
    const listeners = imageEventListeners.get(this);
    if (listeners) {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(handler);
      }
    }
  },
  writable: true,
  configurable: true,
});

const DELAY = 50;

const orignalGlobalImage = window.Image;

beforeAll(() => {
  (window.Image as any) = class MockImage {
    onload: () => void = identity<void>;
    onerror: () => void = identity<void>;
    src = '';
    private loadListeners: Array<(event: Event) => void> = [];
    
    addEventListener = (event: string, handler: (event: Event) => void) => {
      if (event === 'load') {
        this.loadListeners.push(handler);
        // Trigger load event after a short delay
        setTimeout(() => {
          const loadEvent = new Event('load');
          Object.defineProperty(loadEvent, 'target', { value: this, writable: false });
          Object.defineProperty(loadEvent, 'currentTarget', { value: this, writable: false });
          handler(loadEvent);
        }, DELAY);
      }
    };
    
    removeEventListener = jest.fn();
    
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
