import { RoutesConfig } from '../../../config/routes';
import { renderHook } from '../../../tests/utils/rendering';
import { useGenerateAbsoluteLocalePath } from '../useGenerateAbsoluteLocalePath';

jest.mock('../../../config/env', () => ({
  ENV: {
    WEB_APP_URL: 'http://localhost:3000',
  },
}));

describe('useGenerateAbsoluteLocalePath', () => {
  test('should generate an absolute locale path', async () => {
    const { result } = renderHook(() => useGenerateAbsoluteLocalePath());

    const url = result.current(RoutesConfig.signup);
    expect(url).toEqual('http://localhost:3000/en/auth/signup');
  });
});
