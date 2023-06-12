import '@testing-library/jest-dom';
import 'core-js/stable';
import 'isomorphic-fetch';
import MockDate from 'mockdate';
import 'regenerator-runtime/runtime';

import { ENV } from '../config/env';
import './mocks/icons';
import './mocks/reactIntl';

MockDate.set('2020-11-22');

jest.disableAutomock();

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
