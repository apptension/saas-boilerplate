import 'core-js/stable';
import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';
import 'isomorphic-fetch';
import axios from 'axios';
import MockDate from 'mockdate';
import './mocks/reactIntl';
import './mocks/icons';
import { RelayMockEnvironment } from 'relay-test-utils';
import { printDiffOrStringify, matcherHint } from 'jest-matcher-utils';
import { equals } from 'ramda';

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
jest.mock('./shared/services/graphqlApi/relayEnvironment');

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: Function.prototype,
      removeListener: Function.prototype,
    };
  };

expect.extend({
  toHaveOperation(relayEnvironment: RelayMockEnvironment, operationName: string) {
    const pass = relayEnvironment.mock
      .getAllOperations()
      .some((operation) => operation.fragment.node.name === operationName);

    return {
      pass,
      message: () =>
        ['Expected environment', pass ? 'not' : null, `to have operation named ${operationName}`]
          .filter(Boolean)
          .join(' '),
    };
  },

  toHaveLatestOperation(relayEnvironment: RelayMockEnvironment, operationName: string) {
    const latestOperationName = relayEnvironment.mock.getMostRecentOperation().fragment.node.name;
    const pass = latestOperationName === operationName;

    return {
      pass,
      message: pass
        ? () => `Expected most recent operation not to be named ${operationName}`
        : () => `Expected most recent operation to be named ${operationName}, received ${latestOperationName}`,
    };
  },

  toLatestOperationInputEqual(relayEnvironment: RelayMockEnvironment, input: Record<string, string>) {
    const latestOperationInput = relayEnvironment.mock.getMostRecentOperation().fragment.variables.input;
    const pass = equals(input, latestOperationInput);

    const options = {
      comment: 'deep equality',
      isNot: this.isNot,
      promise: this.promise,
    };

    return {
      pass,
      message: () =>
        matcherHint('toLatestOperationInputEqual', undefined, undefined, options) +
        '\n\n' +
        printDiffOrStringify(input, latestOperationInput, 'Expected', 'Received', false),
    };
  },
});
