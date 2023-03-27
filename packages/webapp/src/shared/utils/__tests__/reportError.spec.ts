import * as Sentry from '@sentry/react';

import { reportError } from '@sb/webapp-core/utils/reportError';

describe('reportError', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should log error when it is non-test environment', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    const error = new Error('Test error');

    process.env.NODE_ENV = 'development';

    reportError(error);

    expect(consoleSpy).toHaveBeenCalledWith(error);
    consoleSpy.mockRestore();
  });

  it('should not log error when it is test environment', () => {
    const consoleSpy = jest.spyOn(console, 'error');
    const error = new Error('Test error');

    process.env.NODE_ENV = 'test';

    reportError(error);

    expect(consoleSpy).not.toHaveBeenCalledWith(error);
    consoleSpy.mockRestore();
  });

  it('should capture exception with Sentry', () => {
    const sentrySpy = jest.spyOn(Sentry, 'captureException');
    const error = new Error('Test error');

    process.env.NODE_ENV = 'development';

    reportError(error);

    expect(sentrySpy).toHaveBeenCalledWith(error);
    sentrySpy.mockRestore();
  });
});
