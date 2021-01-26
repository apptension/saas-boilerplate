import React from 'react';

const mockReactIntl = jest.requireActual('react-intl');
const { FormattedMessage, useIntl } = mockReactIntl;

const mockFormattedMessage = (props: Record<string, unknown>) => <FormattedMessage id="mock-message-id" {...props} />;
const mockUseIntl = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { formatMessage, ...other } = useIntl();

  return {
    ...other,
    formatMessage: (params: any) => {
      return formatMessage({ ...params, id: 'mock-message-id' });
    },
  };
};
jest.mock('react-intl', () => ({
  ...mockReactIntl,
  useIntl: mockUseIntl,
  FormattedMessage: mockFormattedMessage,
}));
