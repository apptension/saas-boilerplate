import { renderHook } from '@sb/webapp-core/tests/utils/rendering';

import { useGenerateAbsoluteLocalePath } from '../useGenerateAbsoluteLocalePath';

jest.mock('@sb/webapp-core/config/env', () => ({
  ENV: {
    WEB_APP_URL: 'http://localhost:3000',
  },
}));

describe('useGenerateAbsoluteLocalePath', () => {
  test('should generate an absolute locale path', () => {
    const generateAbsolutePath = renderHook(useGenerateAbsoluteLocalePath).result.current;

    const url = generateAbsolutePath(['subscriptions', 'index']);

    expect(url).toEqual('http://localhost:3000/en/subscriptions');
  });
});
