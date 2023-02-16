import 'core-js/stable';
import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';
import 'isomorphic-fetch';
import axios from 'axios';
import MockDate from 'mockdate';
import './mocks/reactIntl';
import './mocks/icons';

import { server } from './mocks/server'
// Establish API mocking before all tests.
beforeAll(() => server.listen())
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers())
// Clean up after the tests are finished.
afterAll(() => server.close())

axios.defaults.adapter = require('axios/lib/adapters/http');

MockDate.set('2020-11-22');

jest.disableAutomock();

jest.mock('./app/config/store');
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
