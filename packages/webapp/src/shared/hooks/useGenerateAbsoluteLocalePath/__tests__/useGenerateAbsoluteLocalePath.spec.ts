import { renderHook } from '../../../../tests/utils/rendering';
import { useGenerateAbsoluteLocalePath } from '../useGenerateAbsoluteLocalePath';

jest.mock('@sb/webapp-core/config/env', () => ({
  ENV: {
    WEB_APP_URL: 'http://localhost:3000',
  },
}));

describe('useGenerateAbsoluteLocalePath', () => {
  test('should generate an absolute locale path', async () => {
    const { result, waitForApolloMocks } = renderHook(() => useGenerateAbsoluteLocalePath());
    await waitForApolloMocks();

    const url = result.current(['subscriptions', 'index']);
    expect(url).toEqual('http://localhost:3000/en/subscriptions');
  });
});
