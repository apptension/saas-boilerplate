import 'core-js/stable';
import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom/extend-expect';
import 'isomorphic-fetch';
import 'jest-styled-components';
import axios from 'axios';
import MockDate from 'mockdate';
import './mocks/reactIntl';
import { RelayMockEnvironment } from 'relay-test-utils';
import { printDiffOrStringify, matcherHint } from 'jest-matcher-utils';
import { equals } from 'ramda';
import { server } from './mocks/server';

axios.defaults.adapter = require('axios/lib/adapters/http');

MockDate.set('2020-11-22');

jest.disableAutomock();

jest.mock('./app/config/store');
jest.mock('./shared/services/contentful/schema');
jest.mock('./shared/services/graphqlApi/schema');
jest.mock('./shared/services/graphqlApi/relayEnvironment');

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
