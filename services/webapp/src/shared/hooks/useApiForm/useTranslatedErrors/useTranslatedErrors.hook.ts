import { useIntl } from 'react-intl';
import { useCallback, useMemo } from 'react';
import { ErrorMessages } from './useTranslatedErrors.types';

export const useTranslatedErrors = (customMessages: ErrorMessages = {}) => {
  const intl = useIntl();

  const messages = useMemo(() => {
    const defaultMessages: ErrorMessages = {
      INVALID_CREDENTIALS: intl.formatMessage({
        description: 'Form Error / Invalid credentials',
        defaultMessage: 'Provided email or password is invalid.',
      }),
    };

    return {
      ...defaultMessages,
      ...customMessages,
    };
  }, [customMessages, intl]);

  const translateErrorMessage = useCallback((error?: string) => (error ? messages[error] ?? error : error), [messages]);

  return { translateErrorMessage };
};
