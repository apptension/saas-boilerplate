import '@testing-library/jest-dom';
import 'core-js/stable';
import 'isomorphic-fetch';
import MockDate from 'mockdate';
import 'regenerator-runtime/runtime';

import './mocks/reactIntl';
import './mocks/icons';

MockDate.set('2020-11-22');

jest.disableAutomock();

window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: Function.prototype,
      removeListener: Function.prototype,
    };
  };
