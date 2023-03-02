import '@testing-library/jest-dom';
import axios from 'axios';
import 'core-js/stable';
import 'isomorphic-fetch';
import MockDate from 'mockdate';
import 'regenerator-runtime/runtime';

import './mocks/icons';
import './mocks/reactIntl';
import { server } from './mocks/server';

// Establish API mocking before all tests.
beforeAll(() => server.listen());
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished.
afterAll(() => server.close());

axios.defaults.adapter = require('axios/lib/adapters/http');

MockDate.set('2020-11-22');

jest.disableAutomock();

jest.mock('./shared/services/contentful/schema');
jest.mock('./shared/services/graphqlApi/schema');

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: Function.prototype,
      removeListener: Function.prototype,
    };
  };
