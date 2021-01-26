import 'core-js/stable';
import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom/extend-expect';
import 'isomorphic-fetch';
import 'jest-styled-components';
import axios from 'axios';
import MockDate from 'mockdate';

import './mocks/reactIntl';
import { server } from './mocks/server';

axios.defaults.adapter = require('axios/lib/adapters/http');

MockDate.set('2020-11-22');

jest.disableAutomock();

beforeAll(() => {
  server.listen({
    onUnhandledRequest(req) {
      console.error('Found an unhandled %s request to %s', req.method, req.url.href);
    },
  });
});

afterEach(() => server.resetHandlers());

afterAll(() => server.close());

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: Function.prototype,
      removeListener: Function.prototype,
    };
  };
