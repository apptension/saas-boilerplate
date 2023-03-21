import { renderHook } from '../../../../tests/utils/rendering';
import { ErrorMessages } from '../../useApiForm.types';
import { useTranslatedErrors } from '../useTranslatedErrors.hook';

describe('useTranslatedErrors: Hook', () => {
  const render = (args?: ErrorMessages) => renderHook(() => useTranslatedErrors(args));

  describe('provided with custom messages', () => {
    const customMessages = { email: { CUSTOM_ERROR: 'custom error message' } };

    it('should return default translation if exists', async () => {
      const { result, waitForApolloMocks } = render(customMessages);
      await waitForApolloMocks();
      expect(result.current.translateErrorMessage('email', { code: 'CUSTOM_ERROR' })).toBe('custom error message');
    });

    it('should return input if no translation exists', async () => {
      const { result, waitForApolloMocks } = render(customMessages);
      await waitForApolloMocks();
      expect(result.current.translateErrorMessage('email', { code: 'NON_EXISTING_ERROR' })).toBe('NON_EXISTING_ERROR');
    });
  });
});
